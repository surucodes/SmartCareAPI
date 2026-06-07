using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCare.API.Interfaces;
using SmartCare.API.Models;

namespace SmartCare.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public partial class DoctorsController : ControllerBase
    {
        private readonly IDoctorRepository _repo;
        private readonly IConsultationTypeRepository _consultationTypes;
        private readonly IAppointmentRepository _appointments;
        private readonly ILogger<DoctorsController> _logger;

        public DoctorsController(
            IDoctorRepository repo,
            IConsultationTypeRepository consultationTypes,
            IAppointmentRepository appointments,
            ILogger<DoctorsController> logger)
        {
            _repo = repo;
            _consultationTypes = consultationTypes;
            _appointments = appointments;
            _logger = logger;
        }

        private static DateTime IstNow =>
            TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Asia/Kolkata");

        [HttpGet]
        public async Task<ActionResult<List<Doctor>>> GetAll()
        {
            var doctors = await _repo.GetAllAsync();
            return Ok(doctors);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Doctor>> GetById(string id)
        {
            var doctor = await _repo.GetByIdAsync(id);
            if (doctor is null)
            {
                LogDoctorNotFound(_logger, id);
                return NotFound(new { error = "Doctor not found" });
            }
            return Ok(doctor);
        }

        // Public — no auth required. Frontend uses this to populate the booking form's
        // consultation type dropdown.
        [HttpGet("{id}/consultation-types")]
        public async Task<ActionResult<List<ConsultationType>>> GetConsultationTypes(string id)
        {
            var doctor = await _repo.GetByIdAsync(id);
            if (doctor is null)
                return NotFound(new { error = "Doctor not found" });

            var types = await _consultationTypes.GetByDoctorAsync(id);
            return Ok(types);
        }

        // Public — no auth required. Returns slot grid for a date with break-aware
        // generation and live booking counts. Frontend renders the time grid from this.
        [HttpGet("{id}/available-slots")]
        public async Task<ActionResult> GetAvailableSlots(
            string id,
            [FromQuery] string date,
            [FromQuery] string? consultationTypeId)
        {
            if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", out var parsedDate))
                return BadRequest(new { error = "Date must be in yyyy-MM-dd format" });

            if (parsedDate < DateOnly.FromDateTime(IstNow))
                return BadRequest(new { error = "Cannot query slots for past dates" });

            var doctor = await _repo.GetByIdAsync(id);
            if (doctor is null)
                return NotFound(new { error = "Doctor not found" });

            if (!doctor.IsActive)
                return NotFound(new { error = "Doctor is not currently available" });

            var daySchedule = GetDaySchedule(doctor, parsedDate.DayOfWeek);
            if (daySchedule is null)
            {
                return Ok(new
                {
                    slots = Array.Empty<object>(),
                    available = false,
                    message = $"Doctor is not available on {parsedDate.DayOfWeek}s"
                });
            }

            int duration = 15;
            int buffer = 5;
            string? ctName = null;

            if (!string.IsNullOrWhiteSpace(consultationTypeId))
            {
                var ct = await _consultationTypes.GetByIdAsync(consultationTypeId);
                if (ct is null)
                    return BadRequest(new { error = "Consultation type not found" });

                duration = ct.DurationMinutes;
                buffer = ct.BufferMinutes;
                ctName = ct.Name;
            }

            // Generate candidate slots, stepping by (duration + buffer) from Start to End.
            // Skip any slot that would extend past End or overlap any break.
            var scheduleStart = TimeOnly.Parse(daySchedule.Start);
            var scheduleEnd = TimeOnly.Parse(daySchedule.End);
            var breakRanges = daySchedule.Breaks
                .Select(b => (Start: TimeOnly.Parse(b.Start), End: TimeOnly.Parse(b.End)))
                .ToList();

            var step = duration + buffer;
            var candidateSlots = new List<string>();
            var current = scheduleStart;

            // When the date is today in IST, drop slots whose start time has already passed
            // in IST. Clinic and patients operate on IST — UTC would produce the wrong cutoff.
            TimeOnly? nowTimeIst = parsedDate == DateOnly.FromDateTime(IstNow)
                ? TimeOnly.FromDateTime(IstNow)
                : null;

            while (current.AddMinutes(duration) <= scheduleEnd)
            {
                var slotEnd = current.AddMinutes(duration);
                bool overlapsBreak = breakRanges.Any(b => current < b.End && slotEnd > b.Start);
                bool isPast = nowTimeIst.HasValue && current <= nowTimeIst.Value;
                if (!overlapsBreak && !isPast)
                    candidateSlots.Add(current.ToString("HH:mm"));

                current = current.AddMinutes(step);
            }

            // Fetch existing bookings for capacity calculation. Only Pending + Confirmed
            // count toward slot occupancy (matches CreateAtomicAsync).
            var bookings = await _appointments.GetByDoctorAndDateAsync(id, date);
            var activeBookings = bookings
                .Where(b => b.Status == AppointmentStatus.Pending || b.Status == AppointmentStatus.Confirmed)
                .ToList();

            var capacity = doctor.SlotCapacity;

            // Build occupied ranges only from FULL slot strings. A Limited slot (has
            // bookings but under capacity) does NOT block other slots — it still has
            // capacity itself. Legacy bookings without ConsultationDurationMinutes
            // default to 15 minutes.
            var occupiedRanges = activeBookings
                .GroupBy(b => b.Slot)
                .Where(g => g.Count() >= capacity)
                .Select(g =>
                {
                    var slotStart = TimeOnly.Parse(g.Key);
                    var maxDuration = g.Max(b => b.ConsultationDurationMinutes ?? 15);
                    // Include buffer so the room-turnover time is also blocked.
                    return (start: slotStart, end: slotStart.AddMinutes(maxDuration + buffer));
                })
                .ToList();

            var slotResults = candidateSlots.Select(slotTimeStr =>
            {
                var candidateTime = TimeOnly.Parse(slotTimeStr);
                var countAtThisSlot = activeBookings.Count(b => b.Slot == slotTimeStr);

                var isInsideOccupied = occupiedRanges.Any(r =>
                    candidateTime >= r.start && candidateTime < r.end);

                if (isInsideOccupied)
                    return (object)new { time = slotTimeStr, status = "Unavailable" };

                if (countAtThisSlot >= capacity)
                    return new { time = slotTimeStr, status = "Unavailable" };

                if (countAtThisSlot > 0)
                    return new
                    {
                        time = slotTimeStr,
                        status = "Limited",
                        bookingsCount = countAtThisSlot,
                        capacity
                    };

                return new { time = slotTimeStr, status = "Available" };
            }).ToList();

            return Ok(new
            {
                doctorId = doctor.Id,
                doctorName = doctor.Name,
                date,
                dayOfWeek = parsedDate.DayOfWeek.ToString(),
                consultationDurationMinutes = duration,
                bufferMinutes = buffer,
                consultationTypeName = ctName,
                emergencyOnly = daySchedule.EmergencyOnly,
                emergencyMessage = daySchedule.EmergencyOnly
                    ? "This day is for emergency appointments only. By booking you confirm this is urgent."
                    : null,
                slots = slotResults
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult> Create(Doctor doctor)
        {
            if (string.IsNullOrWhiteSpace(doctor.Name) || string.IsNullOrWhiteSpace(doctor.Specialty))
                return BadRequest(new { error = "Doctor Name and Specialty are required" });

            await _repo.CreateAsync(doctor);
            LogDoctorCreated(_logger, doctor.Name, doctor.Specialty);
            return CreatedAtAction(nameof(GetById), new { id = doctor.Id }, doctor);
        }

        // Drops and rebuilds the doctors collection so the schema change from the old
        // AvailableSlots model is handled cleanly. This is intentionally destructive —
        // used during migration; we accept the loss of idempotency for now.
        [Authorize(Roles = "Admin")]
        [HttpPost("seed")]
        public async Task<ActionResult> Seed()
        {
            await _repo.DropCollectionAsync();
            LogDoctorsCollectionDropped(_logger);

            var varunWorkingDay = new DaySchedule
            {
                Start = "10:00",
                End = "20:30",
                EmergencyOnly = false,
                Breaks = new List<BreakPeriod>
                {
                    new() { Start = "15:00", End = "17:00", Reason = "Lunch Break" }
                }
            };

            var varun = new Doctor
            {
                Name = "Dr. Prasanna N.M",
                Specialty = "Orthopaedic Surgeon",
                Bio = "Dr. Prasanna N.M is a senior Orthopaedic Surgeon with over 25 years of experience in joint replacement, trauma, fracture management, and sports injuries. He is a founding physician at Spandana Hospital and is known for his patient-first approach and precision in complex surgical cases.",
                SchedulingPolicy = "Flexible",
                SlotCapacity = 3,
                IsActive = true,
                Monday = varunWorkingDay,
                Tuesday = varunWorkingDay,
                Wednesday = varunWorkingDay,
                Thursday = varunWorkingDay,
                Friday = varunWorkingDay,
                Saturday = varunWorkingDay,
                Sunday = new DaySchedule
                {
                    Start = "10:00",
                    End = "13:00",
                    EmergencyOnly = true,
                    Breaks = new List<BreakPeriod>()
                }
            };

            var vinayaWeekday = new DaySchedule
            {
                Start = "10:30",
                End = "15:00",
                EmergencyOnly = false,
                Breaks = new List<BreakPeriod>()
            };

            var vinaya = new Doctor
            {
                Name = "Dr. Lakshmi Hegde",
                Specialty = "Gynaecologist",
                Bio = "Dr. Lakshmi Hegde is a specialist in Gynaecology and Women's Health with over 25 years of clinical experience. A founding physician at Spandana Hospital, she is deeply committed to personalised women's healthcare and has guided thousands of families through every stage of women's health.",
                SchedulingPolicy = "Strict",
                SlotCapacity = 1,
                IsActive = true,
                Monday = vinayaWeekday,
                Tuesday = vinayaWeekday,
                Wednesday = vinayaWeekday,
                Thursday = vinayaWeekday,
                Friday = vinayaWeekday,
                Saturday = new DaySchedule
                {
                    Start = "10:30",
                    End = "13:00",
                    EmergencyOnly = false,
                    Breaks = new List<BreakPeriod>()
                },
                Sunday = null
            };

            var doctors = new List<Doctor> { varun, vinaya };
            await _repo.InsertManyAsync(doctors);
            LogSeeded(_logger, doctors.Count);
            return Ok(new { message = $"Seeded {doctors.Count} doctors successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("seed-consultation-types")]
        public async Task<ActionResult> SeedConsultationTypes()
        {
            await _consultationTypes.DropCollectionAsync();

            var doctors = await _repo.GetAllAsync();
            var varun = doctors.FirstOrDefault(d => d.Name == "Dr. Prasanna N.M");
            var vinaya = doctors.FirstOrDefault(d => d.Name == "Dr. Lakshmi Hegde");

            if (varun is null || vinaya is null)
                return BadRequest(new { error = "Doctors must be seeded before consultation types" });

            var types = new List<ConsultationType>
            {
                new() { DoctorId = varun.Id!,  Name = "Routine Checkup",   DurationMinutes = 10, BufferMinutes = 5  },
                new() { DoctorId = varun.Id!,  Name = "Fracture / Injury", DurationMinutes = 30, BufferMinutes = 10 },
                new() { DoctorId = varun.Id!,  Name = "Post-Op Review",    DurationMinutes = 20, BufferMinutes = 5  },
                new() { DoctorId = varun.Id!,  Name = "Follow-Up",         DurationMinutes = 15, BufferMinutes = 5  },
                new() { DoctorId = varun.Id!,  Name = "Other",             DurationMinutes = 10, BufferMinutes = 5  },

                new() { DoctorId = vinaya.Id!, Name = "First Visit",                DurationMinutes = 30, BufferMinutes = 10 },
                new() { DoctorId = vinaya.Id!, Name = "Follow-Up",                  DurationMinutes = 15, BufferMinutes = 5  },
                new() { DoctorId = vinaya.Id!, Name = "Routine Checkup",            DurationMinutes = 20, BufferMinutes = 5  },
                new() { DoctorId = vinaya.Id!, Name = "Pre-Surgical Consultation",  DurationMinutes = 45, BufferMinutes = 15 },
                new() { DoctorId = vinaya.Id!, Name = "Other",                      DurationMinutes = 10, BufferMinutes = 5  }
            };

            await _consultationTypes.InsertManyAsync(types);
            LogConsultationTypesSeeded(_logger, types.Count);
            return Ok(new { message = $"Seeded {types.Count} consultation types successfully" });
        }

        // Maps DayOfWeek enum to the corresponding DaySchedule property on the doctor.
        // Public so AppointmentsController can call it.
        public static DaySchedule? GetDaySchedule(Doctor doctor, DayOfWeek day) => day switch
        {
            DayOfWeek.Monday    => doctor.Monday,
            DayOfWeek.Tuesday   => doctor.Tuesday,
            DayOfWeek.Wednesday => doctor.Wednesday,
            DayOfWeek.Thursday  => doctor.Thursday,
            DayOfWeek.Friday    => doctor.Friday,
            DayOfWeek.Saturday  => doctor.Saturday,
            DayOfWeek.Sunday    => doctor.Sunday,
            _                   => null
        };

        [LoggerMessage(Level = LogLevel.Warning, Message = "Doctor {Id} not found")]
        private static partial void LogDoctorNotFound(ILogger logger, string id);

        [LoggerMessage(Level = LogLevel.Information, Message = "Doctor created: {Name}, Specialty: {Specialty}")]
        private static partial void LogDoctorCreated(ILogger logger, string name, string specialty);

        [LoggerMessage(Level = LogLevel.Warning, Message = "Doctors collection dropped during seed")]
        private static partial void LogDoctorsCollectionDropped(ILogger logger);

        [LoggerMessage(Level = LogLevel.Information, Message = "Seeded {Count} doctors")]
        private static partial void LogSeeded(ILogger logger, int count);

        [LoggerMessage(Level = LogLevel.Information, Message = "Seeded {Count} consultation types")]
        private static partial void LogConsultationTypesSeeded(ILogger logger, int count);
    }
}
