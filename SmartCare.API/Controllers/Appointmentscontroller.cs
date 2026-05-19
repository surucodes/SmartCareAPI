using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCare.API.DTOs;
using SmartCare.API.Interfaces;
using SmartCare.API.Models;

namespace SmartCare.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public partial class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentRepository _appointments;
        private readonly IDoctorRepository _doctors;
        private readonly IConsultationTypeRepository _consultationTypes;
        private readonly IEmailService _email;
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(
            IAppointmentRepository appointments,
            IDoctorRepository doctors,
            IConsultationTypeRepository consultationTypes,
            IEmailService email,
            ILogger<AppointmentsController> logger)
        {
            _appointments = appointments;
            _doctors = doctors;
            _consultationTypes = consultationTypes;
            _email = email;
            _logger = logger;
        }

        private static DateTime IstNow =>
            TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Asia/Kolkata");

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<List<Appointment>>> GetAll([FromQuery] bool includePast = false)
        {
            LogGetAllAppointments(_logger, includePast);
            var appointments = await _appointments.GetAllAsync(includePast);
            return Ok(appointments);
        }

        // Literal route — placed before {id} so it is never shadowed by the param route.
        [HttpGet("lookup")]
        public async Task<ActionResult<Appointment>> Lookup(
            [FromQuery] string? id,
            [FromQuery] string? phone)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { error = "Appointment ID is required" });

            if (string.IsNullOrWhiteSpace(phone))
                return BadRequest(new { error = "Phone number is required" });

            var appointment = await _appointments.GetByIdAndPhoneAsync(id, phone);
            LogLookup(_logger, id, appointment is not null);

            if (appointment is null)
                return NotFound(new { error = "No appointment found with this ID and phone number" });

            return Ok(appointment);
        }

        [Authorize(Roles = "Admin,Doctor")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetById(string id)
        {
            var appointment = await _appointments.GetByIdAsync(id);
            if (appointment is null)
                return NotFound(new { error = $"Appointment {id} not found" });
            return Ok(appointment);
        }

        [Authorize(Roles = "Admin,Doctor")]
        [HttpGet("doctor/{doctorId}")]
        public async Task<ActionResult<List<Appointment>>> GetByDoctor(string doctorId, [FromQuery] bool includePast = false)
        {
            LogGetByDoctorAppointments(_logger, doctorId, includePast);
            var appointments = await _appointments.GetByDoctorAsync(doctorId, includePast);
            return Ok(appointments);
        }

        [HttpPost]
        public async Task<ActionResult> Create(CreateAppointmentDto dto)
        {
            if (!DateOnly.TryParseExact(dto.Date, "yyyy-MM-dd", out var date))
                return BadRequest(new { error = "Date must be in yyyy-MM-dd format" });

            if (date < DateOnly.FromDateTime(IstNow))
                return BadRequest(new { error = "Appointment date must be today or in the future" });

            if (!SlotFormatRegex().IsMatch(dto.Slot))
                return BadRequest(new { error = "Slot must be in HH:MM 24-hour format (e.g. 09:00)" });

            var doctor = await _doctors.GetByIdAsync(dto.DoctorId);
            if (doctor is null)
                return NotFound(new { error = "Doctor not found. Please select a valid doctor." });

            if (!doctor.IsActive)
                return NotFound(new { error = "Doctor is not currently available" });

            var daySchedule = DoctorsController.GetDaySchedule(doctor, date.DayOfWeek);
            if (daySchedule is null)
                return BadRequest(new { error = $"Dr. {doctor.Name} is not available on {date.DayOfWeek}s" });

            // Emergency-only days: the AppointmentType flag is the patient's confirmation
            // that this is urgent. Anything other than Emergency is refused.
            if (daySchedule.EmergencyOnly && dto.AppointmentType != AppointmentType.Emergency)
                return BadRequest(new
                {
                    error = "This day is for emergency appointments only. " +
                            "Please call us directly or select a regular working day."
                });

            ConsultationType? consultationType = null;
            if (!string.IsNullOrWhiteSpace(dto.ConsultationTypeId))
            {
                consultationType = await _consultationTypes.GetByIdAsync(dto.ConsultationTypeId);
                if (consultationType is null || consultationType.DoctorId != doctor.Id)
                    return BadRequest(new { error = "Invalid consultation type for this doctor" });
            }

            // Soft validation for follow-ups: log mismatch but don't block — patient may be
            // booking a follow-up after their previous record was archived/cancelled.
            if (dto.IsFollowUp && !string.IsNullOrWhiteSpace(dto.PreviousAppointmentId))
            {
                var previous = await _appointments.GetByIdAsync(dto.PreviousAppointmentId);
                if (previous is not null && previous.DoctorId != dto.DoctorId)
                    LogFollowUpDoctorMismatch(_logger, dto.PreviousAppointmentId, dto.DoctorId);
            }

            var appointment = new Appointment
            {
                DoctorId = dto.DoctorId,
                PatientName = dto.PatientName,
                PatientPhone = dto.PatientPhone,
                PatientEmail = dto.PatientEmail,
                Date = dto.Date,
                Slot = dto.Slot,
                Notes = dto.Notes,
                PatientType = dto.PatientType,
                ReferralSource = dto.ReferralSource,
                AppointmentType = dto.AppointmentType,
                Status = AppointmentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                ConsultationTypeId = consultationType?.Id,
                ConsultationTypeName = consultationType?.Name,
                ConsultationDurationMinutes = consultationType?.DurationMinutes,
                ConsultationBufferMinutes = consultationType?.BufferMinutes,
                IsFollowUp = dto.IsFollowUp,
                PreviousAppointmentId = dto.PreviousAppointmentId
            };

            var (success, queuePosition, errorMessage) = await _appointments.CreateAtomicAsync(
                appointment,
                doctor.SchedulingPolicy,
                doctor.SlotCapacity);

            if (!success)
            {
                LogSlotConflict(_logger, dto.DoctorId, dto.Date, dto.Slot);
                return Conflict(new { error = errorMessage });
            }

            LogAppointmentCreated(_logger, appointment.Id, appointment.DoctorId, appointment.Date, appointment.Slot);

            try
            {
                await _email.SendBookingConfirmationAsync(appointment, doctor);
            }
            catch (Exception ex)
            {
                LogEmailFailed(_logger, ex, appointment.Id);
            }

            // Count current Pending+Confirmed bookings at this slot AFTER the insert to
            // pick the right patient-facing message. queuePosition tells us where we
            // sit; slotBookings tells us whether the slot is shared.
            var slotBookings = (await _appointments.GetByDoctorAndDateAsync(
                    appointment.DoctorId, appointment.Date))
                .Count(a => a.Slot == appointment.Slot &&
                            (a.Status == AppointmentStatus.Pending ||
                             a.Status == AppointmentStatus.Confirmed));

            string message;
            if (queuePosition == 1 && slotBookings == 1)
            {
                message = "Your appointment request has been received. " +
                          "Our team will confirm within 2 hours.";
            }
            else if (queuePosition == 1 && slotBookings > 1)
            {
                message = "You are booking a time window, not a guaranteed minute. " +
                          "Our team will confirm your slot and let you know your " +
                          "expected time within 2 hours.";
            }
            else
            {
                message = $"You are joining a queue for this time window " +
                          $"(position {queuePosition}). Our team will confirm " +
                          $"your position and expected time within 2 hours.";
            }

            return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, new
            {
                appointment,
                message
            });
        }

        // Public — patient cancels using appointment ID + phone as ownership proof.
        [HttpPost("patient-cancel")]
        public async Task<ActionResult> PatientCancel(PatientCancelDto dto)
        {
            var appointment = await _appointments.GetByIdAndPhoneAsync(dto.AppointmentId, dto.PatientPhone);
            if (appointment is null)
            {
                LogPatientCancelOwnershipFailed(_logger, dto.AppointmentId);
                return NotFound(new { error = "No appointment found with this ID and phone number" });
            }

            if (appointment.Status == AppointmentStatus.Cancelled)
                return Conflict(new { error = "This appointment is already cancelled" });

            if (appointment.Status == AppointmentStatus.Completed)
                return Conflict(new { error = "This appointment has already been completed and cannot be cancelled" });

            if (appointment.Status == AppointmentStatus.NoShow)
                return Conflict(new { error = "This appointment has already been marked as a no-show" });

            var appointmentDate = DateOnly.ParseExact(appointment.Date, "yyyy-MM-dd", null);
            var appointmentDateTime = appointmentDate.ToDateTime(TimeOnly.Parse(appointment.Slot));
            var hoursUntilAppointment = (appointmentDateTime - IstNow).TotalHours;

            if (hoursUntilAppointment <= 24)
            {
                LogPatientCancelWithin24Hours(_logger, appointment.Id, hoursUntilAppointment);
                return Conflict(new
                {
                    error = "Cancellations must be made at least 24 hours before the appointment. " +
                            "To cancel within 24 hours, please contact us directly."
                });
            }

            var now = DateTime.UtcNow;
            await _appointments.CancelAsync(dto.AppointmentId, dto.Reason, "Patient", now);
            LogPatientCancelled(_logger, appointment.Id, dto.Reason);

            var doctor = await _doctors.GetByIdAsync(appointment.DoctorId);

            try
            {
                await _email.SendAppointmentCancelledAsync(appointment, doctor!, "Patient");
            }
            catch (Exception ex)
            {
                LogEmailFailed(_logger, ex, appointment.Id);
            }

            return Ok(new
            {
                message = "Your appointment has been successfully cancelled.",
                appointmentId = dto.AppointmentId,
                cancelledAt = now
            });
        }

        // Literal route — placed before {id}/reschedule to avoid param shadowing.
        [Authorize(Roles = "Admin")]
        [HttpPost("process-expired")]
        public async Task<ActionResult> ProcessExpired()
        {
            var count = await _appointments.MarkExpiredAsNoShowAsync();
            LogProcessExpiredCompleted(_logger, count);
            if (count > 20)
                LogProcessExpiredHighCount(_logger, count);

            if (count == 0)
                return Ok(new { processed = 0, message = "No expired appointments found" });

            return Ok(new { processed = count, message = $"{count} appointments marked as NoShow" });
        }

        [Authorize(Roles = "Admin,Doctor")]
        [HttpPost("{id}/reschedule")]
        public async Task<ActionResult> Reschedule(string id, RescheduleAppointmentDto dto)
        {
            if (!DateOnly.TryParseExact(dto.NewDate, "yyyy-MM-dd", out var newDate))
                return BadRequest(new { error = "NewDate must be in yyyy-MM-dd format" });

            if (newDate < DateOnly.FromDateTime(IstNow))
                return BadRequest(new { error = "New appointment date must be today or in the future" });

            if (!SlotFormatRegex().IsMatch(dto.NewSlot))
                return BadRequest(new { error = "NewSlot must be in HH:MM 24-hour format (e.g. 09:00)" });

            var existing = await _appointments.GetByIdAsync(id);
            if (existing is null)
                return NotFound(new { error = "Appointment not found" });

            if (existing.Status == AppointmentStatus.Cancelled)
                return Conflict(new { error = "Cannot reschedule a cancelled appointment" });

            if (existing.Status == AppointmentStatus.Completed)
                return Conflict(new { error = "Cannot reschedule a completed appointment" });

            var doctor = await _doctors.GetByIdAsync(existing.DoctorId);
            if (doctor is null)
                return NotFound(new { error = "Associated doctor not found" });

            var daySchedule = DoctorsController.GetDaySchedule(doctor, newDate.DayOfWeek);
            if (daySchedule is null)
                return BadRequest(new { error = $"Dr. {doctor.Name} is not available on {newDate.DayOfWeek}s" });

            if (daySchedule.EmergencyOnly && existing.AppointmentType != AppointmentType.Emergency)
                return BadRequest(new
                {
                    error = "Target day is for emergency appointments only. " +
                            "Please choose a different date."
                });

            // Cancel the original first so its slot is freed, then attempt the atomic create.
            // If the new booking somehow fails after this point, we still have an audit trail
            // via the cancellation reason field.
            await _appointments.CancelAsync(
                id,
                $"Rescheduled to {dto.NewDate} at {dto.NewSlot}. Reason: {dto.Reason}",
                "Admin",
                DateTime.UtcNow);

            var newAppointment = new Appointment
            {
                DoctorId = existing.DoctorId,
                PatientName = existing.PatientName,
                PatientPhone = existing.PatientPhone,
                PatientEmail = existing.PatientEmail,
                Date = dto.NewDate,
                Slot = dto.NewSlot,
                Notes = existing.Notes,
                PatientType = existing.PatientType,
                ReferralSource = existing.ReferralSource,
                AppointmentType = existing.AppointmentType,
                Status = AppointmentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                ConsultationTypeId = existing.ConsultationTypeId,
                ConsultationTypeName = existing.ConsultationTypeName,
                ConsultationDurationMinutes = existing.ConsultationDurationMinutes,
                ConsultationBufferMinutes = existing.ConsultationBufferMinutes,
                IsFollowUp = existing.IsFollowUp,
                PreviousAppointmentId = existing.PreviousAppointmentId
            };

            var (success, _, errorMessage) = await _appointments.CreateAtomicAsync(
                newAppointment,
                doctor.SchedulingPolicy,
                doctor.SlotCapacity);

            if (!success)
            {
                LogRescheduleSlotConflict(_logger, existing.DoctorId, dto.NewDate, dto.NewSlot);
                return Conflict(new { error = errorMessage });
            }

            LogAppointmentRescheduled(_logger, id, dto.NewDate, dto.NewSlot, newAppointment.Id);

            try
            {
                await _email.SendAppointmentCancelledAsync(existing, doctor, "Admin");
                await _email.SendBookingConfirmationAsync(newAppointment, doctor);
            }
            catch (Exception ex)
            {
                LogEmailFailed(_logger, ex, id);
            }

            return CreatedAtAction(nameof(GetById), new { id = newAppointment.Id }, new
            {
                message = "Appointment rescheduled successfully",
                originalAppointmentId = id,
                newAppointment
            });
        }

        [Authorize(Roles = "Admin,Doctor")]
        [HttpPatch("{id}/status")]
        public async Task<ActionResult> UpdateStatus(string id, [FromBody] UpdateStatusDto dto)
        {
            var appointment = await _appointments.GetByIdAsync(id);
            if (appointment is null)
            {
                LogAppointmentNotFound(_logger, id);
                return NotFound(new { error = $"Appointment {id} not found" });
            }

            var doctor = await _doctors.GetByIdAsync(appointment.DoctorId);

            // When cancelling with a reason, persist all cancellation metadata atomically.
            // For all other status changes, a simple status-only update is sufficient.
            if (dto.Status == AppointmentStatus.Cancelled && !string.IsNullOrWhiteSpace(dto.CancellationReason))
            {
                await _appointments.CancelAsync(
                    id,
                    dto.CancellationReason,
                    dto.CancelledBy ?? "Admin",
                    DateTime.UtcNow);
            }
            else
            {
                await _appointments.UpdateStatusAsync(id, dto.Status);
            }

            LogAppointmentStatusChanged(_logger, id, dto.Status);

            try
            {
                switch (dto.Status)
                {
                    case AppointmentStatus.Confirmed:
                        await _email.SendAppointmentConfirmedAsync(appointment, doctor!);
                        LogConfirmedEmailSent(_logger, appointment.Id);
                        break;

                    case AppointmentStatus.Cancelled:
                        await _email.SendAppointmentCancelledAsync(appointment, doctor!, dto.CancelledBy ?? "Admin");
                        LogCancelledEmailSent(_logger, appointment.Id, dto.CancelledBy ?? "Admin");
                        break;

                    case AppointmentStatus.Completed:
                        await _email.SendPostVisitEmailAsync(appointment, doctor!);
                        LogPostVisitEmailSent(_logger, appointment.Id);
                        break;
                }
            }
            catch (Exception ex)
            {
                LogEmailFailed(_logger, ex, appointment.Id);
            }

            return NoContent();
        }

        // PATCH /api/appointments/{id}/checkin
        // Marks patient as physically present at the clinic. Status is intentionally
        // unchanged — check-in is orthogonal to the booking-lifecycle status (a patient
        // can arrive while their booking is Pending or Confirmed).
        [Authorize(Roles = "Admin,Doctor")]
        [HttpPatch("{id}/checkin")]
        public async Task<ActionResult> CheckIn(string id)
        {
            var appointment = await _appointments.GetByIdAsync(id);
            if (appointment is null)
            {
                LogAppointmentNotFound(_logger, id);
                return NotFound(new { error = $"Appointment {id} not found" });
            }

            if (appointment.CheckedInAt is not null)
                return Conflict(new
                {
                    error = $"Patient already checked in at {appointment.CheckedInAt:yyyy-MM-dd HH:mm:ss} UTC"
                });

            if (appointment.Status == AppointmentStatus.Cancelled ||
                appointment.Status == AppointmentStatus.Completed ||
                appointment.Status == AppointmentStatus.NoShow)
            {
                return BadRequest(new
                {
                    error = $"Cannot check in a {appointment.Status} appointment"
                });
            }

            var now = DateTime.UtcNow;
            await _appointments.CheckInAsync(id, now);
            LogPatientCheckedIn(_logger, id, now);

            return Ok(new
            {
                message = "Patient checked in",
                checkedInAt = now,
                appointmentId = id
            });
        }

        [LoggerMessage(Level = LogLevel.Information, Message = "Fetching all appointments, includePast={IncludePast}")]
        private static partial void LogGetAllAppointments(ILogger logger, bool includePast);

        [LoggerMessage(Level = LogLevel.Information, Message = "Appointment lookup: id={Id}, found={Found}")]
        private static partial void LogLookup(ILogger logger, string id, bool found);

        [LoggerMessage(Level = LogLevel.Information, Message = "Fetching appointments for doctor {DoctorId}, includePast={IncludePast}")]
        private static partial void LogGetByDoctorAppointments(ILogger logger, string doctorId, bool includePast);

        [LoggerMessage(Level = LogLevel.Information, Message = "Processed {Count} expired appointments as NoShow")]
        private static partial void LogProcessExpiredCompleted(ILogger logger, int count);

        [LoggerMessage(Level = LogLevel.Warning, Message = "High volume of expired appointments processed: {Count}")]
        private static partial void LogProcessExpiredHighCount(ILogger logger, int count);

        [LoggerMessage(Level = LogLevel.Warning, Message = "Slot conflict: doctor {DoctorId}, date {Date}, slot {Slot}")]
        private static partial void LogSlotConflict(ILogger logger, string doctorId, string date, string slot);

        [LoggerMessage(Level = LogLevel.Information, Message = "Appointment {Id} created for doctor {DoctorId} on {Date} at {Slot}")]
        private static partial void LogAppointmentCreated(ILogger logger, string? id, string doctorId, string date, string slot);

        [LoggerMessage(Level = LogLevel.Error, Message = "Failed to send email for appointment {Id}")]
        private static partial void LogEmailFailed(ILogger logger, Exception ex, string? id);

        [LoggerMessage(Level = LogLevel.Information, Message = "Confirmation email sent for appointment {Id}")]
        private static partial void LogConfirmedEmailSent(ILogger logger, string? id);

        [LoggerMessage(Level = LogLevel.Information, Message = "Cancellation email sent for appointment {Id}, cancelledBy={CancelledBy}")]
        private static partial void LogCancelledEmailSent(ILogger logger, string? id, string cancelledBy);

        [LoggerMessage(Level = LogLevel.Information, Message = "Post-visit email sent for appointment {Id}")]
        private static partial void LogPostVisitEmailSent(ILogger logger, string? id);

        [LoggerMessage(Level = LogLevel.Warning, Message = "UpdateStatus called for non-existent appointment {Id}")]
        private static partial void LogAppointmentNotFound(ILogger logger, string id);

        [LoggerMessage(Level = LogLevel.Information, Message = "Appointment {Id} status changed to {Status}")]
        private static partial void LogAppointmentStatusChanged(ILogger logger, string id, AppointmentStatus status);

        [LoggerMessage(Level = LogLevel.Information, Message = "Patient cancellation: appointment {Id} cancelled, reason={Reason}")]
        private static partial void LogPatientCancelled(ILogger logger, string? id, string reason);

        [LoggerMessage(Level = LogLevel.Warning, Message = "Patient cancellation blocked — within 24 hours: appointment {Id}, hours remaining={Hours}")]
        private static partial void LogPatientCancelWithin24Hours(ILogger logger, string? id, double hours);

        [LoggerMessage(Level = LogLevel.Warning, Message = "Patient cancellation failed — wrong ownership: id={Id}")]
        private static partial void LogPatientCancelOwnershipFailed(ILogger logger, string id);

        [LoggerMessage(Level = LogLevel.Information, Message = "Appointment {OldId} rescheduled to {NewDate} at {NewSlot}, new id={NewId}")]
        private static partial void LogAppointmentRescheduled(ILogger logger, string oldId, string newDate, string newSlot, string? newId);

        [LoggerMessage(Level = LogLevel.Warning, Message = "Reschedule failed — slot conflict: doctor {DoctorId}, date {NewDate}, slot {NewSlot}")]
        private static partial void LogRescheduleSlotConflict(ILogger logger, string doctorId, string newDate, string newSlot);

        [LoggerMessage(Level = LogLevel.Warning, Message = "Follow-up appointment {PreviousId} doctor mismatch with booking doctor {DoctorId}")]
        private static partial void LogFollowUpDoctorMismatch(ILogger logger, string previousId, string doctorId);

        [LoggerMessage(Level = LogLevel.Information, Message = "Patient checked in for appointment {Id} at {CheckedInAt}")]
        private static partial void LogPatientCheckedIn(ILogger logger, string id, DateTime checkedInAt);

        [GeneratedRegex(@"^\d{2}:\d{2}$")]
        private static partial Regex SlotFormatRegex();
    }
}
