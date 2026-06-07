using MongoDB.Bson.Serialization.Attributes;

namespace SmartCare.API.Models
{
    [BsonIgnoreExtraElements]
    public class BreakPeriod
    {
        public string Start { get; set; } = string.Empty;  // "15:00"
        public string End { get; set; } = string.Empty;    // "17:00"
        public string Reason { get; set; } = "Break";
    }
}
