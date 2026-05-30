import { useMemo, useState } from 'react'
import { addDays, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns'
import { cn } from '@/utils/cn'
import { getTodayIST } from '@/utils/date.utils'

export interface DoctorCalendarProps {
  selectedDate: string
  daysWithAppointments: Set<string>
  onSelect: (date: string) => void
  onClose: () => void
  /** When true: renders as full-width rounded-t-2xl (mobile bottom sheet container). */
  mobile?: boolean
}

const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function ChevronLeft() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DoctorCalendar({
  selectedDate,
  daysWithAppointments,
  onSelect,
  onClose,
  mobile = false,
}: DoctorCalendarProps) {
  const todayStr = getTodayIST()
  const [viewDate, setViewDate] = useState(() => startOfMonth(parseISO(selectedDate)))

  const gridDates = useMemo(() => {
    const first = startOfMonth(viewDate)
    const start = startOfWeek(first, { weekStartsOn: 1 })
    return Array.from({ length: 42 }, (_, i) => addDays(start, i))
  }, [viewDate])

  return (
    <div
      className={cn(
        'bg-white border border-gray-100 shadow-lg p-5',
        mobile
          ? 'rounded-t-2xl w-full max-h-[80vh] overflow-y-auto shadow-[0_-4px_12px_rgba(0,0,0,0.1)]'
          : 'rounded-xl w-[316px]',
      )}
    >
      {/* Header — Month/Year + navigation arrows */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <button
          type="button"
          onClick={() => setViewDate((d) => startOfMonth(addDays(d, -1)))}
          aria-label="Previous month"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          <ChevronLeft />
        </button>
        <span className="text-lg font-semibold text-brand-dark select-none">
          {format(viewDate, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setViewDate((d) => startOfMonth(addDays(d, 32)))}
          aria-label="Next month"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d) => (
          <div key={d} className="text-xs uppercase tracking-wider font-medium text-gray-500 text-center py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Date grid — 6 weeks × 7 days, Monday-first */}
      <div className="grid grid-cols-7 gap-1">
        {gridDates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const inMonth = isSameMonth(date, viewDate)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const hasDot = inMonth && daysWithAppointments.has(dateStr)

          return (
            <button
              key={dateStr}
              type="button"
              disabled={!inMonth}
              onClick={() => { if (inMonth) { onSelect(dateStr); onClose() } }}
              aria-label={format(date, 'EEEE, MMMM d, yyyy')}
              aria-pressed={isSelected}
              className={cn(
                'min-h-[40px] flex flex-col items-center justify-center text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600',
                !inMonth && 'text-gray-300 cursor-not-allowed',
                inMonth && !isToday && !isSelected && 'text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg',
                isToday && 'bg-teal-600 text-white font-bold rounded-full',
                isSelected && !isToday && 'bg-teal-100 text-teal-700 border border-teal-300 rounded-lg',
              )}
            >
              <span>{format(date, 'd')}</span>
              {hasDot && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'w-1.5 h-1.5 rounded-full mt-0.5',
                    isToday ? 'bg-amber-400' : 'bg-teal-600',
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 gap-2">
        <button
          type="button"
          onClick={onClose}
          className="text-teal-600 font-medium text-sm hover:underline hover:text-teal-800 transition-colors min-h-[44px] flex items-center"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => { onSelect(todayStr); onClose() }}
          className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-800 active:bg-teal-900 transition-colors min-h-[44px] flex items-center justify-center"
        >
          Today
        </button>
      </div>
    </div>
  )
}
