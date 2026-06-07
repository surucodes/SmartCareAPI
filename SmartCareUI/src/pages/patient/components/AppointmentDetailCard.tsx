import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/utils/cn'
import { doctorsService } from '@/services/doctors.service'
import { formatDisplayDate, formatDisplayTime } from '@/utils/date.utils'
import type { Appointment } from '@/types/appointment.types'
import type { Doctor } from '@/types/doctor.types'
import { StatusBadge } from './StatusBadge'
import { CancellationSection } from './CancellationSection'
import drPrasannaLocal from '@/assets/images/Dr Prasanna.png'
import drLakshmiLocal from '@/assets/images/Dr.Lakshmi.png'

interface AppointmentDetailCardProps {
  appointment: Appointment
  onCancel: (reason: string) => Promise<void>
  isCancelling: boolean
  cancelError: string | null
  cancelSuccess: boolean
}

function displayId(fullId: string): string {
  const last = fullId.slice(-8).toUpperCase()
  return `SH-${last}`
}

function localPhotoFor(name: string): string | null {
  if (/prasanna/i.test(name)) return drPrasannaLocal
  if (/lakshmi/i.test(name)) return drLakshmiLocal
  return null
}

function DoctorAvatar({ doctor }: { doctor: Doctor }) {
  const [errored, setErrored] = useState(false)
  const fallback = localPhotoFor(doctor.name)
  const src = !errored ? doctor.photoUrl || fallback || '' : ''
  const show = !!src

  if (!show) {
    return (
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full shrink-0 border-2 border-white shadow-sm overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center">
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="9" r="6" fill="rgba(255,255,255,0.85)" />
          <path d="M2 27c0-6.6 5.4-11 12-11s12 4.4 12 11" fill="rgba(255,255,255,0.85)" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={doctor.name}
      onError={() => setErrored(true)}
      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover object-top border-2 border-white shadow-sm shrink-0 bg-gray-100"
    />
  )
}

function DoctorSkeleton() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

interface InfoCellProps {
  label: string
  children: React.ReactNode
}

function InfoCell({ label, children }: InfoCellProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500 mb-1.5">
        {label}
      </p>
      <p className="text-[15px] font-semibold text-[#111] leading-snug">
        {children}
      </p>
    </div>
  )
}

export function AppointmentDetailCard({
  appointment,
  onCancel,
  isCancelling,
  cancelError,
  cancelSuccess,
}: AppointmentDetailCardProps) {
  const doctorQuery = useQuery<Doctor>({
    queryKey: ['doctor', appointment.doctorId],
    queryFn: () => doctorsService.getById(appointment.doctorId),
    staleTime: 5 * 60_000,
    retry: 1,
  })

  const idDisplay = displayId(appointment.id)
  const consultationType = appointment.consultationTypeName ?? 'General Consultation'
  const showQueueRow = appointment.queuePosition > 1

  return (
    <section className="w-full max-w-lg md:max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_rgba(19,43,26,0.08)] overflow-hidden">
        {/* Header */}
        <div className="px-5 md:px-8 pt-6 md:pt-8 pb-5">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="min-w-0">
              <h1
                className="text-[22px] md:text-[28px] font-bold text-teal-900 leading-tight"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Appointment Found
              </h1>
              <p className="text-[13px] text-gray-500 mt-1">
                Showing details for ID:{' '}
                <span className="font-medium text-gray-700">{idDisplay}</span>
              </p>
            </div>
            <StatusBadge status={appointment.status} className="shrink-0" />
          </div>

          {/* Doctor row */}
          <div className="mb-6">
            {doctorQuery.isLoading ? (
              <DoctorSkeleton />
            ) : doctorQuery.data ? (
              <div className="flex items-center gap-4">
                <DoctorAvatar doctor={doctorQuery.data} />
                <div className="min-w-0">
                  <h2
                    className="text-[18px] md:text-[20px] font-bold text-teal-900 leading-tight truncate"
                    style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                  >
                    {doctorQuery.data.name}
                  </h2>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-gold mt-1">
                    {doctorQuery.data.specialty}
                  </p>
                </div>
              </div>
            ) : (
              // Fallback if doctor fetch fails — never show a broken card
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full shrink-0 border-2 border-white shadow-sm overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <circle cx="14" cy="9" r="6" fill="rgba(255,255,255,0.85)" />
                    <path d="M2 27c0-6.6 5.4-11 12-11s12 4.4 12 11" fill="rgba(255,255,255,0.85)" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-gray-700">
                    Doctor ID: {appointment.doctorId}
                  </p>
                  <p className="text-[12px] text-gray-500 mt-1">
                    Doctor details unavailable
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-y-5 gap-x-6 md:gap-x-10 mt-6">
            <InfoCell label="Date">{formatDisplayDate(appointment.date)}</InfoCell>
            <InfoCell label="Time">{formatDisplayTime(appointment.slot)}</InfoCell>
            <InfoCell label="Type">{consultationType}</InfoCell>
            <InfoCell label="Patient">{appointment.patientName}</InfoCell>
          </div>

          {/* Queue position row — conditional, full width */}
          {showQueueRow && (
            <div className="mt-5">
              <span
                className={cn(
                  'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full',
                  'bg-amber-50 border border-amber-200 text-amber-900',
                  'text-[12.5px] font-medium',
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 6v6l4 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                </svg>
                Position #{appointment.queuePosition} in queue for this time window
              </span>
            </div>
          )}

          {/* Appointment ID full-width row */}
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500 mb-1.5">
              Appointment ID
            </p>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 bg-warm-50 font-mono text-[13.5px] font-semibold text-teal-800 tracking-wide">
              {idDisplay}
            </span>
          </div>
        </div>

        {/* Cancellation section */}
        <div className="px-5 md:px-8 pb-6 md:pb-8 pt-2">
          <CancellationSection
            appointment={appointment}
            onCancel={onCancel}
            isCancelling={isCancelling}
            cancelError={cancelError}
            cancelSuccess={cancelSuccess}
          />
        </div>
      </div>
    </section>
  )
}
