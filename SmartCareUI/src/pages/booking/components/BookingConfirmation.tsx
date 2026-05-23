import { useNavigate } from 'react-router-dom'
import { formatDisplayDate, formatDisplayTime } from '@/utils/date.utils'
import type { Appointment } from '@/types/appointment.types'
import type { UseBookingFlow } from '@/hooks/useBookingFlow'

interface BookingConfirmationProps {
  appointment: Appointment
  message: string
  patientPhone: string
  flow: UseBookingFlow
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="20" stroke="#0F6E56" strokeWidth="2.4" />
      <path d="M13 22.5l6 6 12-13" stroke="#0F6E56" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function displayId(fullId: string): string {
  const last = fullId.slice(-8).toUpperCase()
  return `SH-${last}`
}

export function BookingConfirmation({ appointment, message, patientPhone, flow }: BookingConfirmationProps) {
  const navigate = useNavigate()

  const handleViewAppointment = () => {
    const params = new URLSearchParams({ id: appointment.id, phone: patientPhone })
    navigate(`/my-appointment?${params.toString()}`)
  }

  const handleBookAnother = () => {
    flow.reset()
  }

  return (
    <section className="flex items-center justify-center py-6">
      <div className="w-full max-w-[480px] mx-auto bg-white rounded-2xl border border-gray-200 shadow-[0_8px_32px_rgba(19,43,26,0.08)] p-6 md:p-8 text-center transition-all duration-500">

        {/* Success icon with soft halo */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-teal-100 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-teal-50 flex items-center justify-center">
            <CheckCircle />
          </div>
        </div>

        <h2
          className="text-[24px] md:text-[28px] font-bold text-[#111] mb-3"
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          Appointment Request Received!
        </h2>
        <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
          {message || "We'll confirm your appointment within 2 hours via email and phone."}
        </p>

        {/* Appointment ID box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between px-4 py-3 mb-6 shadow-inner">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-gray-500 shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8h12M5 4l-2 4 2 4M11 4l2 4-2 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600">
              Appointment ID
            </span>
          </div>
          <span className="text-[14px] font-bold text-teal-700 bg-white px-3 py-1 rounded border border-teal-100 font-mono">
            {displayId(appointment.id)}
          </span>
        </div>

        {/* Quick recap */}
        <div className="text-left bg-teal-50/50 border border-teal-100 rounded-lg px-4 py-3 mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-700 mb-1">Your booking</p>
          <p className="text-[14px] text-[#111] font-semibold">
            {formatDisplayDate(appointment.date)} · {formatDisplayTime(appointment.slot)}
          </p>
          {appointment.consultationTypeName && (
            <p className="text-[13px] text-gray-600 mt-0.5">{appointment.consultationTypeName}</p>
          )}
          {appointment.queuePosition > 1 && (
            <p className="text-[12px] text-amber-700 mt-2">
              You're #{appointment.queuePosition} in the queue for this time window.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleViewAppointment}
            className="w-full min-h-[48px] rounded-lg bg-teal-600 text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors active:scale-[0.99] shadow-md"
          >
            View My Appointment
            <ArrowRight />
          </button>
          <button
            type="button"
            onClick={handleBookAnother}
            className="w-full min-h-[48px] rounded-lg bg-transparent border-2 border-gray-200 text-[#111] font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Book Another
            <ArrowRight />
          </button>
        </div>

        <p className="text-[12px] text-gray-500 mt-6">
          A confirmation email has been sent to your inbox. Please check your spam folder if you don't see it.
        </p>
      </div>
    </section>
  )
}
