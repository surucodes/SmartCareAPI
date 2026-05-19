using MongoDB.Driver;
using SmartCare.API.Interfaces;
using SmartCare.API.Models;

namespace SmartCare.API.Repositories;

public class DoctorRepository : IDoctorRepository
{
    private readonly IMongoDatabase _database;
    private readonly IMongoCollection<Doctor> _doctors;

    public DoctorRepository(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDbSettings:ConnectionString"]);
        _database = client.GetDatabase(config["MongoDbSettings:DatabaseName"]);
        _doctors = _database.GetCollection<Doctor>("doctors");
    }

    public async Task<List<Doctor>> GetAllAsync() =>
        await _doctors.Find(_ => true).ToListAsync();

    public async Task<Doctor?> GetByIdAsync(string id) =>
        await _doctors.Find(d => d.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(Doctor doctor) =>
        await _doctors.InsertOneAsync(doctor);

    public async Task<long> CountAsync() =>
        await _doctors.CountDocumentsAsync(_ => true);

    public async Task InsertManyAsync(IEnumerable<Doctor> doctors) =>
        await _doctors.InsertManyAsync(doctors);

    public async Task DropCollectionAsync() =>
        await _database.DropCollectionAsync("doctors");
}
