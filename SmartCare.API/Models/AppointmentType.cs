namespace SmartCare.API.Models;

public enum AppointmentType
{
    OPD,
    // Used to confirm a booking on an emergency-only day (e.g. Dr. Varun's Sunday hours).
    // Patient explicitly acknowledges urgency by selecting this type.
    Emergency
    // IPD (inpatient) is V2 — a fundamentally different data model with bed tracking, daily notes, and billing
}
