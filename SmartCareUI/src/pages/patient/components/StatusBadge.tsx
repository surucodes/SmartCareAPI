import type { AppointmentStatus } from '@/types/appointment.types'
import { cn } from '@/utils/cn'

interface StatusBadgeProps {
  status: AppointmentStatus
  className?: string
}

const STATUS_STYLES: Record<
  AppointmentStatus,
  { wrapper: string; dot: string; label: string }
> = {
  Pending: {
    wrapper: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-600',
    label: 'Pending Confirmation',
  },
  Confirmed: {
    wrapper: 'bg-teal-600 text-white',
    dot: 'bg-white/85',
    label: 'Confirmed',
  },
  Completed: {
    wrapper: 'bg-emerald-800 text-white',
    dot: 'bg-white/85',
    label: 'Completed',
  },
  Cancelled: {
    wrapper: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-400',
    label: 'Cancelled',
  },
  NoShow: {
    wrapper: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-400',
    label: 'No Show',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap',
        style.wrapper,
        className,
      )}
      aria-label={`Status: ${style.label}`}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full', style.dot)}
        aria-hidden="true"
      />
      {style.label}
    </span>
  )
}
