import type { Transition, Variants } from 'motion/react'

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const VAUL_EASE = [0.32, 0.72, 0, 1] as const

export const SECTION_ENTER = {
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: EASE_OUT_EXPO },
} as const

export const STAGGER_PARENT: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
}

export const STAGGER_CHILD: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
}

export const CARD_HOVER_SPRING: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 38,
  mass: 1,
}

export const CTA_HOVER_SPRING: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 26,
}

export const TAP_SCALE = { scale: 0.97 } as const

/* ─── Admin & Doctor portal motion presets ─────────────────────────── */

/** Right-side slide-in panel — Admin & Doctor detail panels (desktop). */
export const PANEL_SLIDE_RIGHT: Variants = {
  initial: { x: 60, opacity: 0, filter: 'blur(8px)' },
  animate: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.28, ease: VAUL_EASE },
  },
  exit: {
    x: 24,
    opacity: 0,
    filter: 'blur(4px)',
    transition: { duration: 0.18, ease: VAUL_EASE },
  },
}

/** Bottom-sheet slide-up — Mobile nav + mobile detail panels. */
export const SHEET_SLIDE_UP: Variants = {
  initial: { y: '100%', opacity: 0, filter: 'blur(8px)' },
  animate: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.28, ease: VAUL_EASE },
  },
  exit: {
    y: 60,
    opacity: 0,
    filter: 'blur(4px)',
    transition: { duration: 0.2, ease: VAUL_EASE },
  },
}

/** Backdrop fade — used behind modals & sheets. */
export const BACKDROP_FADE: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } },
}

/** Centred modal scale-in — SearchOverlay, WalkInBookingModal. */
export const MODAL_SCALE: Variants = {
  initial: { scale: 0.95, opacity: 0, y: 8, filter: 'blur(6px)' },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.24, ease: EASE_OUT_EXPO, delay: 0.04 },
  },
  exit: {
    scale: 0.97,
    opacity: 0,
    filter: 'blur(4px)',
    transition: { duration: 0.16, ease: EASE_OUT_EXPO },
  },
}

/** Nav-canvas swap — fade + small rise for high-level content switches. */
export const CANVAS_SWAP: Variants = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.2, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: EASE_OUT_EXPO },
  },
}

/** Banner — slide-down enter, fade exit (admin walk-in confirmation). */
export const BANNER_SLIDE: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
}

/** In-place form swap — Cancel/Reschedule form reveals inside panels and cards. */
export const FORM_SWAP: Variants = {
  initial: { opacity: 0, y: -8, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.2, ease: VAUL_EASE },
  },
  exit: {
    opacity: 0,
    filter: 'blur(3px)',
    transition: { duration: 0.14, ease: VAUL_EASE },
  },
}

/** Subtle banner/notice fade-in — used for email-note / error alerts. */
export const NOTICE_FADE: Variants = {
  initial: { opacity: 0, y: -4 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12 },
  },
}
