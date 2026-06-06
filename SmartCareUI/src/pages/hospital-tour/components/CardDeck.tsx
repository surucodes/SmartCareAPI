import type { CSSProperties } from 'react'
import type { MotionValue } from 'motion/react'
import { departments } from '../data/departments'
import { DeckCard } from './DeckCard'

interface CardDeckProps {
  /** Smoothed scroll progress, 0 → 1, that drives every card. */
  progress: MotionValue<number>
}

/** Signature teal the cards + starfield are tinted with. */
const ACCENT = '#36d6c3'

/**
 * The rising department deck. Every card shares one centred grid cell and
 * animates independently off the scroll progress — at any moment roughly one
 * card is sharp and centred while its neighbours rise from below or drift up
 * and fade away. Desktop only (the `vh`-based rise assumes a full-height
 * stage); mobile shows the static list rendered by the page.
 */
export function CardDeck({ progress }: CardDeckProps) {
  const total = departments.length
  // Centres sit at (i+1)/(total+1); the half-window is kept just under that
  // spacing so exactly one card holds focus at a time.
  const window = (1 / (total + 1)) * 0.8

  const deckVars = {
    '--accent': ACCENT,
    '--accent-deep': `color-mix(in oklab, ${ACCENT}, #04130f 58%)`,
  } as CSSProperties

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 hidden place-items-center md:grid"
      style={deckVars}
    >
      {departments.map((dept, i) => (
        <DeckCard
          key={dept.id}
          dept={dept}
          index={i}
          total={total}
          progress={progress}
          window={window}
        />
      ))}
    </div>
  )
}
