using MongoDB.Driver;
using SmartCare.API.Interfaces;
using SmartCare.API.Models;

namespace SmartCare.API.Repositories;

public class ConsultationTypeRepository : IConsultationTypeRepository
{
    private readonly IMongoCollection<ConsultationType> _types;

    public ConsultationTypeRepository(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDbSettings:ConnectionString"]);
        var database = client.GetDatabase(config["MongoDbSettings:DatabaseName"]);
        _types = database.GetCollection<ConsultationType>("consultationTypes");
        _types.Indexes.CreateOne(new CreateIndexModel<ConsultationType>(
            Builders<ConsultationType>.IndexKeys.Ascending(t => t.DoctorId),
            new CreateIndexOptions { Name = "doctorId" }));
    }

    public async Task<List<ConsultationType>> GetByDoctorAsync(string doctorId) =>
        await _types.Find(t => t.DoctorId == doctorId && t.IsActive).ToListAsync();

    public async Task<ConsultationType?> GetByIdAsync(string id) =>
        await _types.Find(t => t.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(ConsultationType type) =>
        await _types.InsertOneAsync(type);

    public async Task InsertManyAsync(IEnumerable<ConsultationType> types) =>
        await _types.InsertManyAsync(types);

    public async Task<bool> ExistsAsync(string id) =>
        await _types.Find(t => t.Id == id).AnyAsync();

    public async Task<long> CountAsync() =>
        await _types.CountDocumentsAsync(_ => true);

    public async Task DropCollectionAsync() =>
        await _types.Database.DropCollectionAsync("consultationTypes");
}
