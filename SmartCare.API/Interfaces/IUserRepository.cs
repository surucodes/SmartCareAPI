using SmartCare.API.Models;

namespace SmartCare.API.Interfaces;

public interface IUserRepository
{
    Task<AppUser?> GetByEmailAsync(string email);
    Task CreateAsync(AppUser user);
    Task<bool> EmailExistsAsync(string email);
    Task<long> CountAsync();
}
