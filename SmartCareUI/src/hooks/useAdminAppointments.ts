import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { appointmentsService } from '@/services/appointments.service'
import { doctorsService } from '@/services/doctors.service'
import { getTodayIST } from '@/utils/date.utils'
import type { Appointment } from '@/types/appointment.types'
import type { Doctor } from '@/types/doctor.types'

export interface UseAdminAppointments {
  doctors: Doctor[]
  appointmentsByDoctorId: Record<string, Appointment[]>
  /** yyyy-MM-dd dates with at least one Pending or Confirmed appointment — for calendar dots. */
  daysWithAppointments: Set<string>
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

/**
 * Fetches doctors + appointments for the selected date.
 * - Past dates use `getAll(true)` to include past records.
 * - Today/future use `getAll(false)`.
 * - Results are filtered client-side to `a.date === selectedDate`.
 */
export function useAdminAppointments(selectedDate: string): UseAdminAppointments {
  const [processExpiredDone, setProcessExpiredDone] = useState(false)

  useEffect(() => {
    appointmentsService
      .processExpired()
      .catch((err) => console.error('Silent processExpired failed:', err))
      .finally(() => setProcessExpiredDone(true))
  }, [])

  const doctorsQuery = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: doctorsService.getAll,
    staleTime: Infinity,
  })

  const includePast = selectedDate < getTodayIST()

  const appointmentsQuery = useQuery({
    queryKey: ['admin-appointments', selectedDate],
    queryFn: () => appointmentsService.getAll(includePast),
    enabled: processExpiredDone,
    refetchInterval: 60000,
    staleTime: 0,
  })

  const doctors = doctorsQuery.data ?? []
  const allAppointments = appointmentsQuery.data ?? []

  const appointmentsByDoctorId = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {}
    for (const doctor of doctors) {
      grouped[doctor.id] = []
    }
    for (const appt of allAppointments) {
      if (appt.date !== selectedDate) continue
      if (grouped[appt.doctorId]) {
        grouped[appt.doctorId].push(appt)
      } else {
        grouped[appt.doctorId] = [appt]
      }
    }
    return grouped
  }, [doctors, allAppointments, selectedDate])

  const daysWithAppointments = useMemo(() => {
    const set = new Set<string>()
    for (const a of allAppointments) {
      if (a.status === 'Pending' || a.status === 'Confirmed') {
        set.add(a.date)
      }
    }
    return set
  }, [allAppointments])

  return {
    doctors,
    appointmentsByDoctorId,
    daysWithAppointments,
    isLoading: doctorsQuery.isLoading || appointmentsQuery.isLoading,
    isError: doctorsQuery.isError || appointmentsQuery.isError,
    refetch: () => {
      appointmentsQuery.refetch()
    },
  }
}
