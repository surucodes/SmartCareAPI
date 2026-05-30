import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { appointmentsService } from '@/services/appointments.service'
import type { RescheduleDto } from '@/types/appointment.types'

export interface ActionError {
  message: string
  status: number | null
}

function toActionError(err: unknown): ActionError {
  if (isAxiosError(err)) {
    const status = err.response?.status ?? null
    const data = err.response?.data
    if (data && typeof data === 'object' && 'error' in data) {
      const e = (data as { error: unknown }).error
      if (typeof e === 'string') return { message: e, status }
    }
    return { message: err.message || 'Request failed. Please try again.', status }
  }
  return { message: 'Something went wrong. Please try again.', status: null }
}

export interface ActionState {
  isPending: boolean
  error: ActionError | null
}

export interface AppointmentActions {
  confirm: (id: string) => void
  complete: (id: string) => void
  markNoShow: (id: string) => void
  cancel: (id: string, reason: string) => void
  checkIn: (id: string) => void
  reschedule: (id: string, dto: RescheduleDto) => void

  confirmState: ActionState
  completeState: ActionState
  noShowState: ActionState
  cancelState: ActionState
  checkInState: ActionState
  rescheduleState: ActionState
}

export function useAppointmentActions(refetch: () => void): AppointmentActions {
  const confirmMutation = useMutation({
    mutationFn: (id: string) =>
      appointmentsService.updateStatus(id, { status: 'Confirmed' }),
    onSuccess: () => refetch(),
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) =>
      appointmentsService.updateStatus(id, { status: 'Completed' }),
    onSuccess: () => refetch(),
  })

  const noShowMutation = useMutation({
    mutationFn: (id: string) =>
      appointmentsService.updateStatus(id, { status: 'NoShow' }),
    onSuccess: () => refetch(),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      appointmentsService.updateStatus(id, {
        status: 'Cancelled',
        cancelledBy: 'Admin',
        cancellationReason: reason,
      }),
    onSuccess: () => refetch(),
  })

  const checkInMutation = useMutation({
    mutationFn: (id: string) => appointmentsService.checkIn(id),
    onSuccess: () => refetch(),
  })

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RescheduleDto }) =>
      appointmentsService.reschedule(id, dto),
    onSuccess: () => refetch(),
  })

  return {
    confirm: (id) => confirmMutation.mutate(id),
    complete: (id) => completeMutation.mutate(id),
    markNoShow: (id) => noShowMutation.mutate(id),
    cancel: (id, reason) => cancelMutation.mutate({ id, reason }),
    checkIn: (id) => checkInMutation.mutate(id),
    reschedule: (id, dto) => rescheduleMutation.mutate({ id, dto }),

    confirmState: {
      isPending: confirmMutation.isPending,
      error: confirmMutation.isError ? toActionError(confirmMutation.error) : null,
    },
    completeState: {
      isPending: completeMutation.isPending,
      error: completeMutation.isError ? toActionError(completeMutation.error) : null,
    },
    noShowState: {
      isPending: noShowMutation.isPending,
      error: noShowMutation.isError ? toActionError(noShowMutation.error) : null,
    },
    cancelState: {
      isPending: cancelMutation.isPending,
      error: cancelMutation.isError ? toActionError(cancelMutation.error) : null,
    },
    checkInState: {
      isPending: checkInMutation.isPending,
      error: checkInMutation.isError ? toActionError(checkInMutation.error) : null,
    },
    rescheduleState: {
      isPending: rescheduleMutation.isPending,
      error: rescheduleMutation.isError
        ? toActionError(rescheduleMutation.error)
        : null,
    },
  }
}
