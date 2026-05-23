export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'NoShow'

export type PatientType = 'New' | 'Returning'

export type ReferralSource =
  | 'Self'
  | 'DoctorReferral'
  | 'HospitalReferral'
  | 'Other'

export type AppointmentType = 'OPD' | 'Emergency'

export interface Appointment {
  id: string
  doctorId: string
  patientName: string
  patientPhone: string
  patientEmail: string
  date: string
  slot: string
  status: AppointmentStatus
  notes: string
  patientType: PatientType
  referralSource: ReferralSource
  appointmentType: AppointmentType
  consultationTypeId: string | null
  consultationTypeName: string | null
  consultationDurationMinutes: number | null
  consultationBufferMinutes: number | null
  isFollowUp: boolean
  previousAppointmentId: string | null
  queuePosition: number
  checkedInAt: string | null
  cancellationReason: string | null
  cancelledBy: string | null
  cancelledAt: string | null
  createdAt: string
}

export interface CreateAppointmentDto {
  doctorId: string
  patientName: string
  patientPhone: string
  patientEmail: string
  date: string
  slot: string
  notes?: string
  patientType: PatientType
  referralSource: ReferralSource
  appointmentType: AppointmentType
  consultationTypeId?: string
  isFollowUp: boolean
  previousAppointmentId?: string
}

export interface CreateAppointmentResponse {
  appointment: Appointment
  message: string
}

export interface PatientCancelDto {
  appointmentId: string
  patientPhone: string
  reason: string
}

export interface UpdateStatusDto {
  status: AppointmentStatus
  cancelledBy?: string
  cancellationReason?: string
}

export interface RescheduleDto {
  newDate: string
  newSlot: string
  reason: string
}
