import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { startOfWeek, parseISO } from 'date-fns'
import { appointmentsService } from '@/services/appointments.service'
import { getTodayIST } from '@/utils/date.utils'
import type { Appointment } from '@/types/appointment.types'

export type DoctorFilter = 'all' | 'confirmed' | 'pending' | 'cancelled'

export interface UseDoctorSchedule {
  /** Active appointments (Pending + Confirmed) when filter === 'all', else the single filtered group. */
  activeAppointments: Appointment[]
  /** Past + closed (Completed + Cancelled + NoShow) — only populated when filter === 'all'. */
  pastAppointments: Appointment[]
  /** Total visible after filtering — used for the date heading count pill. */
  totalCount: number
  /** Set of yyyy-MM-dd dates with at least one Pending or Confirmed appointment, used for week-strip dots. */
  daysWithAppointments: Set<string>
  isLoading: boolean
  isError: boolean
  selectedDate: string
  setSelectedDate: (date: string) => void
  selectedFilter: DoctorFilter
  setSelectedFilter: (filter: DoctorFilter) => void
  currentWeekStart: Date
  setCurrentWeekStart: (date: Date) => void
  refetch: () => void
}

function mondayOf(yyyymmdd: string): Date {
  const d = parseISO(yyyymmdd)
  // weekStartsOn 1 = Monday
  return startOfWeek(d, { weekStartsOn: 1 })
}

function bySlot(a: Appointment, b: Appointment): number {
  return a.slot.localeCompare(b.slot)
}

export function useDoctorSchedule(doctorId: string | null): UseDoctorSchedule {
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayIST())
  const [selectedFilter, setSelectedFilter] = useState<DoctorFilter>('all')
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    mondayOf(getTodayIST()),
  )
  const [processExpiredDone, setProcessExpiredDone] = useState(false)

  useEffect(() => {
    appointmentsService
      .processExpired()
      .catch((err) => console.error('Silent processExpired failed:', err))
      .finally(() => setProcessExpiredDone(true))
  }, [])

  const today = getTodayIST()
  const includePast = selectedDate < today

  const dayQuery = useQuery({
    queryKey: ['doctor-day', doctorId, selectedDate],
    queryFn: () => appointmentsService.getByDoctor(doctorId!, includePast),
    enabled: !!doctorId && processExpiredDone,
    refetchInterval: 60000,
    staleTime: 30000,
  })

  const monthQuery = useQuery({
    queryKey: ['doctor-month', doctorId],
    queryFn: () => appointmentsService.getByDoctor(doctorId!, true),
    enabled: !!doctorId && processExpiredDone,
    staleTime: 5 * 60 * 1000,
  })

  const daysWithAppointments = useMemo(() => {
    const set = new Set<string>()
    for (const a of monthQuery.data ?? []) {
      if (a.status === 'Pending' || a.status === 'Confirmed') {
        set.add(a.date)
      }
    }
    return set
  }, [monthQuery.data])

  const { activeAppointments, pastAppointments, totalCount } = useMemo(() => {
    const all = dayQuery.data ?? []
    const today = all.filter((a) => a.date === selectedDate)

    const active = today
      .filter((a) => a.status === 'Pending' || a.status === 'Confirmed')
      .sort(bySlot)
    const past = today
      .filter(
        (a) =>
          a.status === 'Completed' ||
          a.status === 'Cancelled' ||
          a.status === 'NoShow',
      )
      .sort(bySlot)

    switch (selectedFilter) {
      case 'confirmed': {
        const list = today.filter((a) => a.status === 'Confirmed').sort(bySlot)
        return { activeAppointments: list, pastAppointments: [], totalCount: list.length }
      }
      case 'pending': {
        const list = today.filter((a) => a.status === 'Pending').sort(bySlot)
        return { activeAppointments: list, pastAppointments: [], totalCount: list.length }
      }
      case 'cancelled': {
        const list = today
          .filter((a) => a.status === 'Cancelled' || a.status === 'NoShow')
          .sort(bySlot)
        return { activeAppointments: list, pastAppointments: [], totalCount: list.length }
      }
      case 'all':
      default:
        return {
          activeAppointments: active,
          pastAppointments: past,
          totalCount: today.length,
        }
    }
  }, [dayQuery.data, selectedDate, selectedFilter])

  return {
    activeAppointments,
    pastAppointments,
    totalCount,
    daysWithAppointments,
    isLoading: dayQuery.isLoading,
    isError: dayQuery.isError,
    selectedDate,
    setSelectedDate,
    selectedFilter,
    setSelectedFilter,
    currentWeekStart,
    setCurrentWeekStart,
    refetch: () => {
      dayQuery.refetch()
      monthQuery.refetch()
    },
  }
}
