import { useState } from 'react'
import { addDays, format } from 'date-fns'
import { cn } from '@/utils/cn'
import { getTodayIST } from '@/utils/date.utils'
import type { RescheduleDto } from '@/types/appointment.types'

interface DoctorRescheduleFormProps {
  onSubmit: (dto: RescheduleDto) => void
  onCancel: () => void
  isPending: boolean
  error: string | null
  successMessage: string | null
}

const TIME_PATTERN = /^\d{2}:\d{2}$/
const MIN_REASON = 5
const MAX_REASON = 200

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5v.5M10 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function tomorrowIst(): string {
  const today = getTodayIST()
  const [y, m, d] = today.split('-').map(Number)
  return format(addDays(new Date(y, m - 1, d), 1), 'yyyy-MM-dd')
}

export function DoctorRescheduleForm({
  onSubmit,
  onCancel,
  isPending,
  error,
  successMessage,
}: DoctorRescheduleFormProps) {
  const minDate = tomorrowIst()
  const [newDate, setNewDate] = useState('')
  const [newSlot, setNewSlot] = useState('')
  const [reason, setReason] = useState('')

  const dateValid = newDate >= minDate
  const slotValid = TIME_PATTERN.test(newSlot)
  const reasonValid = reason.trim().length >= MIN_REASON
  const canSubmit = dateValid && slotValid && reasonValid && !isPending

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-brand-dark">Reschedule Details</h4>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">New Date</label>
        <input
          type="date"
          value={newDate}
          min={minDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 text-base text-brand-dark focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">New Time (HH:MM)</label>
        <input
          type="text"
          inputMode="numeric"
          value={newSlot}
          onChange={(e) => setNewSlot(e.target.value)}
          placeholder="e.g. 14:30"
          className="w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 text-base text-brand-dark focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-gray-400"
        />
        {newSlot && !slotValid && (
          <p className="text-xs text-red-600 mt-1">Use 24-hour format like 14:30.</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
          placeholder="Reason for rescheduling..."
          className="w-full min-h-[60px] rounded-lg border border-gray-200 bg-white p-3 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400 text-right mt-1">
          {reason.length}/{MAX_REASON}
        </p>
      </div>

      {/* Info box */}
      <div className="bg-gray-50 border border-gray-100 text-gray-600 rounded-lg px-3 py-2 text-xs flex items-start gap-2">
        <InfoIcon />
        <span>
          You can only reschedule to your own available slots. The patient will
          receive an email notification.
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm"
        >
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 rounded-lg px-3 py-2 text-sm">
          {successMessage}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 min-h-[44px] rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() =>
            onSubmit({
              newDate,
              newSlot,
              reason: reason.trim(),
            })
          }
          disabled={!canSubmit}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] rounded-lg text-sm font-semibold',
            canSubmit
              ? 'bg-teal-600 hover:bg-teal-800 text-white'
              : 'bg-teal-200 text-white cursor-not-allowed',
          )}
        >
          {isPending && <Spinner />}
          {isPending ? 'Rescheduling…' : 'Confirm Reschedule'}
        </button>
      </div>
    </div>
  )
}
