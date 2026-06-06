import { motion, type MotionValue } from 'motion/react'
import { cn } from '@/utils/cn'

export type EraSection =
  | 'hero'
  | 'origins'
  | 'education'
  | 'practice'
  | 'roots'

interface EraDot {
  id: EraSection
  label: string
}

const DOTS: EraDot[] = [
  { id: 'origins', label: 'The Origins' },
  { id: 'hero', label: 'The Doctor' },
  { id: 'education', label: 'The Education' },
  { id: 'practice', label: 'The Practice' },
  { id: 'roots', label: 'The Roots' },
]

interface EraIndicatorProps {
  activeSection: EraSection
  /** On the cream practice act the dots need to be dark to stay visible. */
  isLightBackground: boolean
  /** Overall scroll progress (0 → 1), drives the gold spine fill. */
  progress: MotionValue<number>
  /** Smooth-scrolls the page to the given act. */
  onNavigate: (id: EraSection) => void
}

export function EraIndicator({
  activeSection,
  isLightBackground,
  progress,
  onNavigate,
}: EraIndicatorProps) {
  return (
    <nav
      aria-label="Biography sections"
      className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-5 md:flex"
    >
      {/* Progress spine — a faint track with a gold fill tracking scroll. */}
      <div
        aria-hidden
        className="absolute right-[3.5px] top-1 bottom-1 w-px overflow-hidden rounded-full"
        style={{
          backgroundColor: isLightBackground
            ? 'rgba(28,25,23,0.15)'
            : 'rgba(255,255,255,0.12)',
        }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-full origin-top rounded-full"
          style={{ scaleY: progress, backgroundColor: '#C9A227' }}
        />
      </div>

      {DOTS.map(({ id, label }) => {
        const active = id === activeSection
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-label={`Jump to ${label}`}
            aria-current={active ? 'true' : undefined}
            className="group relative z-10 flex items-center justify-end rounded-full py-1.5 pl-10 focus-visible:outline-none"
          >
            <span
              className={cn(
                'pointer-events-none absolute right-6 whitespace-nowrap font-cormorant text-xs uppercase tracking-[0.2em] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100',
                isLightBackground ? 'text-stone-600' : 'text-stone-400'
              )}
            >
              {label}
            </span>
            <motion.span
              className={cn(
                'block h-2 w-2 rounded-full ring-2 ring-transparent transition-shadow group-focus-visible:ring-[#C9A227]/60',
                isLightBackground
                  ? active
                    ? 'bg-stone-900'
                    : 'bg-stone-400 group-hover:bg-stone-600'
                  : active
                    ? 'bg-white'
                    : 'bg-stone-600 group-hover:bg-stone-400'
              )}
              animate={{ scale: active ? 1.5 : 1, opacity: active ? 1 : 0.4 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        )
      })}
    </nav>
  )
}
