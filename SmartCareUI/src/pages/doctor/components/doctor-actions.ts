import type { Appointment } from '@/types/appointment.types'

export type DoctorActionId = 'confirm' | 'complete' | 'cancel'

/**
 * Single source of truth for which buttons appear on a doctor's appointment card.
 * Strictly smaller than the admin action set — no check-in, no no-show.
 *
 * Rules (see doctor-portal spec, "Action button visibility follows the doctor-only state machine"):
 *   Pending   + checkedInAt null     → [confirm, cancel]              + reschedule
 *   Pending   + checkedInAt not null → [confirm, complete, cancel]    + reschedule
 *   Confirmed + checkedInAt null     → [cancel]                       + reschedule
 *   Confirmed + checkedInAt not null → [complete, cancel]             + reschedule
 *   Completed | Cancelled | NoShow   → []                             — no reschedule
 *
 * The first entry in the `primary` array is the visual primary action.
 */
export function getDoctorActions(a: Appointment): {
  primary: DoctorActionId[]
  hasReschedule: boolean
} {
  const checkedIn = a.checkedInAt !== null

  switch (a.status) {
    case 'Pending':
      return checkedIn
        ? { primary: ['confirm', 'complete', 'cancel'], hasReschedule: true }
        : { primary: ['confirm', 'cancel'], hasReschedule: true }
    case 'Confirmed':
      return checkedIn
        ? { primary: ['complete', 'cancel'], hasReschedule: true }
        : { primary: ['cancel'], hasReschedule: true }
    case 'Completed':
    case 'Cancelled':
    case 'NoShow':
      return { primary: [], hasReschedule: false }
  }
}

export interface DoctorButtonPaletteEntry {
  /** Full Tailwind class string including idle + hover. */
  classes: string
  label: string
}

/**
 * Per-action colour palette. `classes` includes both idle and hover variants
 * as literal class names so Tailwind JIT scans them correctly.
 */
export const DOCTOR_BUTTON_PALETTE: Record<DoctorActionId, DoctorButtonPaletteEntry> = {
  confirm: {
    classes: 'bg-teal-600 text-white hover:bg-teal-800',
    label:   'Confirm',
  },
  complete: {
    classes: 'bg-emerald-800 text-white hover:bg-emerald-900',
    label:   'Complete',
  },
  cancel: {
    classes: 'border border-red-300 text-red-600 bg-white hover:bg-red-50',
    label:   'Cancel',
  },
}
