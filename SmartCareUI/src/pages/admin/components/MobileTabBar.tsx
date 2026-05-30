import { useRef } from 'react'
import { cn } from '@/utils/cn'
import { formatDisplayDate, getDayName, getTodayIST } from '@/utils/date.utils'
import type { Appointment } from '@/types/appointment.types'
import type { Doctor } from '@/types/doctor.types'

interface MobileTabBarProps {
  doctors: Doctor[]
  appointmentsByDoctorId: Record<string, Appointment[]>
  activeTabDoctorId: string
  onTabChange: (doctorId: string) => void
  onHamburgerClick: () => void
  onSearchClick: () => void
  selectedDate: string
  onPrevDay: () => void
  onNextDay: () => void
  onResetToToday: () => void
  onSelectDate: (date: string) => void
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 22 22" fill="none" className="w-6 h-6" aria-hidden="true">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 22 22" fill="none" className="w-6 h-6" aria-hidden="true">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 15l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

function lastName(fullName: string): string {
  const cleaned = fullName.replace(/^Dr\.?\s*/i, '').trim()
  const parts = cleaned.split(/\s+/)
  return parts[0] ?? fullName
}

export function MobileTabBar({
  doctors,
  appointmentsByDoctorId,
  activeTabDoctorId,
  onTabChange,
  onHamburgerClick,
  onSearchClick,
  selectedDate,
  onPrevDay,
  onNextDay,
  onResetToToday,
  onSelectDate,
}: MobileTabBarProps) {
  // Reserved for future inline reset affordance; date label currently opens
  // the native picker instead.
  void onResetToToday

  const isToday = selectedDate === getTodayIST()
  const shortLabel = `${getDayName(selectedDate).slice(0, 3)}, ${formatDisplayDate(selectedDate)}`
  const dateInputRef = useRef<HTMLInputElement>(null)

  const handleDateLabelClick = () => {
    try {
      dateInputRef.current?.showPicker()
    } catch {
      dateInputRef.current?.click()
    }
  }

  return (
    <div className="md:hidden bg-white sticky top-0 z-40 border-b border-gray-100">

      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-2 gap-1">
        <button
          type="button"
          onClick={onHamburgerClick}
          aria-label="Open menu"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-dark rounded-full hover:bg-gray-50"
        >
          <HamburgerIcon />
        </button>

        {/* Date navigator — arrows pinned at fixed width; date area fixed-width */}
        <div className="flex items-center justify-center flex-1">
          <button
            type="button"
            onClick={onPrevDay}
            aria-label="Previous day"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-brand-dark rounded-full shrink-0"
          >
            <ChevronLeftIcon />
          </button>

          {/* Fixed-width so arrows never shift with day-name length */}
          <div className="relative">
            <button
              type="button"
              onClick={handleDateLabelClick}
              title="Click to pick a date"
              aria-label={`Current date: ${shortLabel}. Click to open date picker.`}
              className={cn(
                'w-[138px] text-center px-1 py-1 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors min-h-[44px]',
                isToday ? 'text-brand-dark' : 'text-teal-700',
              )}
            >
              {shortLabel}
            </button>
            {/* Hidden native date input — opened programmatically on button click */}
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              className="opacity-0 pointer-events-none absolute inset-0 w-full h-full"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={onNextDay}
            aria-label="Next day"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-brand-dark rounded-full shrink-0"
          >
            <ChevronRightIcon />
          </button>
        </div>

        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Search appointments"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-dark rounded-full hover:bg-gray-50"
        >
          <SearchIcon />
        </button>
      </div>

      {/* Doctor tabs */}
      <div className="flex border-t border-gray-50 overflow-x-auto">
        {doctors.map((d) => {
          const count = appointmentsByDoctorId[d.id]?.length ?? 0
          const isActive = activeTabDoctorId === d.id
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onTabChange(d.id)}
              className={cn(
                'flex-1 text-sm font-medium py-3 px-4 whitespace-nowrap min-h-[44px] transition-colors',
                isActive
                  ? 'border-b-2 border-teal-600 text-brand-dark font-semibold'
                  : 'text-gray-500 hover:text-brand-dark',
              )}
            >
              Dr. {lastName(d.name)} ({count})
            </button>
          )
        })}
      </div>
    </div>
  )
}
