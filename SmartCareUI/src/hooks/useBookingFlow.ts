import { useCallback, useState } from 'react'
import { appointmentsService } from '@/services/appointments.service'
import type { Doctor } from '@/types/doctor.types'
import type {
  CreateAppointmentDto,
  CreateAppointmentResponse,
  PatientType,
  ReferralSource,
} from '@/types/appointment.types'

export type BookingStep = 1 | 2 | 3 | 'confirmation'

export interface PatientDetailsPayload {
  fullName: string
  phone: string         // 10-digit string, no +91
  email: string
  patientType: PatientType
  referralSource: ReferralSource
  isFollowUp: boolean
  notes?: string
}

export interface BookingFlowState {
  currentStep: BookingStep
  selectedDoctorId: string | null
  selectedDoctor: Doctor | null
  selectedConsultationTypeId: string | null
  selectedConsultationTypeName: string | null
  selectedDate: string | null
  selectedSlot: string | null
  completedAppointment: CreateAppointmentResponse | null
}

export interface UseBookingFlow extends BookingFlowState {
  goToStep: (step: BookingStep) => void
  goBack: () => void
  reset: () => void
  setDoctor: (doctor: Doctor, consultationTypeId: string, consultationTypeName: string) => void
  clearDoctor: () => void
  setDateTime: (date: string, slot: string) => void
  submitBooking: (details: PatientDetailsPayload) => Promise<CreateAppointmentResponse>
}

const INITIAL_STATE: BookingFlowState = {
  currentStep: 1,
  selectedDoctorId: null,
  selectedDoctor: null,
  selectedConsultationTypeId: null,
  selectedConsultationTypeName: null,
  selectedDate: null,
  selectedSlot: null,
  completedAppointment: null,
}

export function useBookingFlow(): UseBookingFlow {
  const [state, setState] = useState<BookingFlowState>(INITIAL_STATE)

  const goToStep = useCallback((step: BookingStep) => {
    setState((prev) => ({ ...prev, currentStep: step }))
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep === 2) return { ...prev, currentStep: 1 }
      if (prev.currentStep === 3) return { ...prev, currentStep: 2 }
      return prev
    })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const reset = useCallback(() => setState(INITIAL_STATE), [])

  const setDoctor = useCallback(
    (doctor: Doctor, consultationTypeId: string, consultationTypeName: string) => {
      setState((prev) => ({
        ...prev,
        selectedDoctor: doctor,
        selectedDoctorId: doctor.id,
        selectedConsultationTypeId: consultationTypeId,
        selectedConsultationTypeName: consultationTypeName,
      }))
    },
    [],
  )

  const clearDoctor = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedDoctor: null,
      selectedDoctorId: null,
      selectedConsultationTypeId: null,
      selectedConsultationTypeName: null,
    }))
  }, [])

  const setDateTime = useCallback((date: string, slot: string) => {
    setState((prev) => ({ ...prev, selectedDate: date, selectedSlot: slot }))
  }, [])

  const submitBooking = useCallback(
    async (details: PatientDetailsPayload): Promise<CreateAppointmentResponse> => {
      if (
        !state.selectedDoctorId ||
        !state.selectedConsultationTypeId ||
        !state.selectedDate ||
        !state.selectedSlot
      ) {
        throw new Error('Missing booking selections')
      }

      const dto: CreateAppointmentDto = {
        doctorId: state.selectedDoctorId,
        patientName: details.fullName.trim(),
        patientPhone: details.phone,
        patientEmail: details.email.trim(),
        date: state.selectedDate,
        slot: state.selectedSlot,
        notes: details.notes?.trim() || undefined,
        patientType: details.patientType,
        referralSource: details.referralSource,
        appointmentType: 'OPD',
        consultationTypeId: state.selectedConsultationTypeId,
        isFollowUp: details.isFollowUp,
      }

      const response = await appointmentsService.create(dto)
      setState((prev) => ({
        ...prev,
        completedAppointment: response,
        currentStep: 'confirmation',
      }))
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
      return response
    },
    [
      state.selectedDoctorId,
      state.selectedConsultationTypeId,
      state.selectedDate,
      state.selectedSlot,
    ],
  )

  return {
    ...state,
    goToStep,
    goBack,
    reset,
    setDoctor,
    clearDoctor,
    setDateTime,
    submitBooking,
  }
}
