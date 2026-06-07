using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCare.API.DTOs;
using SmartCare.API.Interfaces;
using SmartCare.API.Models;

namespace SmartCare.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestimonialsController : ControllerBase
{
    private readonly ITestimonialRepository _repo;
    private readonly ILogger<TestimonialsController> _logger;

    public TestimonialsController(ITestimonialRepository repo, ILogger<TestimonialsController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<Testimonial>>> GetApproved([FromQuery] bool includePending = false)
    {
        if (includePending)
        {
            // Pending testimonials are admin-only — public callers must not see unmoderated content.
            // JWT middleware still populates User even without [Authorize], so role check works here
            // without breaking the default unauthenticated path.
            if (User.Identity?.IsAuthenticated != true)
                return Unauthorized(new { error = "Authentication required to view pending testimonials" });

            if (!User.IsInRole("Admin"))
                return StatusCode(StatusCodes.Status403Forbidden,
                    new { error = "Only admins can view pending testimonials" });

            var pending = await _repo.GetPendingAsync();
            _logger.LogInformation("Admin fetched {Count} pending testimonials", pending.Count);
            return Ok(pending);
        }

        var testimonials = await _repo.GetApprovedAsync();
        return Ok(testimonials);
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateTestimonialDto dto)
    {
        var testimonial = new Testimonial
        {
            PatientName = dto.PatientName,
            Text = dto.Text,
            Rating = dto.Rating,
            Date = DateTime.UtcNow,
            IsApproved = false
        };

        await _repo.CreateAsync(testimonial);
        _logger.LogInformation("Testimonial submitted by {PatientName}, awaiting approval", testimonial.PatientName);
        return CreatedAtAction(nameof(GetApproved), new { id = testimonial.Id }, testimonial);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/approve")]
    public async Task<ActionResult> Approve(string id)
    {
        var testimonial = await _repo.GetByIdAsync(id);
        if (testimonial is null)
        {
            _logger.LogWarning("Approve called for non-existent testimonial {Id}", id);
            return NotFound(new { error = "Testimonial not found" });
        }

        await _repo.ApproveAsync(id);
        _logger.LogInformation("Testimonial {Id} approved", id);
        return NoContent();
    }
}