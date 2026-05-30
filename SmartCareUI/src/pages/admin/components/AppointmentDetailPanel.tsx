import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import {
  formatDisplayDate,
  formatDisplayTime,
  formatTimestamp,
} from '@/utils/date.utils'
import type { Appointment, ReferralSource } from '@/types/appointment.types'
import type { Doctor } from '@/types/doctor.types'
import type {
  ActionError,
  AppointmentActions,
} from '@/hooks/useAppointmentActions'
import { CancelWithReasonForm } from './CancelWithReasonForm'
import { RescheduleForm } from './RescheduleForm'
import {
  BUTTON_PALETTE,
  getActionButtons,
  type ActionId,
} from './appointment-actions'

interface AppointmentDetailPanelProps {
  appointment: Appointment | null
  doctors: Doctor[]
  onClose: () => void
  actions: AppointmentActions
  cancellingId: string | null
  onStartCancel: (id: string) => void
  onAbortCancel: () => void
  /** Called when checkIn returns 409 — page refetches to reconcile UI silently. */
  onSilentRefetch: () => void
  /** Render as mobile bottom sheet instead of desktop side panel. */
  mobile?: boolean
}

function referralLabel(src: ReferralSource): string {
  switch (src) {
    case 'Self':              return 'Self / Internet'
    case 'DoctorReferral':    return 'Doctor Referral'
    case 'HospitalReferral':  return 'Hospital Referral'
    case 'Other':             return 'Other'
  }
}

function displayId(id: string): string {
  return `SH-${id.slice(-8).toUpperCase()}`
}

function statusBadgeMeta(appt: Appointment): { label: string; classes: string } {
  const isCheckedIn = appt.status === 'Confirmed' && appt.checkedInAt !== null
  switch (appt.status) {
    case 'Pending':
      return { label: 'Pending', classes: 'bg-amber-100 text-amber-800' }
    case 'Confirmed':
      return {
        label: isCheckedIn ? 'Checked In' : 'Confirmed',
        classes: 'bg-teal-100 text-teal-800',
      }
    case 'Completed':
      return { label: 'Completed', classes: 'bg-gray-100 text-gray-600' }
    case 'Cancelled':
      return { label: 'Cancelled', classes: 'bg-gray-100 text-gray-500' }
    case 'NoShow':
      return { label: 'No Show', classes: 'bg-gray-100 text-gray-500' }
  }
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

interface InfoCellProps { label: string; value: string }
function InfoCell({ label, value }: InfoCellProps) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
        {label}
      </p>
      <p className="text-sm text-brand-dark mt-0.5 truncate" title={value}>
        {value}
      </p>
    </div>
  )
}

/** Combined error display logic — suppresses checkIn 409, surfaces all else. */
function selectVisibleError(actions: AppointmentActions): ActionError | null {
  // Skip checkIn 409 entirely.
  const checkInErr = actions.checkInState.error
  const checkInVisible =
    checkInErr && checkInErr.status !== 409 ? checkInErr : null

  return (
    actions.confirmState.error ||
    actions.completeState.error ||
    actions.noShowState.error ||
    checkInVisible ||
    null
  )
}

export function AppointmentDetailPanel({
  appointment,
  doctors,
  onClose,
  actions,
  cancellingId,
  onStartCancel,
  onAbortCancel,
  onSilentRefetch,
  mobile = false,
}: AppointmentDetailPanelProps) {
  const [showReschedule, setShowReschedule] = useState(false)
  const [emailNote, setEmailNote] = useState<string | null>(null)
  const [dismissedErrorMsg, setDismissedErrorMsg] = useState<string | null>(null)

  // Auto-clear the email side-effect note after 3 seconds
  useEffect(() => {
    if (!emailNote) return
    const t = setTimeout(() => setEmailNote(null), 3000)
    return () => clearTimeout(t)
  }, [emailNote])

  // Reset internal state when switching appointments
  useEffect(() => {
    setShowReschedule(false)
    setEmailNote(null)
    setDismissedErrorMsg(null)
  }, [appointment?.id])

  // Silent refetch on checkIn 409
  useEffect(() => {
    const err = actions.checkInState.error
    if (err && err.status === 409) {
      onSilentRefetch()
    }
  }, [actions.checkInState.error, onSilentRefetch])

  if (!appointment) return null

  const doctor = doctors.find((d) => d.id === appointment.doctorId)
  const badge = statusBadgeMeta(appointment)
  const isCancelling = cancellingId === appointment.id

  const buttonIds = getActionButtons(appointment)
  const [primary, ...rest] = buttonIds

  const handlersByAction: Record<ActionId, () => void> = {
    confirm: () => {
      actions.confirm(appointment.id)
      setEmailNote('Confirmation email will be sent to patient.')
    },
    checkIn: () => actions.checkIn(appointment.id),
    complete: () => {
      actions.complete(appointment.id)
      setEmailNote('Post-visit email will be sent to patient.')
    },
    noShow: () => actions.markNoShow(appointment.id),
    cancel: () => onStartCancel(appointment.id),
  }

  const isPendingByAction: Record<ActionId, boolean> = {
    confirm:  actions.confirmState.isPending,
    checkIn:  actions.checkInState.isPending,
    complete: actions.completeState.isPending,
    noShow:   actions.noShowState.isPending,
    cancel:   false,
  }

  /* ── Combined visible error ─────────────────────────────────────── */
  const visibleError = selectVisibleError(actions)
  const errorShown =
    visibleError && visibleError.message !== dismissedErrorMsg

  const handleConfirmCancel = (reason: string) => {
    actions.cancel(appointment.id, reason)
    setEmailNote('Cancellation email will be sent to patient.')
  }
  const handleRescheduleSubmit: typeof actions.reschedule = (id, dto) => {
    actions.reschedule(id, dto)
    setEmailNote('Reschedule email will be sent to patient.')
  }

  /* ── Layout ─────────────────────────────────────────────────────── */

  const panelClasses = mobile
    ? 'fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden'
    : 'fixed right-0 top-0 z-50 h-screen w-[380px] bg-white border-l border-gray-100 shadow-xl flex flex-col overflow-hidden'

  const baseBtn =
    'min-h-[44px] text-sm font-semibold rounded-lg px-4 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-40"
      />
      <aside className={panelClasses} aria-modal="true" role="dialog">

        {/* Mobile drag handle */}
        {mobile && (
          <div className="pt-2 pb-1 flex justify-center">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>
        )}

        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <span className={cn('inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-2', badge.classes)}>
              {badge.label}
            </span>
            <h2 className="text-2xl font-bold text-brand-dark leading-tight truncate">
              {appointment.patientName}
            </h2>
            <p className="text-sm text-gray-400 mt-1 font-mono">
              {displayId(appointment.id)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="min-h-[44px] min-w-[44px] -m-2 flex items-center justify-center text-gray-400 hover:text-brand-dark rounded-full hover:bg-gray-50"
          >
            <XIcon />
          </button>
        </div>

        {/* Body — scrolls independently */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Email side-effect note */}
          {emailNote && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 text-xs">
              {emailNote}
            </div>
          )}

          {/* Error banner — checkIn 409 suppressed */}
          {errorShown && visibleError && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm flex items-start justify-between gap-2">
              <span>{visibleError.message}</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setDismissedErrorMsg(visibleError.message)}
                className="text-red-700 shrink-0"
              >
                <XIcon />
              </button>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <InfoCell label="Date"          value={formatDisplayDate(appointment.date)} />
            <InfoCell label="Time"          value={formatDisplayTime(appointment.slot)} />
            <InfoCell label="Doctor"        value={doctor?.name ?? '—'} />
            <InfoCell label="Consultation"  value={appointment.consultationTypeName ?? '—'} />
            <InfoCell label="Phone"         value={appointment.patientPhone} />
            <InfoCell label="Email"         value={appointment.patientEmail || '—'} />
            <InfoCell label="Patient Type"  value={appointment.patientType} />
            <InfoCell label="Referral"      value={referralLabel(appointment.referralSource)} />
            <InfoCell label="Follow-up"     value={appointment.isFollowUp ? 'Yes' : 'No'} />
            {appointment.queuePosition > 1 && (
              <InfoCell label="Queue" value={`#${appointment.queuePosition}`} />
            )}
          </div>

          {/* Check-in time (IST) */}
          {appointment.checkedInAt && (
            <p className="text-xs text-teal-700">
              Checked in at {formatTimestamp(appointment.checkedInAt)}
            </p>
          )}

          {/* Notes (read-only) */}
          {appointment.notes && (
            <section>
              <h4 className="text-xs font-semibold tracking-widest text-brand-gold uppercase mb-2">
                Patient Notes
              </h4>
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 italic border border-gray-100">
                {appointment.notes}
              </div>
            </section>
          )}

          {/* Cancelled reason + timestamp (IST) */}
          {appointment.status === 'Cancelled' && (
            <section className="space-y-2">
              {appointment.cancellationReason && (
                <>
                  <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                    Cancellation Reason
                  </h4>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 border border-gray-100">
                    {appointment.cancellationReason}
                  </div>
                </>
              )}
              {appointment.cancelledAt && (
                <p className="text-xs text-gray-400">
                  Cancelled at {formatTimestamp(appointment.cancelledAt)}
                </p>
              )}
            </section>
          )}

          {/* Booked at (created) */}
          {appointment.createdAt && (
            <p className="text-xs text-gray-400">
              Booked at {formatTimestamp(appointment.createdAt)}
            </p>
          )}
        </div>

        {/* Footer actions */}
        {(buttonIds.length > 0 || isCancelling || showReschedule) && (
          <div className="p-5 border-t border-gray-100 bg-warm-50 shrink-0 max-h-[55vh] overflow-y-auto">
            {isCancelling ? (
              <CancelWithReasonForm
                onSubmit={handleConfirmCancel}
                onKeep={onAbortCancel}
                isPending={actions.cancelState.isPending}
                error={actions.cancelState.error?.message ?? null}
              />
            ) : showReschedule ? (
              <RescheduleForm
                onSubmit={(dto) => handleRescheduleSubmit(appointment.id, dto)}
                onCancel={() => setShowReschedule(false)}
                isPending={actions.rescheduleState.isPending}
                error={actions.rescheduleState.error?.message ?? null}
                successMessage={null}
              />
            ) : (
              <>
                {/* Primary — full width */}
                {primary && (
                  <button
                    type="button"
                    disabled={isPendingByAction[primary]}
                    className={cn(baseBtn, 'w-full', BUTTON_PALETTE[primary].classes)}
                    onClick={handlersByAction[primary]}
                  >
                    {isPendingByAction[primary] ? 'Working…' : BUTTON_PALETTE[primary].label}
                  </button>
                )}
                {rest.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {rest.map((id) => (
                      <button
                        key={id}
                        type="button"
                        disabled={isPendingByAction[id]}
                        className={cn(baseBtn, 'flex-1', BUTTON_PALETTE[id].classes)}
                        onClick={handlersByAction[id]}
                      >
                        {BUTTON_PALETTE[id].label}
                      </button>
                    ))}
                  </div>
                )}
                {/* Reschedule — intentionally subtle */}
                {appointment.status !== 'Completed' &&
                  appointment.status !== 'Cancelled' &&
                  appointment.status !== 'NoShow' && (
                    <button
                      type="button"
                      onClick={() => setShowReschedule(true)}
                      className="w-full mt-3 text-xs text-gray-400 hover:text-brand-dark underline transition-colors"
                    >
                      Reschedule
                    </button>
                  )}
              </>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
