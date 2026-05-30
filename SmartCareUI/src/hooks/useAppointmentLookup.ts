import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { appointmentsService } from '@/services/appointments.service'
import type { Appointment } from '@/types/appointment.types'

interface LookupParams {
  id: string
  phone: string
}

export interface UseAppointmentLookup {
  appointment: Appointment | null
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  lookup: (id: string, phone: string) => void
  cancelAppointment: (reason: string) => Promise<void>
  isCancelling: boolean
  cancelError: string | null
  cancelSuccess: boolean
  reset: () => void
}

// Strip everything non-numeric, then drop a leading "91" country code if present
// so a "+91 98765 43210" entry collapses to the canonical 10-digit form the
// backend stores. Form Zod validation already requires exactly 10 digits.
function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

// Strip a "SH-" display prefix if the patient typed the short form. The result
// almost certainly will NOT be a valid 24-char ObjectId — the backend will return
// 404 and the patient will be asked to use the full ID from their email.
function normalizeAppointmentId(input: string): string {
  return input.trim().replace(/^SH-/i, '')
}

function parseLookupError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Connection failed. Please try again.'
    if (err.response.status === 404) {
      return 'No appointment found. Please check your ID and phone number and try again.'
    }
    const data = err.response.data as { error?: string } | undefined
    return data?.error ?? 'Could not load your appointment. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

export function useAppointmentLookup(): UseAppointmentLookup {
  const queryClient = useQueryClient()
  const [params, setParams] = useState<LookupParams | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelSuccess, setCancelSuccess] = useState(false)

  const lookupQuery = useQuery<Appointment, unknown>({
    queryKey: ['appointment-lookup', params?.id, params?.phone],
    queryFn: () => appointmentsService.lookup(params!.id, params!.phone),
    enabled: !!params?.id && !!params?.phone,
    retry: false,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })

  const cancelMutation = useMutation({
    mutationFn: async (reason: string) => {
      if (!params || !lookupQuery.data) {
        throw new Error('No appointment to cancel')
      }
      return appointmentsService.patientCancel({
        appointmentId: lookupQuery.data.id,
        patientPhone: params.phone,
        reason,
      })
    },
    onSuccess: (_data, reason) => {
      if (!params || !lookupQuery.data) return
      const optimistic: Appointment = {
        ...lookupQuery.data,
        status: 'Cancelled',
        cancellationReason: reason,
        cancelledBy: 'Patient',
        cancelledAt: new Date().toISOString(),
      }
      queryClient.setQueryData(
        ['appointment-lookup', params.id, params.phone],
        optimistic,
      )
      setCancelSuccess(true)
      setCancelError(null)
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setCancelError(
          'This appointment can no longer be cancelled online. Please call us at 080 1234 5678.',
        )
      } else if (axios.isAxiosError(err) && err.response?.status === 404) {
        setCancelError(
          'We could not find that appointment. Please refresh and try again.',
        )
      } else {
        setCancelError(
          'Something went wrong. Please try again or call us at 080 1234 5678.',
        )
      }
    },
  })

  const lookup = useCallback((id: string, phone: string) => {
    const normalizedId = normalizeAppointmentId(id)
    const normalizedPhone = normalizePhone(phone)
    setCancelError(null)
    setCancelSuccess(false)
    cancelMutation.reset()
    setParams({ id: normalizedId, phone: normalizedPhone })
  }, [cancelMutation])

  const cancelAppointment = useCallback(
    async (reason: string) => {
      setCancelError(null)
      try {
        await cancelMutation.mutateAsync(reason)
      } catch {
        // Surfaced via cancelError state by onError handler.
      }
    },
    [cancelMutation],
  )

  const reset = useCallback(() => {
    setParams(null)
    setCancelError(null)
    setCancelSuccess(false)
    cancelMutation.reset()
  }, [cancelMutation])

  return {
    appointment: lookupQuery.data ?? null,
    isLoading: !!params && (lookupQuery.isLoading || lookupQuery.isFetching),
    isError: lookupQuery.isError,
    errorMessage: lookupQuery.isError ? parseLookupError(lookupQuery.error) : null,
    lookup,
    cancelAppointment,
    isCancelling: cancelMutation.isPending,
    cancelError,
    cancelSuccess,
    reset,
  }
}
