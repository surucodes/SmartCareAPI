using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartCare.API.Models
{
    public class AppUser
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Email { get; set; } = string.Empty;

        // We NEVER store plain passwords
        // PasswordHash is the result of running the password through bcrypt
        // bcrypt is a one-way function — you can verify but not reverse it
        public string PasswordHash { get; set; } = string.Empty;

        // "Admin" or "Doctor"
        public string Role { get; set; } = "Admin";

        // If role is Doctor, link to their Doctor document
        // so we can filter their appointments
        public string? DoctorId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}