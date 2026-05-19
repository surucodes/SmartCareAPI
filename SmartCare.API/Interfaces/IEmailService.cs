using SmartCare.API.Models;

namespace SmartCare.API.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody);
    Task SendBookingConfirmationAsync(Appointment appointment, Doctor doctor);
    Task SendAppointmentConfirmedAsync(Appointment appointment, Doctor doctor);
    Task SendAppointmentCancelledAsync(Appointment appointment, Doctor doctor, string cancelledBy);
    Task SendPostVisitEmailAsync(Appointment appointment, Doctor doctor);
}
