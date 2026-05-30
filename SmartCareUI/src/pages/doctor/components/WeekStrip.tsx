import { useEffect, useMemo, useRef } from 'react'
import { addDays, format } from 'date-fns'
import { cn } from '@/utils/cn'
import { getTodayIST } from '@/utils/date.utils'

interface WeekStripProps {
  currentWeekStart: Date
  selectedDate: string
  daysWithAppointments: Set<string>
  onSelectDate: (date: string) => void
}

interface Cell {
  yyyymmdd: string
  dayShort: string
  dayNumber: string
}

export function WeekStrip({
  currentWeekStart,
  selectedDate,
  daysWithAppointments,
  onSelectDate,
}: WeekStripProps) {
  const today = getTodayIST()
  const todayCellRef = useRef<HTMLButtonElement | null>(null)

  const cells: Cell[] = useMemo(() => {
    const result: Cell[] = []
    for (let i = 0; i < 7; i++) {
      const d = addDays(currentWeekStart, i)
      result.push({
        yyyymmdd: format(d, 'yyyy-MM-dd'),
        dayShort: format(d, 'EEE'),
        dayNumber: format(d, 'd'),
      })
    }
    return result
  }, [currentWeekStart])

  // On mount, scroll today's cell into view on mobile
  useEffect(() => {
    todayCellRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'auto',
    })
  }, [])

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scrollbar">
      <div className="flex md:flex-1 md:justify-between gap-1">
        {cells.map((c) => {
          const isSelected = c.yyyymmdd === selectedDate
          const isToday = c.yyyymmdd === today
          const hasDot = daysWithAppointments.has(c.yyyymmdd)
          const cellRef = isToday ? todayCellRef : undefined

          return (
            <button
              key={c.yyyymmdd}
              ref={cellRef}
              type="button"
              onClick={() => onSelectDate(c.yyyymmdd)}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg min-w-[56px] min-h-[64px] snap-start shrink-0 md:flex-1 transition-colors relative',
                isSelected
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'hover:bg-gray-50',
              )}
              aria-pressed={isSelected}
              aria-label={`${c.dayShort} ${c.dayNumber}${isToday ? ' (today)' : ''}`}
            >
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-wider mb-0.5',
                  isSelected ? 'text-white/80' : 'text-gray-400',
                )}
              >
                {c.dayShort}
              </span>
              <span
                className={cn(
                  'text-xl font-bold',
                  isSelected
                    ? 'text-white'
                    : isToday
                      ? 'text-teal-700'
                      : 'text-brand-dark',
                )}
              >
                {c.dayNumber}
              </span>
              {/* Dot for days with appointments — reserved space when absent */}
              <span
                aria-hidden="true"
                className={cn(
                  'mt-1 w-1.5 h-1.5 rounded-full',
                  hasDot
                    ? isSelected
                      ? 'bg-amber-300'
                      : 'bg-teal-600'
                    : 'bg-transparent',
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
