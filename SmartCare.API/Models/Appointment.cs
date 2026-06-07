using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartCare.API.Models
{
    [BsonIgnoreExtraElements]
    public class Appointment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        // Reference to which doctor — stores the doctor's MongoDB _id
        // This is like a foreign key in SQL
        [BsonRepresentation(BsonType.ObjectId)]
        public string DoctorId { get; set; } = string.Empty;

        // Patient contact info — we don't create a Patient model for MVP
        // keeping it simple and embedded directly here
        public string PatientName { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public string PatientEmail { get; set; } = string.Empty;

        // The actual booking details
        // Date stored as string "2025-04-15" — simple, no timezone headaches
        public string Date { get; set; } = string.Empty;
        public string Slot { get; set; } = string.Empty;  // e.g. "09:00"

        // BsonRepresentation(String) means store enum as "Pending" in MongoDB
        // not as 0, 1, 2 — makes Atlas readable
        [BsonRepresentation(BsonType.String)]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;

        // Set automatically by server — client never sends this
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string Notes { get; set; } = string.Empty;

        [BsonRepresentation(BsonType.String)]
        public PatientType PatientType { get; set; } = PatientType.New;

        [BsonRepresentation(BsonType.String)]
        public ReferralSource ReferralSource { get; set; } = ReferralSource.Self;

        [BsonRepresentation(BsonType.String)]
        public AppointmentType AppointmentType { get; set; } = AppointmentType.OPD;

        // Cancellation metadata — only populated when Status = Cancelled
        public string? CancellationReason { get; set; }
        // "Patient", "Admin", or "Doctor"
        public string? CancelledBy { get; set; }
        public DateTime? CancelledAt { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string? ConsultationTypeId { get; set; }
        public string? ConsultationTypeName { get; set; }
        public int? ConsultationDurationMinutes { get; set; }
        public int? ConsultationBufferMinutes { get; set; }

        public bool IsFollowUp { get; set; } = false;

        [BsonRepresentation(BsonType.ObjectId)]
        public string? PreviousAppointmentId { get; set; }

        // 1 = first booking in the slot; >1 = additional booking under Flexible scheduling
        public int QueuePosition { get; set; } = 1;

        // Set when patient physically arrives at the clinic.
        // Null means patient has not yet checked in.
        public DateTime? CheckedInAt { get; set; }
    }
}