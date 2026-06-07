using MongoDB.Driver;
using SmartCare.API.Interfaces;
using SmartCare.API.Models;

namespace SmartCare.API.Repositories;

public class TestimonialRepository : ITestimonialRepository
{
    private readonly IMongoCollection<Testimonial> _collection;

    public TestimonialRepository(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDbSettings:ConnectionString"]);
        var db = client.GetDatabase(config["MongoDbSettings:DatabaseName"]);
        _collection = db.GetCollection<Testimonial>("testimonials");
    }

    public async Task<List<Testimonial>> GetApprovedAsync() =>
        await _collection
            .Find(t => t.IsApproved)
            .SortByDescending(t => t.Date)
            .ToListAsync();

    public async Task<List<Testimonial>> GetPendingAsync() =>
        await _collection
            .Find(t => !t.IsApproved)
            .SortByDescending(t => t.Date)
            .ToListAsync();

    public async Task CreateAsync(Testimonial testimonial) =>
        await _collection.InsertOneAsync(testimonial);

    public async Task<Testimonial?> GetByIdAsync(string id) =>
        await _collection.Find(t => t.Id == id).FirstOrDefaultAsync();

    public async Task ApproveAsync(string id)
    {
        var update = Builders<Testimonial>.Update.Set(t => t.IsApproved, true);
        await _collection.UpdateOneAsync(t => t.Id == id, update);
    }
}
