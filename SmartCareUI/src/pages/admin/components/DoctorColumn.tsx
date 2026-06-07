import { useMemo } from 'react'
import type { Appointment } from '@/types/appointment.types'
import type { Doctor } from '@/types/doctor.types'
import { AppointmentCard } from './AppointmentCard'

interface DoctorColumnProps {
  doctor: Doctor
  appointments: Appointment[]
  isLoading: boolean
  selectedAppointmentId: string | null
  onCardClick: (appt: Appointment) => void
  onConfirm: (id: string) => void
  onComplete: (id: string) => void
  onMarkNoShow: (id: string) => void
  onCancel: (id: string) => void
  onCheckIn: (id: string) => void
}

function getInitials(name: string): string {
  const parts = name.replace(/^Dr\.?\s*/i, '').trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function CalendarEmptyIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true">
      <rect x="8" y="12" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 20h32M16 8v8M32 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function DoctorColumn({
  doctor,
  appointments,
  isLoading,
  selectedAppointmentId,
  onCardClick,
  onConfirm,
  onComplete,
  onMarkNoShow,
  onCancel,
  onCheckIn,
}: DoctorColumnProps) {
  const sorted = useMemo(
    () => appointments.slice().sort((a, b) => a.slot.localeCompare(b.slot)),
    [appointments],
  )

  return (
    <div className="flex flex-col gap-4 min-w-0">

      {/* Column header (sticky) */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {doctor.photoUrl ? (
            <img
              src={doctor.photoUrl}
              alt=""
              aria-hidden="true"
              className="w-12 h-12 rounded-full object-cover bg-gray-100"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
              {getInitials(doctor.name)}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-bold text-brand-dark truncate">
              {doctor.name}
            </h2>
            <p className="text-xs font-semibold tracking-widest text-brand-gold uppercase mt-0.5">
              {doctor.specialty}
            </p>
          </div>
        </div>
        <span className="bg-teal-800 text-white rounded-full px-3 py-1 text-sm font-bold shrink-0">
          {sorted.length}
        </span>
      </div>

      {/* Appointments */}
      <div className="flex flex-col gap-3 pb-8">
        {isLoading ? (
          <>
            <div className="animate-pulse bg-gray-100 rounded-xl h-28" />
            <div className="animate-pulse bg-gray-100 rounded-xl h-28" />
            <div className="animate-pulse bg-gray-100 rounded-xl h-28" />
          </>
        ) : sorted.length === 0 ? (
          <div className="text-center py-8">
            <CalendarEmptyIcon />
            <p className="text-sm text-gray-400">No appointments today</p>
          </div>
        ) : (
          sorted.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              selected={appt.id === selectedAppointmentId}
              onClick={() => onCardClick(appt)}
              onConfirm={() => onConfirm(appt.id)}
              onComplete={() => onComplete(appt.id)}
              onMarkNoShow={() => onMarkNoShow(appt.id)}
              onCancel={() => onCancel(appt.id)}
              onCheckIn={() => onCheckIn(appt.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
