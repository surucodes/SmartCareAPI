using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartCare.API.Models
{
    public class Doctor
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Specialty { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string PhotoUrl { get; set; } = string.Empty;

        public DaySchedule? Monday { get; set; }
        public DaySchedule? Tuesday { get; set; }
        public DaySchedule? Wednesday { get; set; }
        public DaySchedule? Thursday { get; set; }
        public DaySchedule? Friday { get; set; }
        public DaySchedule? Saturday { get; set; }
        public DaySchedule? Sunday { get; set; }

        // "Strict" = exactly one booking per slot; "Flexible" = up to SlotCapacity bookings per slot
        public string SchedulingPolicy { get; set; } = "Strict";
        public int SlotCapacity { get; set; } = 1;

        public bool IsActive { get; set; } = true;
    }
}
