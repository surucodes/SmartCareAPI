import { formatDisplayDate, formatDisplayTime, getDayName } from '@/utils/date.utils'
import { cn } from '@/utils/cn'

interface AppointmentSummaryCardProps {
  doctorName: string
  specialty: string
  consultationTypeName: string
  date: string                  // yyyy-MM-dd
  slot: string                  // HH:MM
  variant?: 'full' | 'banner'
  className?: string
}

function StethoscopeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3v6a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 13v3a5 5 0 0 0 5 5h0a5 5 0 0 0 5-5v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="11" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function AppointmentSummaryCard({
  doctorName,
  specialty,
  consultationTypeName,
  date,
  slot,
  variant = 'full',
  className,
}: AppointmentSummaryCardProps) {
  const dayName = getDayName(date)
  const formattedDate = formatDisplayDate(date)
  const formattedTime = formatDisplayTime(slot)

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'bg-white border border-teal-100 rounded-xl p-4 shadow-sm flex items-center gap-3',
          'border-l-4 border-l-teal-600',
          className,
        )}
      >
        <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
          <CalendarIcon />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C9A227]">
            Appointment Summary
          </p>
          <p className="text-[14px] font-semibold text-[#111] truncate">
            {doctorName} · {formattedDate}, {formattedTime}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-[0_4px_20px_rgba(19,43,26,0.05)] overflow-hidden',
        'border-l-4 border-l-teal-600',
        className,
      )}
      aria-label="Appointment summary"
    >
      <div className="px-5 pt-5 pb-3 flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6" stroke="#C9A227" strokeWidth="1.4" />
          <path d="M7 4v3.5M7 10v.1" stroke="#C9A227" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C9A227]">
          Appointment Summary
        </h3>
      </div>

      <div className="px-5 pb-5 flex flex-col gap-4">

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <StethoscopeIcon />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Doctor</p>
            <p className="text-[15px] font-semibold text-[#111]">{doctorName}</p>
            <p className="text-[13px] text-gray-600">{specialty}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <TagIcon />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Visit Type</p>
            <p className="text-[15px] font-semibold text-[#111]">{consultationTypeName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <CalendarIcon />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Date &amp; Time</p>
            <p className="text-[15px] font-semibold text-[#111]">{dayName}, {formattedDate}</p>
            <p className="text-[13px] text-gray-600">{formattedTime}</p>
          </div>
        </div>

      </div>

      <div className="bg-teal-50/60 border-t border-teal-100 px-5 py-3 flex items-start gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="text-teal-700 shrink-0 mt-0.5">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 4v3.5M7 10v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <p className="text-[12px] text-teal-800 leading-snug">
          You're booking a preferred time window. Our team will confirm within 2 hours.
        </p>
      </div>
    </div>
  )
}
