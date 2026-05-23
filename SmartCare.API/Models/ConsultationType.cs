using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartCare.API.Models
{
    [BsonIgnoreExtraElements]
    public class ConsultationType
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string DoctorId { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public int BufferMinutes { get; set; } = 5;
        public bool IsActive { get; set; } = true;
    }
}
