using SmartCare.API.Models;

namespace SmartCare.API.Interfaces;

public interface IConsultationTypeRepository
{
    Task<List<ConsultationType>> GetByDoctorAsync(string doctorId);
    Task<ConsultationType?> GetByIdAsync(string id);
    Task CreateAsync(ConsultationType type);
    Task InsertManyAsync(IEnumerable<ConsultationType> types);
    Task<bool> ExistsAsync(string id);
    Task<long> CountAsync();
    Task DropCollectionAsync();
}
