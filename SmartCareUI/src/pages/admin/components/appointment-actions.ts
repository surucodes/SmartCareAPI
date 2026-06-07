import type { Appointment } from '@/types/appointment.types'

export type ActionId = 'confirm' | 'checkIn' | 'complete' | 'noShow' | 'cancel'

/**
 * Single source of truth for which action buttons appear on an appointment.
 * Both AppointmentCard and AppointmentDetailPanel SHALL call this helper.
 *
 * Rules (see admin-dashboard spec, "Action button visibility follows a single state machine"):
 *   Pending   + checkedInAt null     → confirm, checkIn, cancel
 *   Pending   + checkedInAt not null → confirm, complete, cancel
 *   Confirmed + checkedInAt null     → checkIn, noShow, cancel
 *   Confirmed + checkedInAt not null → complete, noShow, cancel
 *   Completed | Cancelled | NoShow   → (none — read-only)
 *
 * The first entry in the returned array is the visual primary action.
 */
export function getActionButtons(a: Appointment): ActionId[] {
  const checkedIn = a.checkedInAt !== null

  switch (a.status) {
    case 'Pending':
      return checkedIn
        ? ['confirm', 'complete', 'cancel']
        : ['confirm', 'checkIn', 'cancel']
    case 'Confirmed':
      return checkedIn
        ? ['complete', 'noShow', 'cancel']
        : ['checkIn', 'noShow', 'cancel']
    case 'Completed':
    case 'Cancelled':
    case 'NoShow':
      return []
  }
}

export interface ButtonPaletteEntry {
  /** Full Tailwind class string including idle + hover. */
  classes: string
  label: string
}

/**
 * Per-action colour palette. The `classes` field is a complete Tailwind class
 * string that includes both idle and hover variants as literal class names so
 * the Tailwind JIT scanner picks them up correctly.
 *
 * amber-600 / amber-800 are used in place of the exact spec value #B8860B
 * (closest in the default Tailwind palette without extending the config).
 */
export const BUTTON_PALETTE: Record<ActionId, ButtonPaletteEntry> = {
  confirm: {
    classes: 'bg-teal-600 text-white hover:bg-teal-800',
    label:   'Confirm',
  },
  checkIn: {
    classes: 'bg-amber-600 text-white hover:bg-amber-800',
    label:   'Check In',
  },
  complete: {
    classes: 'bg-emerald-800 text-white hover:bg-emerald-900',
    label:   'Complete',
  },
  noShow: {
    classes: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
    label:   'No Show',
  },
  cancel: {
    classes: 'border border-red-300 text-red-600 bg-white hover:bg-red-50',
    label:   'Cancel',
  },
}
