import { useState } from 'react'
import { cn } from '@/utils/cn'

interface DoctorCancelFormProps {
  onSubmit: (reason: string) => void
  onKeep: () => void
  isPending: boolean
  error: string | null
}

const MAX = 200
const MIN = 5

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path d="M10 2L1 18h18L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8v4M10 15v0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function DoctorCancelForm({
  onSubmit,
  onKeep,
  isPending,
  error,
}: DoctorCancelFormProps) {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()
  const tooShort = trimmed.length < MIN
  const disabled = tooShort || isPending

  return (
    <div className="space-y-3">
      {/* Warning box */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 text-xs flex items-start gap-2">
        <WarningIcon />
        <span>Cancelling will notify the patient by email.</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason for cancellation
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, MAX))}
          placeholder="Please provide a reason for cancellation..."
          className="w-full min-h-[80px] rounded-lg border border-gray-200 bg-white text-base text-brand-dark p-3 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-gray-400"
        />
        <div className="flex justify-between mt-1">
          {tooShort && trimmed.length > 0 ? (
            <p className="text-xs text-red-600">At least {MIN} characters required.</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-gray-400 text-right">
            {reason.length}/{MAX}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm"
        >
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onKeep}
          disabled={isPending}
          className="flex-1 min-h-[44px] rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
        >
          Keep Appointment
        </button>
        <button
          type="button"
          onClick={() => onSubmit(trimmed)}
          disabled={disabled}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] rounded-lg text-sm font-semibold',
            disabled
              ? 'bg-red-300 text-white cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white',
          )}
        >
          {isPending && <Spinner />}
          {isPending ? 'Cancelling…' : 'Confirm Cancellation'}
        </button>
      </div>
    </div>
  )
}
