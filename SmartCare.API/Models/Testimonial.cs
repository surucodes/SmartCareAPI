using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartCare.API.Models;

public class Testimonial
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string PatientName { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;

    // 1–5 star rating, validated in the controller
    public int Rating { get; set; }

    // Server-set on creation — client never sends this
    public DateTime Date { get; set; } = DateTime.UtcNow;

    // Starts false; Admin flips it to true via PATCH /approve
    public bool IsApproved { get; set; } = false;
}
