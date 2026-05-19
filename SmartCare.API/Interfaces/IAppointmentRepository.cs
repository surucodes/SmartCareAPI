using SmartCare.API.Models;

namespace SmartCare.API.Interfaces;

public interface IAppointmentRepository
{
    Task<List<Appointment>> GetAllAsync(bool includePast = false);
    Task<List<Appointment>> GetByDoctorAsync(string doctorId, bool includePast = false);
    Task<List<Appointment>> GetByDoctorAndDateAsync(string doctorId, string date);
    Task<Appointment?> GetByIdAsync(string id);
    Task CreateAsync(Appointment appointment);
    Task<(bool success, int queuePosition, string? errorMessage)> CreateAtomicAsync(
        Appointment appointment, string schedulingPolicy, int slotCapacity);
    Task UpdateStatusAsync(string id, AppointmentStatus status);
    Task CancelAsync(string id, string reason, string cancelledBy, DateTime cancelledAt);
    Task<Appointment?> GetByIdAndPhoneAsync(string id, string phone);
    Task<int> MarkExpiredAsNoShowAsync();
    Task CheckInAsync(string id, DateTime checkedInAt);
}
