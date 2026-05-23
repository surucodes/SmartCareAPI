import api from './api'
import type {
  Doctor,
  ConsultationType,
  AvailableSlotsResponse,
} from '@/types/doctor.types'

export const doctorsService = {
  getAll: () =>
    api.get<Doctor[]>('/api/doctors').then((r) => r.data),

  getById: (id: string) =>
    api.get<Doctor>(`/api/doctors/${id}`).then((r) => r.data),

  getConsultationTypes: (doctorId: string) =>
    api
      .get<ConsultationType[]>(`/api/doctors/${doctorId}/consultation-types`)
      .then((r) => r.data),

  getAvailableSlots: (
    doctorId: string,
    date: string,
    consultationTypeId?: string
  ) => {
    const params: Record<string, string> = { date }
    if (consultationTypeId) params.consultationTypeId = consultationTypeId
    return api
      .get<AvailableSlotsResponse>(
        `/api/doctors/${doctorId}/available-slots`,
        { params }
      )
      .then((r) => r.data)
  },
}
