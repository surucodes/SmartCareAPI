import { useState } from 'react'
import { cn } from '@/utils/cn'
import { formatDisplayTime } from '@/utils/date.utils'
import type { Appointment } from '@/types/appointment.types'
import type { DoctorAppointmentActions } from '@/hooks/useDoctorAppointmentActions'
import {
  DOCTOR_BUTTON_PALETTE,
  getDoctorActions,
  type DoctorActionId,
} from './doctor-actions'
import { DoctorCancelForm } from './DoctorCancelForm'
import { DoctorRescheduleForm } from './DoctorRescheduleForm'

interface DoctorAppointmentCardProps {
  appointment: Appointment
  actions: DoctorAppointmentActions
  onCardClick?: () => void
  selected?: boolean
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function getInitials(name: string): string {
  const cleaned = name.trim()
  if (!cleaned) return '?'
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) {
    return (parts[0].slice(0, 2) || '?').toUpperCase()
  }
  const first = parts[0][0] ?? ''
  const last = parts[parts.length - 1][0] ?? ''
  return (first + last).toUpperCase()
}

function statusLeftBarColor(s: Appointment['status']): string {
  switch (s) {
    case 'Pending':   return 'bg-amber-500'
    case 'Confirmed': return 'bg-teal-600'
    case 'Cancelled': return 'bg-red-300'
    default:          return 'bg-gray-300'
  }
}

interface PillMeta { dotBg: string; bg: string; text: string; label: string }
function statusPillMeta(a: Appointment): PillMeta {
  switch (a.status) {
    case 'Pending':
      return { dotBg: 'bg-amber-600', bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' }
    case 'Confirmed':
      return { dotBg: 'bg-teal-600', bg: 'bg-teal-100', text: 'text-teal-800', label: 'Confirmed' }
    case 'Completed':
      return { dotBg: 'bg-emerald-700', bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Completed' }
    case 'Cancelled':
      return { dotBg: 'bg-red-500', bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
    case 'NoShow':
      return { dotBg: 'bg-gray-500', bg: 'bg-gray-100', text: 'text-gray-600', label: 'No Show' }
  }
}

/* ── Icons ─────────────────────────────────────────────────────────── */

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-3 h-3" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10.5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PrescriptionIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" aria-hidden="true">
      <path d="M5 3h4a3 3 0 010 6H5V3zM5 9l5 5M10 11l4 4-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EventRepeatIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 12l-2 2 2 2M9 14h2a2 2 0 002-2v-0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Component ─────────────────────────────────────────────────────── */

type FormMode = 'cancel' | 'reschedule' | null

export function DoctorAppointmentCard({
  appointment,
  actions,
  onCardClick,
  selected = false,
}: DoctorAppointmentCardProps) {
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [showFullNotes, setShowFullNotes] = useState(false)

  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation()

  const isReadOnly =
    appointment.status === 'Completed' ||
    appointment.status === 'Cancelled' ||
    appointment.status === 'NoShow'

  const isCheckedIn = appointment.checkedInAt !== null
  const { primary, hasReschedule } = getDoctorActions(appointment)
  const pill = statusPillMeta(appointment)

  const handlersByAction: Record<DoctorActionId, () => void> = {
    confirm:  () => actions.confirm(appointment.id),
    complete: () => actions.complete(appointment.id),
    cancel:   () => setFormMode('cancel'),
  }
  const isPendingByAction: Record<DoctorActionId, boolean> = {
    confirm:  actions.confirmState.isPending,
    complete: actions.completeState.isPending,
    cancel:   false,
  }

  /* Form submission handlers --------------------------------------- */
  const handleCancelSubmit = (reason: string) => {
    actions.cancel(appointment.id, reason)
    // Form closes naturally on refetch when status flips to Cancelled
  }
  const handleRescheduleSubmit = (dto: { newDate: string; newSlot: string; reason: string }) => {
    actions.reschedule(appointment.id, dto)
  }

  // Clear local success message when the appointment changes
  // (refetch updates the appointment prop, so this triggers on success too).
  const rescheduleError = actions.rescheduleState.error?.message ?? null

  // Show success and auto-collapse when a reschedule mutation succeeds
  // and the appointment's slot/date has changed.
  // The reschedule endpoint returns a new appointment; the current card
  // is the *original*, so on success the original disappears from the
  // list. So we don't need to show a success state on this card —
  // it'll unmount when refetch reconciles.

  /* Layout ---------------------------------------------------------- */

  return (
    <div
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onClick={onCardClick}
      onKeyDown={
        onCardClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onCardClick()
              }
            }
          : undefined
      }
      className={cn(
        'relative bg-white rounded-xl border border-gray-100 p-6 shadow-[0_4px_12px_rgba(19,43,26,0.04)] hover:shadow-[0_8px_24px_rgba(19,43,26,0.08)] transition-shadow overflow-hidden max-w-2xl w-full mx-auto group',
        onCardClick && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600',
        isReadOnly && 'opacity-60',
        selected && 'ring-2 ring-teal-600 bg-teal-50',
      )}
    >

      {/* Subtle left status bar */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 transition-opacity opacity-30 group-hover:opacity-100',
          statusLeftBarColor(appointment.status),
        )}
      />

      {/* Two-column inner layout */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* Left column: time + Q# pill */}
        <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start min-w-[120px] md:border-r border-gray-100 md:pr-6 border-b md:border-b-0 pb-4 md:pb-0">
          <h3 className="text-2xl font-bold text-brand-dark">
            {formatDisplayTime(appointment.slot)}
          </h3>
          {appointment.queuePosition > 1 && (
            <span className="mt-0 md:mt-3 bg-warm-200 text-gray-600 text-[11px] font-semibold px-2 py-0.5 rounded border border-gray-100">
              Q#{appointment.queuePosition}
            </span>
          )}
        </div>

        {/* Right column: content */}
        <div className="flex-1 min-w-0">

          {/* Status + consultation type row */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide',
                pill.bg,
                pill.text,
              )}
            >
              <span aria-hidden="true" className={cn('w-1.5 h-1.5 rounded-full', pill.dotBg)} />
              {pill.label}
            </span>
            {appointment.consultationTypeName && (
              <span className="text-[11px] text-gray-500 uppercase tracking-wider truncate">
                {appointment.consultationTypeName}
              </span>
            )}
            {isCheckedIn && (
              <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-200 text-amber-900">
                <CheckCircleIcon />
                Checked In
              </span>
            )}
          </div>

          {/* Patient identity row */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-teal-700 flex items-center justify-center font-semibold text-sm shrink-0">
              {getInitials(appointment.patientName)}
            </div>
            <h4 className="text-xl font-bold text-brand-dark truncate">
              {appointment.patientName}
            </h4>
          </div>

          {/* Meta line (indented to align under name) */}
          <p className="text-xs text-gray-500 pl-11">
            {appointment.isFollowUp && <span className="italic">Follow-up · </span>}
            {appointment.patientType === 'New' ? 'New Patient' : 'Returning'}
            {appointment.patientPhone && <> · {appointment.patientPhone}</>}
          </p>

          {/* Notes block */}
          {appointment.notes && appointment.notes.trim() !== '' && (
            <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100 flex items-start gap-3 ml-11 mt-3">
              <PrescriptionIcon />
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-sm text-gray-600 italic whitespace-pre-line',
                    !showFullNotes && 'line-clamp-3',
                  )}
                >
                  &ldquo;{appointment.notes}&rdquo;
                </p>
                {appointment.notes.length > 140 && (
                  <button
                    type="button"
                    onClick={(e) => { stop(e); setShowFullNotes((v) => !v) }}
                    className="mt-1 text-xs text-teal-700 hover:underline"
                  >
                    {showFullNotes ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cancellation reason for Cancelled cards */}
          {appointment.status === 'Cancelled' && appointment.cancellationReason && (
            <p className="text-xs text-gray-500 italic ml-11 mt-3">
              Reason: {appointment.cancellationReason}
            </p>
          )}

          {/* Action strip — only for non-read-only states */}
          {!isReadOnly && primary.length > 0 && formMode === null && (
            <div
              onClick={stop}
              className="mt-6 pt-4 border-t border-dashed border-gray-200 flex flex-wrap items-center gap-3"
            >
              {primary.map((id) => {
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={(e) => { stop(e); handlersByAction[id]() }}
                    disabled={isPendingByAction[id]}
                    className={cn(
                      'min-h-[44px] px-5 text-sm font-semibold rounded-md transition-colors w-full sm:w-auto',
                      DOCTOR_BUTTON_PALETTE[id].classes,
                      isPendingByAction[id] && 'opacity-70 cursor-not-allowed',
                    )}
                  >
                    {isPendingByAction[id] ? 'Working…' : DOCTOR_BUTTON_PALETTE[id].label}
                  </button>
                )
              })}
              {hasReschedule && (
                <button
                  type="button"
                  onClick={(e) => { stop(e); setFormMode('reschedule') }}
                  className="min-h-[44px] inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-dark underline transition-colors w-full sm:w-auto sm:ml-2 justify-center sm:justify-start"
                >
                  <EventRepeatIcon />
                  Reschedule
                </button>
              )}
            </div>
          )}

          {/* Inline cancel form */}
          {formMode === 'cancel' && (
            <div
              onClick={stop}
              className="mt-6 pt-4 border-t border-dashed border-gray-200"
            >
              <DoctorCancelForm
                onSubmit={handleCancelSubmit}
                onKeep={() => setFormMode(null)}
                isPending={actions.cancelState.isPending}
                error={actions.cancelState.error?.message ?? null}
              />
            </div>
          )}

          {/* Inline reschedule form */}
          {formMode === 'reschedule' && (
            <div
              onClick={stop}
              className="mt-6 pt-4 border-t border-dashed border-gray-200"
            >
              <DoctorRescheduleForm
                onSubmit={handleRescheduleSubmit}
                onCancel={() => setFormMode(null)}
                isPending={actions.rescheduleState.isPending}
                error={rescheduleError}
                successMessage={null}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
