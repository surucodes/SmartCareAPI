# SmartCare — Backend API Reference

Last updated: May 2026
Backend: ASP.NET Core Web API, .NET 10, MongoDB Atlas
Base URL (dev): http://localhost:5000
Base URL (prod): set via VITE_API_BASE_URL in .env

---

## Authentication

All protected endpoints require:
  Authorization: Bearer {jwt_token}

JWT payload contains: sub (userId), email, role, jti
Roles: "Admin" | "Doctor"
Token expiry: 8 hours

### Endpoints

POST /api/auth/bootstrap
  First-time setup only. Creates the first Admin account.
  Blocked permanently once any user exists.
  Body: { email, password, role: "Admin" }
  Returns: 201 { id, email, role }

POST /api/auth/login
  Body: { email, password }
  Returns: 200 { token, email, role, expiresIn }
  Errors: 401 { error }

POST /api/auth/register
  Requires Admin JWT.
  Body: { email, password, role: "Admin"|"Doctor", doctorId?: string }
  doctorId required when role is "Doctor"
  Returns: 201 { id, email, role }
  Errors: 409 { error } — email already registered

---

## Doctors

### Models

Doctor {
  id: string                    // MongoDB ObjectId
  name: string
  specialty: string
  bio: string
  photoUrl: string              // doctor profile image URL
  isActive: boolean
  schedulingPolicy: "Strict" | "Flexible"
  slotCapacity: number          // max concurrent bookings per slot
  monday: DaySchedule | null
  tuesday: DaySchedule | null
  wednesday: DaySchedule | null
  thursday: DaySchedule | null
  friday: DaySchedule | null
  saturday: DaySchedule | null
  sunday: DaySchedule | null
}

DaySchedule {
  start: string                 // "HH:MM" 24-hour
  end: string                   // "HH:MM" 24-hour
  emergencyOnly: boolean
  breaks: BreakPeriod[]
}

BreakPeriod {
  start: string                 // "HH:MM"
  end: string                   // "HH:MM"
  reason: string                // e.g. "Lunch Break"
}

ConsultationType {
  id: string
  doctorId: string
  name: string
  durationMinutes: number
  bufferMinutes: number
  isActive: boolean
}

SlotResponse {
  time: string                  // "HH:MM"
  status: "Available" | "Limited" | "Unavailable"
  bookingsCount?: number        // only present when Limited
  capacity?: number             // only present when Limited
}

### Endpoints

GET /api/doctors
  Public. Returns Doctor[]

GET /api/doctors/{id}
  Public. Returns Doctor
  Errors: 404 { error }

GET /api/doctors/{id}/consultation-types
  Public.
  Returns ConsultationType[]

GET /api/doctors/{id}/available-slots?date=yyyy-MM-dd&consultationTypeId={id}
  Public.
  date: required, must be today or future, yyyy-MM-dd format
  consultationTypeId: optional. If omitted, uses 15min default duration.
  Returns:
  {
    doctorId: string
    doctorName: string
    date: string
    dayOfWeek: string
    consultationDurationMinutes: number
    bufferMinutes: number
    consultationTypeName?: string           // null if using default 15min
    emergencyOnly: boolean
    emergencyMessage?: string               // present only when emergencyOnly is true
    slots: SlotResponse[]
  }

POST /api/doctors
  Requires Admin JWT.
  Body: Doctor (without id)
  Returns: 201 Doctor

POST /api/doctors/seed
  Requires Admin JWT.
  Seeds Dr. Prasanna N.M and Dr. Lakshmi Hegde.
  Drops and recreates doctors collection.
  Returns: 200 { message }

POST /api/doctors/seed-consultation-types
  Requires Admin JWT.
  Seeds consultation types for both doctors.
  Idempotent — no-op if types already exist.
  Returns: 200 { message }

---

## Appointments

### Models

Appointment {
  id: string
  doctorId: string
  patientName: string
  patientPhone: string
  patientEmail: string
  date: string                         // "yyyy-MM-dd"
  slot: string                         // "HH:MM"
  status: AppointmentStatus
  notes: string
  patientType: "New" | "Returning"
  referralSource: "Self" | "DoctorReferral" | "HospitalReferral" | "Other"
  appointmentType: "OPD" | "Emergency"
  consultationTypeId: string | null
  consultationTypeName: string | null
  consultationDurationMinutes: number | null
  consultationBufferMinutes: number | null
  isFollowUp: boolean
  previousAppointmentId: string | null
  queuePosition: number                // 1-based, within same slot
  checkedInAt: string | null           // ISO datetime UTC, set on arrival
  cancellationReason: string | null
  cancelledBy: string | null           // "Admin" | "Doctor" | "Patient"
  cancelledAt: string | null           // ISO datetime UTC
  createdAt: string                    // ISO datetime UTC
}

AppointmentStatus:
  "Pending"    // booked, awaiting staff confirmation
  "Confirmed"  // staff confirmed
  "Completed"  // appointment done
  "Cancelled"  // cancelled by admin, doctor, or patient
  "NoShow"     // patient did not arrive

### Booking (public)

POST /api/appointments
  Public — no auth required.
  Body:
  {
    doctorId: string              // required
    patientName: string           // required
    patientPhone: string          // required
    patientEmail: string          // required
    date: string                  // required, yyyy-MM-dd, must be future
    slot: string                  // required, HH:MM
    notes: string                 // optional
    patientType: "New"|"Returning"
    referralSource: "Self"|"DoctorReferral"|"HospitalReferral"|"Other"
    appointmentType: "OPD"|"Emergency"
    consultationTypeId: string    // optional but strongly recommended
    isFollowUp: boolean
    previousAppointmentId: string // optional, only when isFollowUp true
  }
  Returns: 201 { appointment: Appointment, message: string }
  Errors:
    400 { error } — validation failure (bad date, bad slot format,
                    doctor not working that day, emergency-only day)
    404 { error } — doctor not found, consultation type not found
    409 { error } — slot full, within confirmed appointment window

  Queue messaging in response.message:
    position 1, only booking:  "Your appointment request has been received..."
    position 1, others exist:  "You are booking a time window..."
    position > 1:              "You are joining a queue for this time window..."

### Patient self-service (public)

GET /api/appointments/lookup?id={appointmentId}&phone={phone}
  Public. Patient looks up their own appointment.
  Both id AND phone must match.
  Returns: 200 Appointment
  Errors: 400 { error } — missing params
          404 { error } — not found or phone mismatch

POST /api/appointments/patient-cancel
  Public. Patient cancels their own appointment.
  Body:
  {
    appointmentId: string       // required
    patientPhone: string        // required, must match booking
    reason: string              // required, min 5 chars
  }
  Returns: 200 { message, appointmentId, cancelledAt }
  Errors:
    400 { error } — reason too short
    404 { error } — not found or phone mismatch
    409 { error } — already cancelled, completed, NoShow,
                    or within 24 hours of appointment

### Staff / Admin endpoints

GET /api/appointments
  Requires Admin JWT.
  Query: includePast=true|false (default false)
  Returns: Appointment[]

GET /api/appointments/{id}
  Requires Admin or Doctor JWT.
  Returns: Appointment
  Errors: 404 { error }

GET /api/appointments/doctor/{doctorId}
  Requires Admin or Doctor JWT.
  Query: includePast=true|false (default false)
  Returns: Appointment[]

PATCH /api/appointments/{id}/status
  Requires Admin or Doctor JWT.
  Body:
  {
    status: AppointmentStatus   // required
    cancelledBy?: string        // required when status is Cancelled
    cancellationReason?: string // optional, stored when Cancelled
  }
  Returns: 204 No Content
  Triggers emails:
    Confirmed  → confirmation email to patient
    Cancelled  → cancellation email (tone varies by cancelledBy)
    Completed  → post-visit email with Google Maps review link

PATCH /api/appointments/{id}/checkin
  Requires Admin or Doctor JWT.
  No body required.
  Marks patient as physically present (sets checkedInAt).
  Does not change Status.
  Returns: 200 { message, checkedInAt, appointmentId }
  Errors:
    400 { error } — appointment is Cancelled/Completed/NoShow
    404 { error } — not found
    409 { error } — already checked in

POST /api/appointments/{id}/reschedule
  Requires Admin or Doctor JWT.
  Body:
  {
    newDate: string             // yyyy-MM-dd
    newSlot: string             // HH:MM
    reason: string              // min 5 chars
  }
  Cancels original, creates new appointment with same patient data.
  Sends two emails: cancellation + new booking confirmation.
  Returns: 201 { message, originalAppointmentId, newAppointment }
  Errors: 400, 404, 409 { error }

POST /api/appointments/process-expired
  Requires Admin JWT.
  Marks past Pending/Confirmed appointments as NoShow.
  Excludes checked-in patients (checkedInAt != null).
  Returns: 200 { message, processed: number }

---

## Testimonials

Testimonial {
  id: string
  patientName: string
  text: string
  rating: number               // 1–5
  isApproved: boolean
  date: string                 // ISO datetime
}

GET /api/testimonials
  Public. Returns approved testimonials only.
  Returns: Testimonial[]

POST /api/testimonials
  Public. Submits a testimonial for admin approval.
  Body: { patientName, text, rating }
  Returns: 201 Testimonial (isApproved: false)
  Errors: 400 { error } — rating out of range

PATCH /api/testimonials/{id}/approve
  Requires Admin JWT.
  No body.
  Returns: 204 No Content
  Errors: 404 { error }

---

## Health Check

GET /health
  Public. Returns 200 { status: "Healthy" }
  Use this to check if the API is reachable before rendering.

---

## Error shape (all errors)

{ "error": "Human readable message" }

HTTP status codes used:
  200  OK
  201  Created
  204  No Content
  400  Bad Request (validation, business rule)
  401  Unauthorized (no token or invalid token)
  403  Forbidden (valid token, wrong role)
  404  Not Found
  409  Conflict (duplicate, slot full, already cancelled)
  500  Internal Server Error

---

## Email triggers (for UI messaging)

Booking created (POST /api/appointments):
  Patient receives booking received email automatically.
  No frontend action needed.

Status → Confirmed:
  Patient receives confirmation email automatically.

Status → Cancelled:
  Patient receives cancellation email automatically.
  Tone differs: Admin/Doctor cancellation vs patient self-cancel.

Status → Completed:
  Patient receives post-visit email with Google Maps review link.

---

## Known constraints for frontend

Slot times are strings "HH:MM" — display as-is, do not parse to Date.
Appointment dates are strings "yyyy-MM-dd" — display as-is or format
  with a library like date-fns, do not use new Date() directly on these
  strings without appending a timezone (they are IST dates).
All stored timestamps (createdAt, cancelledAt, checkedInAt) are UTC ISO strings.
  When displaying, convert to IST: new Date(timestamp) then format in
  Asia/Kolkata timezone using Intl.DateTimeFormat or date-fns-tz.
JWT is stored in memory (React context). Page refresh loses session.
  This is intentional. Redirect to login on refresh gracefully.