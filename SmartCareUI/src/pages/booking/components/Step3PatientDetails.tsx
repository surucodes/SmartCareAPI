import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { cn } from '@/utils/cn'
import { AppointmentSummaryCard } from './AppointmentSummaryCard'
import type { UseBookingFlow, PatientDetailsPayload } from '@/hooks/useBookingFlow'
import type { ReferralSource } from '@/types/appointment.types'

interface Step3Props {
  flow: UseBookingFlow
}

const REFERRAL_OPTIONS: { value: ReferralSource; label: string }[] = [
  { value: 'Self',              label: 'Myself / Internet'      },
  { value: 'DoctorReferral',    label: 'Referred by a Doctor'   },
  { value: 'HospitalReferral',  label: 'Referred by Hospital'   },
  { value: 'Other',             label: 'Other'                  },
]

const PHONE_REGEX = /^\d{10}$/

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be 100 characters or fewer'),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => PHONE_REGEX.test(v), 'Phone must be exactly 10 digits'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  patientType: z.enum(['New', 'Returning']),
  referralSource: z.enum(['Self', 'DoctorReferral', 'HospitalReferral', 'Other'], {
    message: 'Please select an option',
  }),
  isFollowUp: z.boolean(),
  notes: z
    .string()
    .trim()
    .max(200, 'Notes must be 200 characters or fewer')
    .optional(),
})

type FormValues = z.infer<typeof schema>

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface ErrorState {
  type: 'conflict' | 'validation' | 'network' | 'unknown'
  message: string
}

function parseAxiosError(err: unknown): ErrorState {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return { type: 'network', message: 'Connection failed. Please check your internet and try again.' }
    }
    const status = err.response.status
    const data = err.response.data as { error?: string } | undefined
    if (status === 409) {
      return {
        type: 'conflict',
        message: 'This slot is no longer available. Please go back and choose a different time.',
      }
    }
    if (status === 400) {
      return { type: 'validation', message: data?.error || 'Some of the information you entered is invalid.' }
    }
    if (status === 404) {
      return { type: 'validation', message: data?.error || 'We could not find that resource. Please go back and try again.' }
    }
    return { type: 'unknown', message: data?.error || 'Something went wrong. Please try again.' }
  }
  if (err instanceof Error) return { type: 'unknown', message: err.message }
  return { type: 'unknown', message: 'Something went wrong. Please try again.' }
}

export function Step3PatientDetails({ flow }: Step3Props) {
  const [serverError, setServerError] = useState<ErrorState | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      patientType: 'New',
      referralSource: '' as unknown as ReferralSource,
      isFollowUp: false,
      notes: '',
    },
  })

  const patientType = watch('patientType')
  const isFollowUp = watch('isFollowUp')
  const notes = watch('notes') ?? ''

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    setSubmitting(true)
    try {
      const payload: PatientDetailsPayload = {
        fullName: values.fullName,
        phone: values.phone,                  // already 10 digits via zod transform
        email: values.email,
        patientType: values.patientType,
        referralSource: values.referralSource,
        isFollowUp: values.isFollowUp,
        notes: values.notes && values.notes.length ? values.notes : undefined,
      }
      await flow.submitBooking(payload)
    } catch (err) {
      setServerError(parseAxiosError(err))
    } finally {
      setSubmitting(false)
    }
  })

  if (!flow.selectedDoctor || !flow.selectedConsultationTypeName || !flow.selectedDate || !flow.selectedSlot) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-700 mb-4">Your booking selections are incomplete.</p>
        <button
          type="button"
          onClick={() => flow.goToStep(1)}
          className="min-h-[44px] px-5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
        >
          Start over
        </button>
      </div>
    )
  }

  const inputBase =
    'w-full min-h-[48px] px-4 rounded-lg border bg-white text-[16px] text-[#111] placeholder:text-gray-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-colors shadow-sm'

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] md:text-[28px] font-bold text-[#111]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          Your Details
        </h1>
        <p className="text-[14px] text-gray-600 mt-1">A few more things and you're booked.</p>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6">

        {/* Mobile banner summary */}
        <div className="lg:hidden mb-5">
          <AppointmentSummaryCard
            variant="banner"
            doctorName={flow.selectedDoctor.name}
            specialty={flow.selectedDoctor.specialty}
            consultationTypeName={flow.selectedConsultationTypeName}
            date={flow.selectedDate}
            slot={flow.selectedSlot}
          />
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="lg:col-span-2 flex flex-col gap-5"
        >

          {/* Patient type toggle */}
          <div>
            <p className="text-[13px] font-semibold text-gray-700 mb-2">Patient Type</p>
            <div className="inline-flex w-full md:w-auto p-1 rounded-lg bg-gray-100 border border-gray-200">
              {(['New', 'Returning'] as const).map((opt) => {
                const active = patientType === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setValue('patientType', opt, { shouldValidate: true })}
                    className={cn(
                      'flex-1 md:flex-none min-h-[40px] px-5 rounded-md text-[14px] font-semibold transition-all',
                      active
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'bg-transparent text-gray-500 hover:text-gray-700',
                    )}
                    aria-pressed={active}
                  >
                    {opt} Patient
                  </button>
                )
              })}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="block text-[13px] font-semibold text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              className={cn(inputBase, errors.fullName ? 'border-red-300' : 'border-gray-200')}
              {...register('fullName')}
            />
            {errors.fullName && <p className="text-[12px] text-red-600">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-[13px] font-semibold text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-gray-500 pointer-events-none">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  className={cn(inputBase, 'pl-14', errors.phone ? 'border-red-300' : 'border-gray-200')}
                  {...register('phone')}
                />
              </div>
              {errors.phone && <p className="text-[12px] text-red-600">{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[13px] font-semibold text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={cn(inputBase, errors.email ? 'border-red-300' : 'border-gray-200')}
                {...register('email')}
              />
              {errors.email && <p className="text-[12px] text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          {/* Referral Source */}
          <div className="space-y-1.5">
            <label htmlFor="referral" className="block text-[13px] font-semibold text-gray-700">
              How did you hear about us? <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="referral"
                className={cn(
                  inputBase,
                  'appearance-none pr-12 cursor-pointer',
                  errors.referralSource ? 'border-red-300' : 'border-gray-200',
                )}
                {...register('referralSource')}
                defaultValue=""
              >
                <option value="" disabled>Select an option</option>
                {REFERRAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <ChevronDown />
              </span>
            </div>
            {errors.referralSource && <p className="text-[12px] text-red-600">{errors.referralSource.message}</p>}
          </div>

          <hr className="border-gray-200 my-2" />

          {/* Follow-up toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#111]">Is this a follow-up visit?</p>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Turn this on if you've seen this doctor recently.
              </p>
              {isFollowUp && (
                <p className="text-[12px] text-teal-700 mt-2">
                  If you've visited us before, our team will locate your records.
                </p>
              )}
            </div>

            <label className="inline-flex items-center cursor-pointer shrink-0 p-2 -m-2">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register('isFollowUp')}
              />
              <div className="relative w-12 h-7 bg-gray-300 rounded-full peer peer-checked:bg-teal-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-transform peer-checked:after:translate-x-5 shadow-inner" />
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[13px]">
              <label htmlFor="notes" className="font-semibold text-gray-700">
                Reason for visit / Notes for doctor
              </label>
              <span className={cn('text-gray-500', notes.length > 180 && 'text-amber-700')}>
                {notes.length}/200
              </span>
            </div>
            <textarea
              id="notes"
              rows={3}
              maxLength={200}
              placeholder="Briefly describe your symptoms or reason for visit…"
              className={cn(
                inputBase,
                'h-auto py-3 resize-none',
                errors.notes ? 'border-red-300' : 'border-gray-200',
              )}
              {...register('notes')}
            />
            {errors.notes && <p className="text-[12px] text-red-600">{errors.notes.message}</p>}
          </div>

          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              className={cn(
                'rounded-lg border p-4 flex flex-col gap-3',
                serverError.type === 'conflict'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-800',
              )}
            >
              <p className="text-[14px] leading-snug">{serverError.message}</p>
              {serverError.type === 'conflict' && (
                <button
                  type="button"
                  onClick={() => flow.goBack()}
                  className="self-start min-h-[40px] px-4 rounded-lg bg-amber-700 text-white text-[13px] font-semibold hover:bg-amber-800 transition-colors"
                >
                  Choose Different Time
                </button>
              )}
            </div>
          )}

          {/* Action area */}
          <div className="pt-2 pb-6 flex flex-col gap-3">
            <button
              type="submit"
              disabled={!isValid || submitting}
              className={cn(
                'w-full min-h-[52px] rounded-lg text-[15px] font-semibold flex items-center justify-center gap-2 transition-all shadow-md',
                !isValid || submitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg',
              )}
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                  Confirming…
                </>
              ) : (
                <>
                  Confirm Booking
                  <ArrowRight />
                </>
              )}
            </button>
            <p className="text-center text-[12px] text-gray-500">
              By confirming, you agree to our{' '}
              <a href="#" className="text-teal-700 underline underline-offset-2">Terms</a>
              {' '}&amp;{' '}
              <a href="#" className="text-teal-700 underline underline-offset-2">Privacy Policy</a>.
            </p>
          </div>
        </form>

        {/* Desktop summary (sticky) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <AppointmentSummaryCard
              variant="full"
              doctorName={flow.selectedDoctor.name}
              specialty={flow.selectedDoctor.specialty}
              consultationTypeName={flow.selectedConsultationTypeName}
              date={flow.selectedDate}
              slot={flow.selectedSlot}
            />
          </div>
        </aside>
      </div>
    </section>
  )
}
