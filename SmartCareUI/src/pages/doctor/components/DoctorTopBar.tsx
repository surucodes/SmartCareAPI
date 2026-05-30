import { useEffect, useRef, useState } from 'react'
import { addDays, format } from 'date-fns'
import { getTodayIST } from '@/utils/date.utils'
import { WeekStrip } from './WeekStrip'
import { DoctorCalendar } from './DoctorCalendar'

interface DoctorTopBarProps {
  currentWeekStart: Date
  selectedDate: string
  daysWithAppointments: Set<string>
  onPrevWeek: () => void
  onNextWeek: () => void
  onSelectDate: (date: string) => void
  onResetToToday: () => void
  onGoToThisWeek: () => void
  onSelectDateFromCalendar: (date: string) => void
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DoctorTopBar({
  currentWeekStart,
  selectedDate,
  daysWithAppointments,
  onPrevWeek,
  onNextWeek,
  onSelectDate,
  onResetToToday,
  onGoToThisWeek,
  onSelectDateFromCalendar,
}: DoctorTopBarProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const leftCellRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside the left cell (includes the calendar dropdown)
  useEffect(() => {
    if (!showCalendar) return
    const onMouseDown = (e: MouseEvent) => {
      if (!leftCellRef.current?.contains(e.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [showCalendar])

  const weekEnd = addDays(currentWeekStart, 6)
  const startMonth = format(currentWeekStart, 'MMM yyyy')
  const endMonth = format(weekEnd, 'MMM yyyy')
  const monthLabel = startMonth === endMonth
    ? startMonth
    : `${format(currentWeekStart, 'MMM')}–${format(weekEnd, 'MMM yyyy')}`

  const todayStr = getTodayIST()
  const isToday = selectedDate === todayStr

  const mondayOfThisWeek = (() => {
    const t = new Date(todayStr)
    const day = t.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const m = new Date(t)
    m.setDate(t.getDate() + diff)
    return m
  })()
  const isThisWeek = (
    currentWeekStart.getFullYear() === mondayOfThisWeek.getFullYear() &&
    currentWeekStart.getMonth() === mondayOfThisWeek.getMonth() &&
    currentWeekStart.getDate() === mondayOfThisWeek.getDate()
  )

  return (
    <div className="hidden md:flex items-center px-4 py-3 border-b bg-white shrink-0 gap-2">

      {/* Left cell — fixed 180px: prev / month label (calendar trigger) / next */}
      <div ref={leftCellRef} className="relative flex items-center gap-1 w-[180px] shrink-0">
        <button
          type="button"
          onClick={onPrevWeek}
          aria-label="Previous week"
          className="min-w-[36px] min-h-[44px] rounded hover:bg-teal-50 flex items-center justify-center text-gray-500 hover:text-brand-dark transition-colors"
        >
          <ChevronLeftIcon />
        </button>

        {/* Month label — click to open branded calendar dropdown */}
        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          aria-expanded={showCalendar}
          aria-label={`${monthLabel} — click to open date picker`}
          title="Click to pick a date"
          className="w-28 text-center font-semibold text-brand-dark text-sm truncate hover:text-teal-700 transition-colors min-h-[44px] flex items-center justify-center rounded hover:bg-teal-50"
        >
          {monthLabel}
        </button>

        <button
          type="button"
          onClick={onNextWeek}
          aria-label="Next week"
          className="min-w-[36px] min-h-[44px] rounded hover:bg-teal-50 flex items-center justify-center text-gray-500 hover:text-brand-dark transition-colors"
        >
          <ChevronRightIcon />
        </button>

        {/* Calendar dropdown — absolute below the left cell */}
        {showCalendar && (
          <div className="absolute top-full left-0 z-50 mt-1">
            <DoctorCalendar
              selectedDate={selectedDate}
              daysWithAppointments={daysWithAppointments}
              onSelect={(d) => {
                onSelectDateFromCalendar(d)
                setShowCalendar(false)
              }}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        )}
      </div>

      {/* Center cell — WeekStrip fills remaining space */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        <WeekStrip
          currentWeekStart={currentWeekStart}
          selectedDate={selectedDate}
          daysWithAppointments={daysWithAppointments}
          onSelectDate={onSelectDate}
        />
      </div>

      {/* Right cell — Today + This Week pills */}
      <div className="w-[200px] shrink-0 flex items-center gap-2 justify-end">
        {!isToday && (
          <button
            type="button"
            onClick={onResetToToday}
            className="px-3 py-1 rounded-full border border-teal-600 text-teal-700 text-sm font-semibold hover:bg-teal-50 transition-colors min-h-[44px] flex items-center"
          >
            Today
          </button>
        )}
        {!isThisWeek && (
          <button
            type="button"
            onClick={onGoToThisWeek}
            className="px-3 py-1 rounded-full border border-teal-600 text-teal-700 text-sm font-semibold hover:bg-teal-50 transition-colors min-h-[44px] flex items-center"
          >
            This Week
          </button>
        )}
      </div>
    </div>
  )
}
