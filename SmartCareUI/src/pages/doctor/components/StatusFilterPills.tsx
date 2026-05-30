import { cn } from '@/utils/cn'
import type { DoctorFilter } from '@/hooks/useDoctorSchedule'

interface StatusFilterPillsProps {
  value: DoctorFilter
  onChange: (filter: DoctorFilter) => void
}

const PILLS: { id: DoctorFilter; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending',   label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
]

export function StatusFilterPills({ value, onChange }: StatusFilterPillsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter appointments by status"
      className="inline-flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-100 shadow-sm"
    >
      {PILLS.map((pill) => {
        const isActive = value === pill.id
        return (
          <button
            key={pill.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(pill.id)}
            className={cn(
              'min-h-[44px] px-4 rounded-md text-sm font-semibold transition-colors',
              isActive
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50',
            )}
          >
            {pill.label}
          </button>
        )
      })}
    </div>
  )
}
