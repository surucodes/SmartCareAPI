import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/utils/cn'

const PHONE_REGEX = /^\d{10}$/

const schema = z.object({
  appointmentId: z
    .string()
    .trim()
    .min(1, 'Appointment ID is required'),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, ''))
    .refine((v) => PHONE_REGEX.test(v), 'Phone must be exactly 10 digits'),
})

type FormValues = z.infer<typeof schema>

interface AppointmentLookupFormProps {
  onSubmit: (id: string, phone: string) => void
  isLoading: boolean
  serverError: string | null
  initialId?: string
  initialPhone?: string
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.7"
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

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v6M12 16.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function AppointmentLookupForm({
  onSubmit,
  isLoading,
  serverError,
  initialId,
  initialPhone,
}: AppointmentLookupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      appointmentId: initialId ?? '',
      phone: initialPhone ?? '',
    },
  })

  const submit = handleSubmit((values) => {
    onSubmit(values.appointmentId.trim(), values.phone)
  })

  return (
    <section className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(19,43,26,0.08)] p-6 md:p-8">
        {/* Decorative leaf */}
        <div className="absolute -top-8 -right-8 opacity-[0.06] pointer-events-none" aria-hidden="true">
          <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor" className="text-teal-800">
            <path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20C19,20,22,3,22,3,21,5,14,5.25,9,6.25C13.5,6.5,17,8,17,8Z" />
          </svg>
        </div>

        <div className="relative flex flex-col items-center text-center mb-7">
          <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center text-teal-800 mb-4 shadow-inner">
            <SearchIcon />
          </div>
          <h1
            className="text-[24px] md:text-[28px] font-bold text-[#111] mb-1.5 leading-tight"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Find Your Appointment
          </h1>
          <p className="text-[14px] text-gray-600">
            Enter your appointment ID and phone number
          </p>
        </div>

        <form onSubmit={submit} className="relative space-y-5" noValidate>
          {/* Appointment ID */}
          <div>
            <label
              htmlFor="appointmentId"
              className="block text-[14px] font-semibold text-[#111] mb-1.5"
            >
              Appointment ID
            </label>
            <input
              id="appointmentId"
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Enter your appointment ID"
              aria-invalid={!!errors.appointmentId}
              aria-describedby={
                errors.appointmentId ? 'appointmentId-error' : 'appointmentId-help'
              }
              {...register('appointmentId')}
              className={cn(
                'w-full min-h-[52px] rounded-lg border bg-warm-50 px-4 py-3 text-[16px] text-[#111]',
                'placeholder:text-gray-400 shadow-sm',
                'focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20',
                'transition-colors',
                errors.appointmentId
                  ? 'border-red-300 bg-red-50/40'
                  : 'border-gray-200',
              )}
            />
            {errors.appointmentId ? (
              <p
                id="appointmentId-error"
                className="mt-1 text-[12.5px] text-red-600 flex items-center gap-1"
              >
                <AlertIcon />
                {errors.appointmentId.message}
              </p>
            ) : (
              <p
                id="appointmentId-help"
                className="mt-1 text-[12px] text-gray-500"
              >
                Found in your booking confirmation email
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-[14px] font-semibold text-[#111] mb-1.5"
            >
              Phone Number
            </label>
            <div className="relative">
              <span
                className="absolute inset-y-0 left-0 flex items-center pl-4 text-[16px] text-gray-500 font-medium pointer-events-none select-none"
                aria-hidden="true"
              >
                +91
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="98765 43210"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                {...register('phone')}
                className={cn(
                  'w-full min-h-[52px] rounded-lg border bg-warm-50 pl-14 pr-4 py-3 text-[16px] text-[#111]',
                  'placeholder:text-gray-400 shadow-sm',
                  'focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20',
                  'transition-colors',
                  errors.phone
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-gray-200',
                )}
              />
            </div>
            {errors.phone && (
              <p
                id="phone-error"
                className="mt-1 text-[12.5px] text-red-600 flex items-center gap-1"
              >
                <AlertIcon />
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full min-h-[52px] rounded-full text-white text-[15px] font-semibold',
              'flex items-center justify-center gap-2',
              'shadow-md transition-all active:scale-[0.99]',
              isLoading
                ? 'bg-teal-800/80 cursor-wait'
                : 'bg-teal-800 hover:bg-teal-600',
            )}
          >
            {isLoading ? (
              <>
                <Spinner />
                Searching...
              </>
            ) : (
              <>
                Find Appointment
                <ArrowRight />
              </>
            )}
          </button>

          {/* Server error */}
          {serverError && !isLoading && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3.5 flex gap-2.5 items-start"
            >
              <span className="text-red-600 mt-0.5 shrink-0">
                <AlertIcon />
              </span>
              <p className="text-[13px] text-red-700 leading-snug">{serverError}</p>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
