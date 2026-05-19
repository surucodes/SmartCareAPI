using System.ComponentModel.DataAnnotations;

namespace SmartCare.API.DTOs
{
    public class RescheduleAppointmentDto
    {
        [Required]
        public string NewDate { get; set; } = string.Empty;

        [Required]
        public string NewSlot { get; set; } = string.Empty;

        [Required]
        [MinLength(5, ErrorMessage = "Please provide a reason for rescheduling")]
        public string Reason { get; set; } = string.Empty;
    }
}
