using SmartCare.API.Models;

namespace SmartCare.API.Interfaces;

public interface IDoctorRepository
{
    Task<List<Doctor>> GetAllAsync();
    Task<Doctor?> GetByIdAsync(string id);
    Task CreateAsync(Doctor doctor);
    Task<long> CountAsync();
    Task InsertManyAsync(IEnumerable<Doctor> doctors);
    Task DropCollectionAsync();
}
