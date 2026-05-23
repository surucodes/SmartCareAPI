import { useQuery } from '@tanstack/react-query'
import { doctorsService } from '@/services/doctors.service'
import type { AvailableSlotsResponse, SlotResponse } from '@/types/doctor.types'

export interface UseAvailableSlotsResult {
  slots: SlotResponse[]
  data: AvailableSlotsResponse | undefined
  isLoading: boolean
  isError: boolean
  emergencyOnly: boolean
  emergencyMessage: string | undefined
  refetch: () => void
}

export function useAvailableSlots(
  doctorId: string | null,
  date: string | null,
  consultationTypeId: string | null,
): UseAvailableSlotsResult {
  const enabled = Boolean(doctorId && date)

  const query = useQuery<AvailableSlotsResponse>({
    queryKey: ['available-slots', doctorId, date, consultationTypeId],
    queryFn: () => {
      if (!doctorId || !date) {
        return Promise.reject(new Error('doctorId and date are required'))
      }
      return doctorsService.getAvailableSlots(
        doctorId,
        date,
        consultationTypeId ?? undefined,
      )
    },
    enabled,
    staleTime: 30_000,
    retry: 1,
  })

  return {
    slots: query.data?.slots ?? [],
    data: query.data,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    emergencyOnly: query.data?.emergencyOnly ?? false,
    emergencyMessage: query.data?.emergencyMessage,
    refetch: () => {
      void query.refetch()
    },
  }
}
