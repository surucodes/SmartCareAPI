using SmartCare.API.Models;

namespace SmartCare.API.Interfaces;

public interface ITestimonialRepository
{
    Task<List<Testimonial>> GetApprovedAsync();
    Task<List<Testimonial>> GetPendingAsync();
    Task CreateAsync(Testimonial testimonial);
    Task<Testimonial?> GetByIdAsync(string id);
    Task ApproveAsync(string id);
}
