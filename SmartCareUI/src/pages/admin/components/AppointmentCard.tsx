import type { MouseEvent } from 'react'
import { cn } from '@/utils/cn'
import { formatDisplayTime, formatTimestamp } from '@/utils/date.utils'
import type { Appointment } from '@/types/appointment.types'
import {
  BUTTON_PALETTE,
  getActionButtons,
  type ActionId,
} from './appointment-actions'

interface AppointmentCardProps {
  appointment: Appointment
  selected?: boolean
  onClick: () => void
  onConfirm: () => void
  onComplete: () => void
  onMarkNoShow: () => void
  onCancel: () => void
  onCheckIn: () => void
}

/* ── Status meta ───────────────────────────────────────────────────── */

function statusBorderClass(appt: Appointment): string {
  switch (appt.status) {
    case 'Pending':   return 'border-l-amber-400'
    case 'Confirmed': return 'border-l-teal-600'
    default:          return 'border-l-gray-300'
  }
}

function statusBadgeClass(appt: Appointment): string {
  switch (appt.status) {
    case 'Pending':   return 'bg-amber-100 text-amber-800'
    case 'Confirmed': return 'bg-teal-100 text-teal-800'
    case 'Completed': return 'bg-gray-100 text-gray-600'
    case 'Cancelled':
    case 'NoShow':    return 'bg-gray-100 text-gray-500'
  }
}

function statusLabel(appt: Appointment): string {
  switch (appt.status) {
    case 'Pending':   return 'Pending'
    case 'Confirmed': return 'Confirmed'
    case 'Completed': return 'Completed'
    case 'Cancelled': return 'Cancelled'
    case 'NoShow':    return 'No Show'
  }
}

/* ── Component ─────────────────────────────────────────────────────── */

export function AppointmentCard({
  appointment,
  selected = false,
  onClick,
  onConfirm,
  onComplete,
  onMarkNoShow,
  onCancel,
  onCheckIn,
}: AppointmentCardProps) {
  const isDimmed =
    appointment.status === 'Completed' ||
    appointment.status === 'Cancelled' ||
    appointment.status === 'NoShow'

  const isCheckedIn = appointment.checkedInAt !== null

  const stop = (e: MouseEvent) => e.stopPropagation()
  const handlersByAction: Record<ActionId, () => void> = {
    confirm:  onConfirm,
    checkIn:  onCheckIn,
    complete: onComplete,
    noShow:   onMarkNoShow,
    cancel:   onCancel,
  }

  const buttonIds = getActionButtons(appointment)
  const [primary, ...rest] = buttonIds

  const baseBtn =
    'min-h-[44px] text-sm font-medium rounded-lg px-3 transition-colors'

  /* Bottom timestamp / label for read-only states */
  let bottomNote: string | null = null
  if (appointment.status === 'Completed') {
    // Spec: no completedAt field — label only, no timestamp
    bottomNote = 'Completed'
  } else if (appointment.status === 'Cancelled' && appointment.cancelledAt) {
    bottomNote = `Cancelled at ${formatTimestamp(appointment.cancelledAt)}`
  } else if (appointment.status === 'NoShow') {
    bottomNote = 'Marked No Show'
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'relative bg-white rounded-xl border border-gray-100 border-l-4 p-4 cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-600 transition-shadow duration-150',
        statusBorderClass(appointment),
        isDimmed && 'opacity-70',
        selected && 'ring-2 ring-teal-600 bg-teal-50',
      )}
    >

      {/* Checked-in pill (top-right) */}
      {isCheckedIn && (
        <span className="absolute top-3 right-3 bg-teal-100 text-teal-800 rounded-full px-2 py-0.5 text-[10px] font-semibold">
          Checked In
        </span>
      )}

      {/* Row 1: time + consult + status */}
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-brand-dark">
            {formatDisplayTime(appointment.slot)}
          </span>
          {appointment.consultationTypeName && (
            <span className="text-xs text-gray-400 truncate">
              {appointment.consultationTypeName}
            </span>
          )}
        </div>
        {!isCheckedIn && (
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0',
              statusBadgeClass(appointment),
            )}
          >
            {statusLabel(appointment)}
          </span>
        )}
      </div>

      {/* Row 2: patient name + type + queue */}
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <h3 className="font-semibold text-brand-dark text-base">
          {appointment.patientName}
        </h3>
        <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">
          {appointment.patientType}
        </span>
        {appointment.queuePosition > 1 && (
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 rounded px-1.5 py-0.5">
            Q#{appointment.queuePosition}
          </span>
        )}
      </div>

      {/* Row 3: phone + follow-up */}
      <p className="text-xs text-gray-500">
        {appointment.patientPhone}
        {appointment.isFollowUp && (
          <span className="italic ml-1 text-gray-400"> • Follow-up</span>
        )}
      </p>

      {/* Action buttons (single source of truth) */}
      {buttonIds.length > 0 && (
        <div className="mt-3 space-y-2">
          {/* Primary — full width */}
          <button
            type="button"
            className={cn(
              baseBtn,
              'w-full',
              BUTTON_PALETTE[primary].classes,
            )}
            onClick={(e) => { stop(e); handlersByAction[primary]() }}
          >
            {BUTTON_PALETTE[primary].label}
          </button>
          {/* Secondary — flex row */}
          {rest.length > 0 && (
            <div className="flex gap-2">
              {rest.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={cn(
                    baseBtn,
                    'flex-1',
                    BUTTON_PALETTE[id].classes,
                  )}
                  onClick={(e) => { stop(e); handlersByAction[id]() }}
                >
                  {BUTTON_PALETTE[id].label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Read-only timestamp / label */}
      {bottomNote && (
        <p className="mt-3 text-xs text-gray-400">{bottomNote}</p>
      )}
    </div>
  )
}
