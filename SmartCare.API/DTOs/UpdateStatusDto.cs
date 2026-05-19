using System.ComponentModel.DataAnnotations;
using SmartCare.API.Models;

namespace SmartCare.API.DTOs
{
    public class UpdateStatusDto
    {
        [Required]
        public AppointmentStatus Status { get; set; }

        // "Admin" = hospital cancelled it; "Patient" = patient requested cancellation.
        // Only relevant when Status == Cancelled; ignored for other status transitions.
        public string? CancelledBy { get; set; }

        // Optional free-text reason; required by convention when Status == Cancelled.
        // Validated contextually in the controller, not via [Required] here.
        public string? CancellationReason { get; set; }
    }
}
