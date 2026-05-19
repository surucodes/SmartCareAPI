using System.ComponentModel.DataAnnotations;
using SmartCare.API.Models;

namespace SmartCare.API.DTOs
{
    public class CreateAppointmentDto
    {
        [Required]
        public string DoctorId { get; set; } = string.Empty;

        [Required]
        public string PatientName { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PatientPhone { get; set; } = string.Empty;

        [EmailAddress]
        public string PatientEmail { get; set; } = string.Empty;

        [Required]
        public string Date { get; set; } = string.Empty;

        [Required]
        public string Slot { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        [Required]
        public PatientType PatientType { get; set; } = PatientType.New;

        [Required]
        public ReferralSource ReferralSource { get; set; } = ReferralSource.Self;

        [Required]
        public AppointmentType AppointmentType { get; set; } = AppointmentType.OPD;

        public string? ConsultationTypeId { get; set; }
        public bool IsFollowUp { get; set; } = false;
        public string? PreviousAppointmentId { get; set; }
    }
}