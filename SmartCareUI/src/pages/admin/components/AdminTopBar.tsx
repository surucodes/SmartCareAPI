import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { formatDisplayDate, getDayName, getTodayIST } from '@/utils/date.utils'
import { BrandedCalendar } from '@/components/BrandedCalendar'

interface AdminTopBarProps {
  selectedDate: string
  daysWithAppointments: Set<string>
  onPrevDay: () => void
  onNextDay: () => void
  onResetToToday: () => void
  onSelectDate: (date: string) => void
  onSearchFocus: () => void
  onMarkExpired: () => void
  processedCount: number | null
  onDismissBanner: () => void
  markExpiredPending: boolean
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-gray-400" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 14l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function AdminTopBar({
  selectedDate,
  daysWithAppointments,
  onPrevDay,
  onNextDay,
  onResetToToday,
  onSelectDate,
  onSearchFocus,
  onMarkExpired,
  processedCount,
  onDismissBanner,
  markExpiredPending,
}: AdminTopBarProps) {
  const dateLabel = `${getDayName(selectedDate)}, ${formatDisplayDate(selectedDate)}`
  const isToday = selectedDate === getTodayIST()
  const [showCalendar, setShowCalendar] = useState(false)
  const dateCellRef = useRef<HTMLDivElement>(null)

  // Close on click outside (any element outside the date cell, including arrows)
  useEffect(() => {
    if (!showCalendar) return
    const onMouseDown = (e: MouseEvent) => {
      if (!dateCellRef.current?.contains(e.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [showCalendar])

  return (
    <>
      <div className="hidden md:flex h-14 bg-white border-b border-gray-100 shrink-0 items-center px-6 gap-4">

        {/* Date navigator (left) — arrows sit at fixed positions; the date
            button has a fixed width so they never shift with text length. */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onPrevDay}
            aria-label="Previous day"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-brand-dark hover:bg-gray-50 rounded-full transition-colors"
          >
            <ChevronLeftIcon />
          </button>

          {/* Fixed-width container keeps arrows stable regardless of day-name length */}
          <div ref={dateCellRef} className="relative">
            <button
              type="button"
              onClick={() => setShowCalendar((v) => !v)}
              aria-expanded={showCalendar}
              title="Click to pick a date"
              aria-label={`Current date: ${dateLabel}. Click to open date picker.`}
              className={cn(
                'w-[178px] text-center px-2 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors min-h-[44px]',
                isToday ? 'text-brand-dark' : 'text-teal-700',
              )}
            >
              {dateLabel}
            </button>
            {showCalendar && (
              <div className="absolute top-full left-0 z-50 mt-1">
                <BrandedCalendar
                  selectedDate={selectedDate}
                  daysWithAppointments={daysWithAppointments}
                  onSelect={(d) => {
                    onSelectDate(d)
                    setShowCalendar(false)
                  }}
                  onClose={() => setShowCalendar(false)}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onNextDay}
            aria-label="Next day"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-brand-dark hover:bg-gray-50 rounded-full transition-colors"
          >
            <ChevronRightIcon />
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={onResetToToday}
              className="ml-1 px-2 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-semibold uppercase tracking-wide hover:bg-teal-100 transition-colors"
            >
              Today
            </button>
          )}
        </div>

        {/* Search (center) */}
        <div className="flex-1 max-w-xl mx-auto relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon />
          </span>
          <input
            type="text"
            readOnly
            placeholder="Search by patient name or phone..."
            onFocus={onSearchFocus}
            onClick={onSearchFocus}
            className="w-full pl-10 pr-4 py-2 bg-warm-100 border border-gray-100 rounded-full text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 cursor-pointer placeholder:text-gray-400"
          />
        </div>

        {/* Mark expired (right) */}
        <button
          type="button"
          onClick={onMarkExpired}
          disabled={markExpiredPending}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand-dark disabled:opacity-50 transition-colors shrink-0"
        >
          <ClockIcon />
          {markExpiredPending ? 'Processing…' : 'Mark expired as No-Show'}
        </button>
      </div>

      {/* Banner shown below top bar when processedCount is set */}
      {processedCount !== null && (
        <div className="hidden md:flex bg-amber-50 border-b border-amber-200 px-6 py-2 items-center justify-between shrink-0">
          <p className="text-sm text-amber-800">
            {processedCount > 0
              ? `${processedCount} appointment${processedCount === 1 ? '' : 's'} marked as No-Show.`
              : 'No expired appointments found.'}
          </p>
          <button
            type="button"
            onClick={onDismissBanner}
            aria-label="Dismiss"
            className="text-amber-800 hover:text-amber-900 p-1 rounded min-h-[32px] min-w-[32px] flex items-center justify-center"
          >
            <XIcon />
          </button>
        </div>
      )}
    </>
  )
}
