using System.ComponentModel.DataAnnotations;

namespace SmartCare.API.DTOs
{
    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [AllowedValues("Admin", "Doctor", ErrorMessage = "Role must be Admin or Doctor")]
        public string Role { get; set; } = "Doctor";

        // Only required if Role == "Doctor"
        public string? DoctorId { get; set; }

        // Only used by /api/auth/bootstrap — must match the BOOTSTRAP_SECRET
        // environment variable. Ignored by /api/auth/register.
        public string? BootstrapSecret { get; set; }
    }
}