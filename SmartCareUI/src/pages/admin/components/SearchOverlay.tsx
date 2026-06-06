import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { BACKDROP_FADE, MODAL_SCALE } from '@/utils/motion'
import { formatDisplayTime } from '@/utils/date.utils'
import type { Appointment } from '@/types/appointment.types'
import type { Doctor } from '@/types/doctor.types'

interface SearchOverlayProps {
  appointments: Appointment[]
  doctors: Doctor[]
  onClose: () => void
  onSelectAppointment: (appt: Appointment) => void
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-gray-400" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 14l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function statusBadgeMeta(appt: Appointment): { label: string; classes: string } {
  switch (appt.status) {
    case 'Pending':   return { label: 'Pending',   classes: 'bg-amber-100 text-amber-800' }
    case 'Confirmed': return { label: 'Confirmed', classes: 'bg-teal-100 text-teal-800' }
    case 'Completed': return { label: 'Completed', classes: 'bg-gray-100 text-gray-600' }
    case 'Cancelled': return { label: 'Cancelled', classes: 'bg-gray-100 text-gray-500' }
    case 'NoShow':    return { label: 'No Show',   classes: 'bg-gray-100 text-gray-500' }
  }
}

export function SearchOverlay({
  appointments,
  doctors,
  onClose,
  onSelectAppointment,
}: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Esc to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    const lowered = q.toLowerCase()
    const numeric = q.replace(/\D/g, '')
    return appointments.filter((a) => {
      const nameMatch = a.patientName.toLowerCase().includes(lowered)
      const phoneMatch =
        numeric.length > 0 &&
        a.patientPhone.replace(/\s/g, '').includes(numeric)
      return nameMatch || phoneMatch
    })
  }, [appointments, query])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 md:pt-20 p-4">
      <motion.div
        role="presentation"
        onClick={onClose}
        variants={BACKDROP_FADE}
        initial="initial"
        animate="animate"
        exit="exit"
        className="absolute inset-0 bg-black/40"
      />
      <motion.div
        variants={MODAL_SCALE}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >

        {/* Search input */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient name or phone number"
            className="flex-1 min-h-[44px] bg-transparent outline-none text-base text-brand-dark placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-brand-dark rounded-full hover:bg-gray-50"
          >
            <XIcon />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-sm text-gray-400">
              Search by patient name or phone number
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No appointments found for &lsquo;{query}&rsquo;
            </div>
          ) : (
            <ul>
              {results.map((appt) => {
                const doctor = doctors.find((d) => d.id === appt.doctorId)
                const badge = statusBadgeMeta(appt)
                return (
                  <li key={appt.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectAppointment(appt)
                        onClose()
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors min-h-[44px]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-brand-dark text-sm truncate">
                              {appt.patientName}
                            </p>
                            <span className="text-xs text-gray-400 shrink-0">
                              • {appt.patientPhone}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDisplayTime(appt.slot)} • {doctor?.name ?? '—'}
                          </p>
                        </div>
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0', badge.classes)}>
                          {badge.label}
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  )
}
