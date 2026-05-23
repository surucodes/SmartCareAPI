import api from './api'
import type {
  Appointment,
  CreateAppointmentDto,
  CreateAppointmentResponse,
  PatientCancelDto,
  UpdateStatusDto,
  RescheduleDto,
} from '@/types/appointment.types'

export const appointmentsService = {
  create: (dto: CreateAppointmentDto) =>
    api
      .post<CreateAppointmentResponse>('/api/appointments', dto)
      .then((r) => r.data),

  getAll: (includePast = false) =>
    api
      .get<Appointment[]>('/api/appointments', {
        params: { includePast },
      })
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<Appointment>(`/api/appointments/${id}`).then((r) => r.data),

  getByDoctor: (doctorId: string, includePast = false) =>
    api
      .get<Appointment[]>(`/api/appointments/doctor/${doctorId}`, {
        params: { includePast },
      })
      .then((r) => r.data),

  lookup: (id: string, phone: string) =>
    api
      .get<Appointment>('/api/appointments/lookup', {
        params: { id, phone },
      })
      .then((r) => r.data),

  patientCancel: (dto: PatientCancelDto) =>
    api
      .post<{ message: string; appointmentId: string; cancelledAt: string }>(
        '/api/appointments/patient-cancel',
        dto
      )
      .then((r) => r.data),

  updateStatus: (id: string, dto: UpdateStatusDto) =>
    api
      .patch(`/api/appointments/${id}/status`, dto)
      .then((r) => r.data),

  checkIn: (id: string) =>
    api
      .patch<{ message: string; checkedInAt: string; appointmentId: string }>(
        `/api/appointments/${id}/checkin`
      )
      .then((r) => r.data),

  reschedule: (id: string, dto: RescheduleDto) =>
    api
      .post<{
        message: string
        originalAppointmentId: string
        newAppointment: Appointment
      }>(`/api/appointments/${id}/reschedule`, dto)
      .then((r) => r.data),

  processExpired: () =>
    api
      .post<{ message: string; processed: number }>(
        '/api/appointments/process-expired'
      )
      .then((r) => r.data),
}
