import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const IST = 'Asia/Kolkata'

export function formatDisplayDate(dateString: string): string {
  // Input: "yyyy-MM-dd" — treat as IST date, never UTC
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return format(date, 'd MMM yyyy')
}

export function formatDisplayTime(slot: string): string {
  // Input: "HH:MM" 24-hour — convert to 12-hour display
  const [hours, minutes] = slot.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function formatTimestamp(isoUtcString: string): string {
  // Input: ISO UTC timestamp — display in IST
  const utcDate = parseISO(isoUtcString)
  const istDate = toZonedTime(utcDate, IST)
  return format(istDate, 'd MMM yyyy, h:mm a')
}

export function getTodayIST(): string {
  // Returns today's date in IST as "yyyy-MM-dd"
  const istDate = toZonedTime(new Date(), IST)
  return format(istDate, 'yyyy-MM-dd')
}

export function getDayName(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return format(new Date(year, month - 1, day), 'EEEE')
}

// Returns the number of hours from "now in IST" until the appointment's date+slot,
// which are themselves IST wall-clock strings. Both sides are projected into a
// single local frame so the millisecond diff equals the IST wall-clock diff
// regardless of the user's actual system timezone.
export function hoursUntilAppointmentIst(date: string, slot: string): number {
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = slot.split(':').map(Number)
  const nowIst = toZonedTime(new Date(), IST)
  const appt = new Date(year, month - 1, day, hours, minutes, 0, 0)
  const now = new Date(
    nowIst.getFullYear(),
    nowIst.getMonth(),
    nowIst.getDate(),
    nowIst.getHours(),
    nowIst.getMinutes(),
    nowIst.getSeconds(),
    0,
  )
  return (appt.getTime() - now.getTime()) / (60 * 60 * 1000)
}
