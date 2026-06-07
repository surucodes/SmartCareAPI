using System.Text.RegularExpressions;
using MongoDB.Bson;
using MongoDB.Driver;
using SmartCare.API.Interfaces;
using SmartCare.API.Models;

namespace SmartCare.API.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly IMongoCollection<Appointment> _appointments;
    private readonly MongoClient _client;

    private static DateTime IstNow =>
        TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Asia/Kolkata");

    public AppointmentRepository(IConfiguration config)
    {
        _client = new MongoClient(config["MongoDbSettings:ConnectionString"]);
        var database = _client.GetDatabase(config["MongoDbSettings:DatabaseName"]);
        _appointments = database.GetCollection<Appointment>("appointments");
        EnsureIndexes();
    }

    private void EnsureIndexes()
    {
        // Primary query path: slot availability + atomic booking checks
        _appointments.Indexes.CreateOne(new CreateIndexModel<Appointment>(
            Builders<Appointment>.IndexKeys
                .Ascending(a => a.DoctorId)
                .Ascending(a => a.Date)
                .Ascending(a => a.Status),
            new CreateIndexOptions { Name = "doctorId_date_status" }));

        // Patient self-service lookup (ownership check by id + phone)
        _appointments.Indexes.CreateOne(new CreateIndexModel<Appointment>(
            Builders<Appointment>.IndexKeys
                .Ascending(a => a.Id)
                .Ascending(a => a.PatientPhone),
            new CreateIndexOptions { Name = "id_patientPhone" }));

        // NoShow bulk-update query (date + status scan)
        _appointments.Indexes.CreateOne(new CreateIndexModel<Appointment>(
            Builders<Appointment>.IndexKeys
                .Ascending(a => a.Date)
                .Ascending(a => a.Status),
            new CreateIndexOptions { Name = "date_status" }));
    }

    public async Task<List<Appointment>> GetAllAsync(bool includePast = false)
    {
        if (includePast)
            return await _appointments.Find(_ => true).ToListAsync();

        var today = IstNow.ToString("yyyy-MM-dd");
        var filter = Builders<Appointment>.Filter.Gte(a => a.Date, today);
        return await _appointments.Find(filter).ToListAsync();
    }

    public async Task<List<Appointment>> GetByDoctorAsync(string doctorId, bool includePast = false)
    {
        if (includePast)
            return await _appointments.Find(a => a.DoctorId == doctorId).ToListAsync();

        var today = IstNow.ToString("yyyy-MM-dd");
        var filter = Builders<Appointment>.Filter.And(
            Builders<Appointment>.Filter.Eq(a => a.DoctorId, doctorId),
            Builders<Appointment>.Filter.Gte(a => a.Date, today)
        );
        return await _appointments.Find(filter).ToListAsync();
    }

    // Returns all appointments for a doctor on a specific date except those whose status
    // is Cancelled or NoShow — those statuses free the slot so are not relevant for
    // capacity/conflict calculations.
    public async Task<List<Appointment>> GetByDoctorAndDateAsync(string doctorId, string date)
    {
        var filter = Builders<Appointment>.Filter.And(
            Builders<Appointment>.Filter.Eq(a => a.DoctorId, doctorId),
            Builders<Appointment>.Filter.Eq(a => a.Date, date),
            Builders<Appointment>.Filter.Nin(a => a.Status,
                new[] { AppointmentStatus.Cancelled, AppointmentStatus.NoShow })
        );
        return await _appointments.Find(filter).ToListAsync();
    }

    public async Task<Appointment?> GetByIdAsync(string id) =>
        await _appointments.Find(a => a.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(Appointment appointment) =>
        await _appointments.InsertOneAsync(appointment);

    // Transactional booking: count existing slot-blocking bookings then insert in the
    // same session. Strict policy → 1 max. Flexible policy → up to slotCapacity. Counts
    // only Pending + Confirmed (Cancelled / NoShow / Completed all free the slot).
    public async Task<(bool success, int queuePosition, string? errorMessage)>
        CreateAtomicAsync(Appointment appointment, string schedulingPolicy, int slotCapacity)
    {
        using var session = await _client.StartSessionAsync();
        session.StartTransaction();
        try
        {
            var filter = Builders<Appointment>.Filter.And(
                Builders<Appointment>.Filter.Eq(a => a.DoctorId, appointment.DoctorId),
                Builders<Appointment>.Filter.Eq(a => a.Date, appointment.Date),
                Builders<Appointment>.Filter.Eq(a => a.Slot, appointment.Slot),
                Builders<Appointment>.Filter.In(a => a.Status,
                    new[] { AppointmentStatus.Pending, AppointmentStatus.Confirmed })
            );

            var existingCount = await _appointments
                .CountDocumentsAsync(session, filter);

            if (schedulingPolicy == "Strict" && existingCount >= 1)
            {
                await session.AbortTransactionAsync();
                return (false, 0,
                    "This time is already requested by another patient. " +
                    "Please choose a different slot.");
            }

            if (existingCount >= slotCapacity)
            {
                await session.AbortTransactionAsync();
                return (false, 0,
                    "This slot is fully booked. Please choose a different time.");
            }

            // Secondary check: is this slot's start time inside a FULL adjacent slot's
            // occupied time window? Slot capacity uses exact slot string match, but a
            // full slot with a long consultation duration still occupies real clock time
            // and must block bookings that fall inside it.
            var allBookingsToday = await _appointments
                .Find(session, Builders<Appointment>.Filter.And(
                    Builders<Appointment>.Filter.Eq(a => a.DoctorId, appointment.DoctorId),
                    Builders<Appointment>.Filter.Eq(a => a.Date, appointment.Date),
                    Builders<Appointment>.Filter.In(a => a.Status,
                        new[] { AppointmentStatus.Pending, AppointmentStatus.Confirmed })
                ))
                .ToListAsync();

            var newSlotTime = TimeOnly.Parse(appointment.Slot);

            // Group by slot string, take only FULL slots (other than the one being booked),
            // and build their occupied ranges using the longest (duration + buffer) at each
            // slot. Buffer is room-turnover time and must also be blocked.
            // Legacy bookings without ConsultationDurationMinutes default to 15 min / 5 min buffer.
            var occupiedRanges = allBookingsToday
                .GroupBy(b => b.Slot)
                .Where(g => g.Key != appointment.Slot)
                .Where(g => g.Count() >= slotCapacity)
                .Select(g =>
                {
                    var slotStart = TimeOnly.Parse(g.Key);
                    var maxDuration = g.Max(b => b.ConsultationDurationMinutes ?? 15);
                    var maxBuffer = g.Max(b => b.ConsultationBufferMinutes ?? 5);
                    return (start: slotStart, end: slotStart.AddMinutes(maxDuration + maxBuffer));
                })
                .ToList();

            var isBlocked = occupiedRanges.Any(r =>
                newSlotTime >= r.start && newSlotTime < r.end);

            if (isBlocked)
            {
                await session.AbortTransactionAsync();
                return (false, 0,
                    "This time falls within a confirmed appointment window. " +
                    "Please choose a different time.");
            }

            appointment.QueuePosition = (int)existingCount + 1;
            await _appointments.InsertOneAsync(session, appointment);
            await session.CommitTransactionAsync();

            return (true, appointment.QueuePosition, null);
        }
        catch (Exception)
        {
            await session.AbortTransactionAsync();
            throw;
        }
    }

    public async Task UpdateStatusAsync(string id, AppointmentStatus status)
    {
        var update = Builders<Appointment>.Update.Set(a => a.Status, status);
        await _appointments.UpdateOneAsync(a => a.Id == id, update);
    }

    public async Task CancelAsync(string id, string reason, string cancelledBy, DateTime cancelledAt)
    {
        var update = Builders<Appointment>.Update
            .Set(a => a.Status, AppointmentStatus.Cancelled)
            .Set(a => a.CancellationReason, reason)
            .Set(a => a.CancelledBy, cancelledBy)
            .Set(a => a.CancelledAt, cancelledAt);
        await _appointments.UpdateOneAsync(a => a.Id == id, update);
    }

    public async Task<Appointment?> GetByIdAndPhoneAsync(string id, string phone) =>
        await _appointments.Find(a => a.Id == id && a.PatientPhone == phone).FirstOrDefaultAsync();

    public async Task<bool> ExistsActiveBookingAsync(string doctorId, string date, string slot, string phone)
    {
        var filter = Builders<Appointment>.Filter.And(
            Builders<Appointment>.Filter.Eq(a => a.DoctorId, doctorId),
            Builders<Appointment>.Filter.Eq(a => a.Date, date),
            Builders<Appointment>.Filter.Eq(a => a.Slot, slot),
            Builders<Appointment>.Filter.Eq(a => a.PatientPhone, phone),
            Builders<Appointment>.Filter.In(a => a.Status,
                new[] { AppointmentStatus.Pending, AppointmentStatus.Confirmed })
        );
        return await _appointments.Find(filter).AnyAsync();
    }

    public async Task<List<Appointment>> SearchAsync(string query, bool includePast = false)
    {
        var escaped = Regex.Escape(query);
        var searchFilter = Builders<Appointment>.Filter.Or(
            Builders<Appointment>.Filter.Regex(
                a => a.PatientName, new BsonRegularExpression(escaped, "i")),
            Builders<Appointment>.Filter.Regex(
                a => a.PatientPhone, new BsonRegularExpression(escaped, "i"))
        );

        FilterDefinition<Appointment> finalFilter;
        if (!includePast)
        {
            var today = IstNow.ToString("yyyy-MM-dd");
            finalFilter = Builders<Appointment>.Filter.And(
                Builders<Appointment>.Filter.Gte(a => a.Date, today),
                searchFilter);
        }
        else
        {
            finalFilter = searchFilter;
        }

        return await _appointments.Find(finalFilter)
            .SortByDescending(a => a.Date)
            .ThenBy(a => a.Slot)
            .ToListAsync();
    }

    public async Task<int> MarkExpiredAsNoShowAsync()
    {
        var today = IstNow.ToString("yyyy-MM-dd");
        // Exclude patients who physically checked in — they attended and must not be
        // auto-transitioned to NoShow. Only truly absent past appointments qualify.
        var filter = Builders<Appointment>.Filter.And(
            Builders<Appointment>.Filter.Lt(a => a.Date, today),
            Builders<Appointment>.Filter.In(a => a.Status,
                new[] { AppointmentStatus.Pending, AppointmentStatus.Confirmed }),
            Builders<Appointment>.Filter.Eq(a => a.CheckedInAt, null)
        );
        var update = Builders<Appointment>.Update.Set(a => a.Status, AppointmentStatus.NoShow);
        var result = await _appointments.UpdateManyAsync(filter, update);
        return (int)result.ModifiedCount;
    }

    public async Task CheckInAsync(string id, DateTime checkedInAt)
    {
        var update = Builders<Appointment>.Update.Set(a => a.CheckedInAt, checkedInAt);
        await _appointments.UpdateOneAsync(a => a.Id == id, update);
    }
}
