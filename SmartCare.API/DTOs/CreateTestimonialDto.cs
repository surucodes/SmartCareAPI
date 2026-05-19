using System.ComponentModel.DataAnnotations;

namespace SmartCare.API.DTOs;

public class CreateTestimonialDto
{
    [Required]
    public string PatientName { get; set; } = string.Empty;

    [Required]
    public string Text { get; set; } = string.Empty;

    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
    public int Rating { get; set; }
}
