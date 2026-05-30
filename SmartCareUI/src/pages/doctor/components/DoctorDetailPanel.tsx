import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import {
  formatDisplayDate,
  formatDisplayTime,
  formatTimestamp,
} from '@/utils/date.utils'
import type { Appointment, ReferralSource } from '@/types/appointment.types'
import type { DoctorAppointmentActions } from '@/hooks/useDoctorAppointmentActions'
import {
  DOCTOR_BUTTON_PALETTE,
  getDoctorActions,
  type DoctorActionId,
} from './doctor-actions'
import { DoctorCancelForm } from './DoctorCancelForm'
import { DoctorRescheduleForm } from './DoctorRescheduleForm'

interface DoctorDetailPanelProps {
  appointment: Appointment
  actions: DoctorAppointmentActions
  onClose: () => void
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function displayId(id: string): string {
  return 'SH-' + id.slice(-8).toUpperCase()
}

function referralLabel(src: ReferralSource): string {
  switch (src) {
    case 'Self':             return 'Self / Internet'
    case 'DoctorReferral':   return 'Doctor Referral'
    case 'HospitalReferral': return 'Hospital Referral'
    case 'Other':            return 'Other'
  }
}

interface PillMeta {
  dotBg: string
  bg: string
  text: string
  label: string
}
function statusPillMeta(a: Appointment): PillMeta {
  switch (a.status) {
    case 'Pending':
      return { dotBg: 'bg-amber-600',   bg: 'bg-amber-100',   text: 'text-amber-800',   label: 'Pending' }
    case 'Confirmed':
      return { dotBg: 'bg-teal-600',    bg: 'bg-teal-100',    text: 'text-teal-800',    label: 'Confirmed' }
    case 'Completed':
      return { dotBg: 'bg-emerald-700', bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Completed' }
    case 'Cancelled':
      return { dotBg: 'bg-red-500',     bg: 'bg-red-100',     text: 'text-red-700',     label: 'Cancelled' }
    case 'NoShow':
      return { dotBg: 'bg-gray-500',    bg: 'bg-gray-100',    text: 'text-gray-600',    label: 'No Show' }
  }
}

/* ── Icons ─────────────────────────────────────────────────────────── */

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-3 h-3" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10.5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

/* ── InfoCell ──────────────────────────────────────────────────────── */

interface InfoCellProps {
  label: string
  value: string
  truncate?: boolean
}
function InfoCell({ label, value, truncate = false }: InfoCellProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
        {label}
      </p>
      <p
        className={cn(
          'text-sm font-medium text-brand-dark mt-0.5',
          truncate && 'truncate overflow-hidden text-ellipsis',
        )}
        title={truncate ? value : undefined}
      >
        {value}
      </p>
    </div>
  )
}

/* ── Component ─────────────────────────────────────────────────────── */

type FormMode = 'cancel' | 'reschedule' | null

export function DoctorDetailPanel({
  appointment,
  actions,
  onClose,
}: DoctorDetailPanelProps) {
  const [mounted, setMounted] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [dismissedErrorMsg, setDismissedErrorMsg] = useState<string | null>(null)

  // Track previous pending state to detect cancel/reschedule success → close panel
  const prevCancelPending     = useRef(false)
  const prevReschedulePending = useRef(false)

  // Slide-in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Reset internal state when switching appointments
  useEffect(() => {
    setFormMode(null)
    setDismissedErrorMsg(null)
  }, [appointment.id])

  // Close panel when cancel finishes successfully
  useEffect(() => {
    const wasPending = prevCancelPending.current
    const nowPending = actions.cancelState.isPending
    if (wasPending && !nowPending && !actions.cancelState.error) {
      onClose()
    }
    prevCancelPending.current = nowPending
  }, [actions.cancelState.isPending, actions.cancelState.error, onClose])

  // Close panel when reschedule finishes successfully
  useEffect(() => {
    const wasPending = prevReschedulePending.current
    const nowPending = actions.rescheduleState.isPending
    if (wasPending && !nowPending && !actions.rescheduleState.error) {
      onClose()
    }
    prevReschedulePending.current = nowPending
  }, [actions.rescheduleState.isPending, actions.rescheduleState.error, onClose])

  const isReadOnly =
    appointment.status === 'Completed' ||
    appointment.status === 'Cancelled' ||
    appointment.status === 'NoShow'

  const isCheckedIn = appointment.checkedInAt !== null
  const { primary, hasReschedule } = getDoctorActions(appointment)
  const pill = statusPillMeta(appointment)

  /* Action handlers --------------------------------------------------- */

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

  const handleCancelSubmit = (reason: string) => {
    actions.cancel(appointment.id, reason)
  }
  const handleRescheduleSubmit = (dto: {
    newDate: string
    newSlot: string
    reason: string
  }) => {
    actions.reschedule(appointment.id, dto)
  }

  /* Combined visible error -------------------------------------------- */

  const anyError =
    actions.confirmState.error ||
    actions.completeState.error ||
    actions.cancelState.error ||
    actions.rescheduleState.error ||
    null
  const errorShown =
    anyError && anyError.message !== dismissedErrorMsg ? anyError : null

  /* Layout ------------------------------------------------------------ */

  return (
    <>
      {/* Overlay */}
      <div
        role="presentation"
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-40"
      />

      {/* Panel — desktop (right side) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Appointment details"
        className={cn(
          'hidden md:flex fixed right-0 top-0 z-50 h-screen w-[420px] bg-white shadow-xl border-l border-gray-100 flex-col overflow-hidden',
          'transition-transform duration-300 ease-in-out',
          mounted ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <PanelContent
          appointment={appointment}
          isCheckedIn={isCheckedIn}
          isReadOnly={isReadOnly}
          pill={pill}
          primary={primary}
          hasReschedule={hasReschedule}
          handlersByAction={handlersByAction}
          isPendingByAction={isPendingByAction}
          formMode={formMode}
          setFormMode={setFormMode}
          handleCancelSubmit={handleCancelSubmit}
          handleRescheduleSubmit={handleRescheduleSubmit}
          actions={actions}
          errorShown={errorShown}
          onDismissError={(msg) => setDismissedErrorMsg(msg)}
          onClose={onClose}
        />
      </aside>

      {/* Panel — mobile (bottom sheet) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Appointment details"
        className={cn(
          'md:hidden fixed inset-x-0 bottom-0 z-50 bg-white shadow-xl rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden',
          'transition-transform duration-300 ease-in-out',
          mounted ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        {/* Drag handle */}
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <PanelContent
          appointment={appointment}
          isCheckedIn={isCheckedIn}
          isReadOnly={isReadOnly}
          pill={pill}
          primary={primary}
          hasReschedule={hasReschedule}
          handlersByAction={handlersByAction}
          isPendingByAction={isPendingByAction}
          formMode={formMode}
          setFormMode={setFormMode}
          handleCancelSubmit={handleCancelSubmit}
          handleRescheduleSubmit={handleRescheduleSubmit}
          actions={actions}
          errorShown={errorShown}
          onDismissError={(msg) => setDismissedErrorMsg(msg)}
          onClose={onClose}
        />
      </aside>
    </>
  )
}

/* ── Shared inner content (desktop + mobile share the same body) ──── */

interface PanelContentProps {
  appointment: Appointment
  isCheckedIn: boolean
  isReadOnly: boolean
  pill: PillMeta
  primary: DoctorActionId[]
  hasReschedule: boolean
  handlersByAction: Record<DoctorActionId, () => void>
  isPendingByAction: Record<DoctorActionId, boolean>
  formMode: FormMode
  setFormMode: (m: FormMode) => void
  handleCancelSubmit: (reason: string) => void
  handleRescheduleSubmit: (dto: { newDate: string; newSlot: string; reason: string }) => void
  actions: DoctorAppointmentActions
  errorShown: { message: string } | null
  onDismissError: (msg: string) => void
  onClose: () => void
}

function PanelContent({
  appointment,
  isCheckedIn,
  isReadOnly,
  pill,
  primary,
  hasReschedule,
  handlersByAction,
  isPendingByAction,
  formMode,
  setFormMode,
  handleCancelSubmit,
  handleRescheduleSubmit,
  actions,
  errorShown,
  onDismissError,
  onClose,
}: PanelContentProps) {
  return (
    <>
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
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
            {isCheckedIn && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-200 text-amber-900">
                <CheckCircleIcon />
                Checked In
              </span>
            )}
          </div>
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
          className="min-h-[44px] min-w-[44px] -m-2 flex items-center justify-center text-gray-400 hover:text-brand-dark rounded-full hover:bg-gray-50 shrink-0"
        >
          <XIcon />
        </button>
      </div>

      {/* Body — scrolls independently */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <InfoCell label="Date"         value={formatDisplayDate(appointment.date)} />
          <InfoCell label="Time"         value={formatDisplayTime(appointment.slot)} />
          <InfoCell label="Consultation" value={appointment.consultationTypeName ?? 'General'} />
          <InfoCell label="Patient Type" value={appointment.patientType} />
          <InfoCell label="Follow-up"    value={appointment.isFollowUp ? 'Yes' : 'No'} />
          <InfoCell label="Phone"        value={appointment.patientPhone || '—'} />
          <InfoCell
            label="Email"
            value={appointment.patientEmail || '—'}
            truncate
          />
          <InfoCell label="Referral" value={referralLabel(appointment.referralSource)} />
          {appointment.queuePosition > 1 && (
            <div className="col-span-2">
              <InfoCell
                label="Queue"
                value={`Position #${appointment.queuePosition} in queue`}
              />
            </div>
          )}
        </div>

        {/* Notes */}
        {appointment.notes && appointment.notes.trim() !== '' && (
          <section>
            <h4 className="text-xs font-semibold tracking-widest text-brand-gold uppercase mb-2">
              Patient Notes
            </h4>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 italic border border-gray-100 whitespace-pre-line">
              {appointment.notes}
            </div>
          </section>
        )}

        {/* Check-in timestamp */}
        {appointment.checkedInAt && (
          <p className="text-sm text-teal-600 mt-2">
            Checked in at {formatTimestamp(appointment.checkedInAt)}
          </p>
        )}

        {/* Cancellation reason (if applicable) */}
        {appointment.status === 'Cancelled' && appointment.cancellationReason && (
          <section>
            <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
              Cancellation Reason
            </h4>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-100">
              {appointment.cancellationReason}
            </div>
            {appointment.cancelledAt && (
              <p className="text-xs text-gray-400 mt-1">
                Cancelled at {formatTimestamp(appointment.cancelledAt)}
              </p>
            )}
          </section>
        )}

        {/* Booked at */}
        {appointment.createdAt && (
          <p className="text-xs text-gray-400">
            Booked at {formatTimestamp(appointment.createdAt)}
          </p>
        )}
      </div>

      {/* Action section */}
      {!isReadOnly && (primary.length > 0 || hasReschedule) && (
        <div className="p-5 border-t border-gray-100 bg-warm-50 shrink-0 max-h-[55vh] overflow-y-auto">

          {/* Combined error banner */}
          {errorShown && (
            <div
              role="alert"
              className="mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm flex items-start justify-between gap-2"
            >
              <span>{errorShown.message}</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => onDismissError(errorShown.message)}
                className="text-red-700 shrink-0"
              >
                <XIcon />
              </button>
            </div>
          )}

          {formMode === 'cancel' ? (
            <DoctorCancelForm
              onSubmit={handleCancelSubmit}
              onKeep={() => setFormMode(null)}
              isPending={actions.cancelState.isPending}
              error={actions.cancelState.error?.message ?? null}
            />
          ) : formMode === 'reschedule' ? (
            <DoctorRescheduleForm
              onSubmit={handleRescheduleSubmit}
              onCancel={() => setFormMode(null)}
              isPending={actions.rescheduleState.isPending}
              error={actions.rescheduleState.error?.message ?? null}
              successMessage={null}
            />
          ) : (
            <div className="space-y-2">
              {primary.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={handlersByAction[id]}
                  disabled={isPendingByAction[id]}
                  className={cn(
                    'w-full min-h-[44px] px-4 text-sm font-semibold rounded-lg transition-colors',
                    DOCTOR_BUTTON_PALETTE[id].classes,
                    isPendingByAction[id] && 'opacity-70 cursor-not-allowed',
                  )}
                >
                  {isPendingByAction[id] ? 'Working…' : DOCTOR_BUTTON_PALETTE[id].label}
                </button>
              ))}
              {hasReschedule && (
                <button
                  type="button"
                  onClick={() => setFormMode('reschedule')}
                  className="w-full mt-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] text-sm text-gray-500 hover:text-brand-dark underline transition-colors"
                >
                  <EventRepeatIcon />
                  Reschedule
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
