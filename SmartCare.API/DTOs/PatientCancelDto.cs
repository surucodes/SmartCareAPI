using System.ComponentModel.DataAnnotations;

namespace SmartCare.API.DTOs
{
    public class PatientCancelDto
    {
        [Required]
        public string AppointmentId { get; set; } = string.Empty;

        [Required]
        public string PatientPhone { get; set; } = string.Empty;

        [Required]
        [MinLength(5, ErrorMessage = "Please provide a reason for cancellation")]
        [MaxLength(500, ErrorMessage = "Reason must be under 500 characters")]
        public string Reason { get; set; } = string.Empty;
    }
}
