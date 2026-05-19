using MongoDB.Driver;
using SmartCare.API.Interfaces;
using SmartCare.API.Models;

namespace SmartCare.API.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<AppUser> _users;

    public UserRepository(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDbSettings:ConnectionString"]);
        var database = client.GetDatabase(config["MongoDbSettings:DatabaseName"]);
        _users = database.GetCollection<AppUser>("users");
    }

    public async Task<AppUser?> GetByEmailAsync(string email) =>
        await _users.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task CreateAsync(AppUser user) =>
        await _users.InsertOneAsync(user);

    public async Task<bool> EmailExistsAsync(string email) =>
        await _users.Find(u => u.Email == email).AnyAsync();

    public async Task<long> CountAsync() =>
        await _users.CountDocumentsAsync(Builders<AppUser>.Filter.Empty);
}
