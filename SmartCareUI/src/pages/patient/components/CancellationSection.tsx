import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/utils/cn'
import { hoursUntilAppointmentIst } from '@/utils/date.utils'
import type { Appointment } from '@/types/appointment.types'

const REASON_MIN = 10
const REASON_MAX = 200

const schema = z.object({
  reason: z
    .string()
    .trim()
    .min(REASON_MIN, `Please tell us a bit more (at least ${REASON_MIN} characters)`)
    .max(REASON_MAX, `Reason must be ${REASON_MAX} characters or fewer`),
})

type FormValues = z.infer<typeof schema>

interface CancellationSectionProps {
  appointment: Appointment
  onCancel: (reason: string) => Promise<void>
  isCancelling: boolean
  cancelError: string | null
  cancelSuccess: boolean
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M12 8.5v0M12 11v6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M7.5 12.5l3 3 6-7"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
      aria-hidden="true"
    />
  )
}

export function CancellationSection({
  appointment,
  onCancel,
  isCancelling,
  cancelError,
  cancelSuccess,
}: CancellationSectionProps) {
  const [expanded, setExpanded] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { reason: '' },
  })

  const reasonValue = watch('reason') ?? ''
  const charCount = reasonValue.length

  // Success state — replaces the entire section.
  if (cancelSuccess) {
    return (
      <div
        role="status"
        className="rounded-xl border border-teal-200 bg-teal-50 p-5 flex gap-3 items-start"
      >
        <span className="text-teal-700 shrink-0 mt-0.5">
          <CheckIcon />
        </span>
        <div>
          <p className="text-[15px] font-semibold text-teal-900 mb-1">
            Your appointment has been cancelled.
          </p>
          <p className="text-[13.5px] text-teal-800 leading-relaxed">
            A confirmation email has been sent to you.
          </p>
        </div>
      </div>
    )
  }

  // Hard blockers — show gray/amber message, no cancel button.
  if (
    appointment.status === 'Completed' ||
    appointment.status === 'Cancelled' ||
    appointment.status === 'NoShow'
  ) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex gap-3 items-start">
        <span className="text-gray-500 shrink-0 mt-0.5">
          <InfoIcon />
        </span>
        <p className="text-[13.5px] text-gray-700 leading-relaxed">
          This appointment cannot be modified.
        </p>
      </div>
    )
  }

  if (appointment.checkedInAt) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex gap-3 items-start">
        <span className="text-gray-500 shrink-0 mt-0.5">
          <InfoIcon />
        </span>
        <p className="text-[13.5px] text-gray-700 leading-relaxed">
          You have already checked in for this appointment. Please speak to our staff for any changes.
        </p>
      </div>
    )
  }

  const hoursAway = hoursUntilAppointmentIst(appointment.date, appointment.slot)
  const within24Hours = hoursAway <= 24

  if (within24Hours) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 items-start">
        <span className="text-amber-600 shrink-0 mt-0.5">
          <InfoIcon />
        </span>
        <p className="text-[13.5px] text-amber-900 leading-relaxed">
          Cancellations are no longer possible within 24 hours of your appointment.
          Please call us at{' '}
          <a
            href="tel:08012345678"
            className="font-semibold underline underline-offset-2 hover:text-amber-700"
          >
            080 1234 5678
          </a>{' '}
          to make changes.
        </p>
      </div>
    )
  }

  // Cancellable. Default state OR expanded form.
  const submit = handleSubmit(async (values) => {
    await onCancel(values.reason.trim())
  })

  const handleKeep = () => {
    setExpanded(false)
    reset({ reason: '' })
  }

  return (
    <div className="space-y-4">
      {/* Amber info box — always visible while cancellable */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 items-start">
        <span className="text-amber-600 shrink-0 mt-0.5">
          <InfoIcon />
        </span>
        <p className="text-[13.5px] text-amber-900 leading-relaxed">
          <span className="font-semibold">Need to cancel?</span> Cancellations are free
          if made more than 24 hours before your appointment.
        </p>
      </div>

      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full min-h-[48px] rounded-lg border-2 border-red-500 bg-white text-red-600 font-semibold text-[14.5px] hover:bg-red-50 hover:border-red-600 transition-colors active:scale-[0.99]"
        >
          Cancel Appointment
        </button>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-3.5">
          <div>
            <label
              htmlFor="cancel-reason"
              className="block text-[14px] font-semibold text-[#111] mb-1.5"
            >
              Reason for cancellation
            </label>
            <div className="relative">
              <textarea
                id="cancel-reason"
                rows={4}
                maxLength={REASON_MAX}
                placeholder="Please let us know why you're cancelling..."
                aria-invalid={!!errors.reason}
                aria-describedby={errors.reason ? 'reason-error' : 'reason-counter'}
                {...register('reason')}
                className={cn(
                  'w-full min-h-[80px] rounded-lg border bg-white px-4 py-3 text-[16px] text-[#111] resize-y',
                  'placeholder:text-gray-400 shadow-sm',
                  'focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20',
                  'transition-colors',
                  errors.reason ? 'border-red-300' : 'border-gray-200',
                )}
              />
              <span
                id="reason-counter"
                className={cn(
                  'absolute bottom-2 right-3 text-[11.5px] font-medium tabular-nums',
                  charCount >= REASON_MAX
                    ? 'text-red-600'
                    : charCount >= REASON_MIN
                      ? 'text-gray-500'
                      : 'text-gray-400',
                )}
              >
                {charCount} / {REASON_MAX}
              </span>
            </div>
            {errors.reason && (
              <p id="reason-error" className="mt-1 text-[12.5px] text-red-600">
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Inline cancel error */}
          {cancelError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700 leading-snug"
            >
              {cancelError}
            </div>
          )}

          {/* Action buttons — stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col md:flex-row gap-3 md:justify-end">
            <button
              type="button"
              onClick={handleKeep}
              disabled={isCancelling}
              className={cn(
                'w-full md:w-auto md:min-w-[140px] min-h-[44px] px-5 rounded-lg',
                'border border-gray-200 bg-white text-gray-700 font-semibold text-[14px]',
                'hover:bg-gray-50 hover:border-gray-300 transition-colors',
                'disabled:opacity-60 disabled:cursor-not-allowed',
              )}
            >
              Keep Appointment
            </button>
            <button
              type="submit"
              disabled={!isValid || isCancelling}
              className={cn(
                'w-full md:w-auto md:min-w-[180px] min-h-[44px] px-5 rounded-lg',
                'text-white font-semibold text-[14px] shadow-sm transition-all active:scale-[0.99]',
                'inline-flex items-center justify-center gap-2',
                !isValid || isCancelling
                  ? 'bg-red-300 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700',
              )}
            >
              {isCancelling ? (
                <>
                  <Spinner />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
