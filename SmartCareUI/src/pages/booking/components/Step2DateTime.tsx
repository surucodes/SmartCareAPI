import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { TAP_SCALE } from '@/utils/motion'
import {
  formatDisplayDate,
  formatDisplayTime,
  getTodayIST,
  getDayName,
} from '@/utils/date.utils'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import type { SlotResponse } from '@/types/doctor.types'
import type { UseBookingFlow } from '@/hooks/useBookingFlow'

interface Step2Props {
  flow: UseBookingFlow
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

function dateKey(year: number, month0: number, day: number) {
  return `${year}-${pad2(month0 + 1)}-${pad2(day)}`
}

function parseDateKey(key: string): { y: number; m0: number; d: number } {
  const [y, m, d] = key.split('-').map(Number)
  return { y: y!, m0: (m! - 1), d: d! }
}

function isBefore(a: string, b: string): boolean {
  return a < b
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface CalendarProps {
  today: string
  selectedDate: string | null
  viewMonth: number      // 0-based
  viewYear: number
  onPrev: () => void
  onNext: () => void
  onSelect: (date: string) => void
}

function Calendar({ today, selectedDate, viewMonth, viewYear, onPrev, onNext, onSelect }: CalendarProps) {
  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const firstDay = firstOfMonth.getDay()             // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const monthLabel = firstOfMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const todayParts = parseDateKey(today)
  const canGoBack =
    viewYear > todayParts.y || (viewYear === todayParts.y && viewMonth > todayParts.m0)

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-[0_4px_20px_rgba(19,43,26,0.04)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-[#111]">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canGoBack}
            aria-label="Previous month"
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              canGoBack
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-300 cursor-not-allowed',
            )}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next month"
            className="w-9 h-9 rounded-full flex items-center justify-center text-teal-700 hover:bg-teal-50 transition-colors"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="text-[12px] font-semibold text-gray-500 py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((d, i) => {
          if (d === null) return <div key={`pad-${i}`} className="h-10" />
          const key = dateKey(viewYear, viewMonth, d)
          const isPast = isBefore(key, today)
          const isToday = key === today
          const isSelected = selectedDate === key

          return (
            <div key={key} className="flex items-center justify-center py-0.5">
              <button
                type="button"
                disabled={isPast}
                onClick={() => onSelect(key)}
                className={cn(
                  'w-10 h-10 rounded-full text-[14px] font-medium flex items-center justify-center transition-all duration-150',
                  isSelected && 'bg-teal-600 text-white shadow-md scale-105',
                  !isSelected && isToday && !isPast && 'border-2 border-teal-600 text-teal-700',
                  !isSelected && !isToday && !isPast && 'text-[#111] hover:bg-teal-50',
                  isPast && 'text-gray-300 cursor-not-allowed',
                )}
                aria-label={`${formatDisplayDate(key)}${isToday ? ' (today)' : ''}${isPast ? ' unavailable' : ''}`}
                aria-pressed={isSelected}
              >
                {d}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface SlotPillProps {
  slot: SlotResponse
  isSelected: boolean
  onSelect: () => void
}

function SlotPill({ slot, isSelected, onSelect }: SlotPillProps) {
  const isUnavailable = slot.status === 'Unavailable'
  const isLimited = slot.status === 'Limited'
  const display = formatDisplayTime(slot.time)

  return (
    <motion.button
      type="button"
      disabled={isUnavailable}
      onClick={onSelect}
      whileTap={!isUnavailable ? TAP_SCALE : undefined}
      animate={{ scale: isSelected ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className={cn(
        'relative min-h-[44px] py-2.5 px-3 text-center rounded-lg text-[14px] font-medium border-2 transition-colors duration-150',
        isSelected && 'bg-teal-600 text-white border-teal-600 shadow-md',
        !isSelected && !isUnavailable && !isLimited && 'bg-white text-teal-700 border-teal-600 hover:bg-teal-50',
        !isSelected && isLimited && 'bg-white text-[#8a6200] border-[#C9A227] hover:bg-amber-50',
        isUnavailable && 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed',
      )}
      aria-pressed={isSelected}
      aria-label={`${display}${isLimited ? ' — filling fast' : ''}${isUnavailable ? ' — unavailable' : ''}`}
    >
      {display}
      {isLimited && !isSelected && (
        <span className="absolute -top-2 -right-1 bg-[#C9A227] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none">
          Filling
        </span>
      )}
    </motion.button>
  )
}

export function Step2DateTime({ flow }: Step2Props) {
  const today = getTodayIST()
  const initial = flow.selectedDate ? parseDateKey(flow.selectedDate) : parseDateKey(today)
  const [viewMonth, setViewMonth] = useState<number>(initial.m0)
  const [viewYear, setViewYear] = useState<number>(initial.y)

  const handlePrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }
  const handleNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handleDateSelect = (date: string) => {
    flow.setDateTime(date, '')
  }

  const handleSlotSelect = (slotTime: string) => {
    if (!flow.selectedDate) return
    flow.setDateTime(flow.selectedDate, slotTime)
  }

  const slotsResult = useAvailableSlots(
    flow.selectedDoctorId,
    flow.selectedDate,
    flow.selectedConsultationTypeId,
  )

  const { morningSlots, afternoonSlots } = useMemo(() => {
    const morning: SlotResponse[] = []
    const afternoon: SlotResponse[] = []
    for (const s of slotsResult.slots) {
      const hour = Number(s.time.split(':')[0])
      if (hour < 12) morning.push(s)
      else afternoon.push(s)
    }
    return { morningSlots: morning, afternoonSlots: afternoon }
  }, [slotsResult.slots])

  const noSlots =
    !slotsResult.isLoading && !slotsResult.isError && flow.selectedDate && slotsResult.slots.length === 0

  const canContinue = Boolean(flow.selectedDate && flow.selectedSlot)

  return (
    <section className="flex flex-col gap-6 pb-24 md:pb-0">
      <div className="text-center">
        <h1 className="text-[28px] md:text-[36px] font-bold text-[#111]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          Choose Date &amp; Time
        </h1>
        <p className="text-[14px] text-gray-600 mt-1">Pick your preferred appointment window.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Calendar */}
        <Calendar
          today={today}
          selectedDate={flow.selectedDate}
          viewMonth={viewMonth}
          viewYear={viewYear}
          onPrev={handlePrev}
          onNext={handleNext}
          onSelect={handleDateSelect}
        />

        {/* Time slots */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0_4px_20px_rgba(19,43,26,0.04)] p-5 min-h-[300px]">
          <h3 className="text-[15px] font-semibold text-[#111] mb-3">Available Times</h3>

          {!flow.selectedDate && (
            <div className="text-center py-12 text-gray-500 text-[14px]">
              Pick a date to see available time slots.
            </div>
          )}

          {flow.selectedDate && slotsResult.isLoading && (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
              <span className="text-[14px]">Loading available slots…</span>
            </div>
          )}

          {flow.selectedDate && slotsResult.isError && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-[14px] text-red-600">Couldn't load available times.</p>
              <button
                type="button"
                onClick={slotsResult.refetch}
                className="px-4 min-h-[40px] rounded-lg bg-teal-600 text-white text-[13px] font-semibold hover:bg-teal-700 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {flow.selectedDate && !slotsResult.isLoading && !slotsResult.isError && (
            <>
              {/* Emergency banner */}
              {slotsResult.emergencyOnly && (
                <div className="mb-4 flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="text-amber-700 shrink-0 mt-0.5">
                    <path d="M10 2L1 17h18L10 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M10 8v4M10 14v.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  <p className="text-[13px] text-amber-900 leading-snug">
                    {slotsResult.emergencyMessage ||
                      'This day is for emergency cases only. By selecting a slot you confirm this is urgent.'}
                  </p>
                </div>
              )}

              {/* No slots */}
              {noSlots && flow.selectedDoctor && (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M8 15l8-3M8 12l8 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-[14px] text-gray-700">
                    {flow.selectedDoctor.name} is not available on this day.
                  </p>
                  <p className="text-[13px] text-gray-500">Please select another date.</p>
                </div>
              )}

              {/* Morning */}
              {morningSlots.length > 0 && (
                <div className="mb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-2.5">Morning</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {morningSlots.map((slot) => (
                      <SlotPill
                        key={slot.time}
                        slot={slot}
                        isSelected={flow.selectedSlot === slot.time}
                        onSelect={() => handleSlotSelect(slot.time)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Afternoon */}
              {afternoonSlots.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-2.5">Afternoon</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {afternoonSlots.map((slot) => (
                      <SlotPill
                        key={slot.time}
                        slot={slot}
                        isSelected={flow.selectedSlot === slot.time}
                        onSelect={() => handleSlotSelect(slot.time)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom sticky bar */}
      <div className="fixed md:relative bottom-0 left-0 right-0 md:left-auto md:right-auto bg-white md:bg-transparent border-t border-gray-200 md:border-0 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] md:shadow-none px-4 py-3 md:p-0 md:mt-4 z-30">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Selected and Continue */}
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Selected</p>
              {flow.selectedDoctor && flow.selectedConsultationTypeName && (
                <p className="text-[13px] text-gray-700 mb-1">
                  {flow.selectedDoctor.name} • {flow.selectedConsultationTypeName}
                </p>
              )}
              <p className="text-[14px] font-semibold text-[#111] truncate">
                {flow.selectedDate && flow.selectedSlot
                  ? `${getDayName(flow.selectedDate).slice(0, 3)}, ${formatDisplayDate(flow.selectedDate)} · ${formatDisplayTime(flow.selectedSlot)}`
                  : flow.selectedDate
                    ? `${formatDisplayDate(flow.selectedDate)} · Pick a slot`
                    : 'Pick a date and slot'}
              </p>
            </div>
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => flow.goToStep(3)}
              className={cn(
                'inline-flex items-center gap-2 min-h-[48px] px-6 rounded-lg text-[15px] font-semibold transition-all duration-200 shrink-0',
                canContinue
                  ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700 hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed',
              )}
            >
              Continue
              <ArrowRight />
            </button>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="text-gray-500 shrink-0 mt-0.5">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10 6v5M10 14v.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <p className="text-[13px] text-gray-600 italic leading-relaxed">
              You're booking a preferred time window. Our administrative team will contact you to confirm
              your exact appointment time within 2 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
