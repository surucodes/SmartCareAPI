import {
  motion,
  useMotionTemplate,
  useTransform,
  type MotionValue,
} from 'motion/react'
import type { Department } from '../data/departments'
import { DeptIcon } from './DeptIcon'

interface DeckCardProps {
  dept: Department
  /** 0-based position in the deck. */
  index: number
  total: number
  /** Smoothed scroll progress, 0 → 1, shared by the whole deck. */
  progress: MotionValue<number>
  /** Half-window (in progress units) the card stays on screen for. */
  window: number
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3)
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * One department card in the rising deck. `center` is the scroll moment the
 * card sits in focus; `local` runs −1 (just below, rising) → 0 (focused) → +1
 * (drifting up and away). All transforms are derived as MotionValues straight
 * off the shared scroll progress, so the deck animates without React re-renders.
 */
export function DeckCard({
  dept,
  index,
  total,
  progress,
  window: W,
}: DeckCardProps) {
  const center = (index + 1) / (total + 1)

  const local = useTransform(progress, (p) =>
    clamp((p - center) / W, -1.35, 1.35)
  )
  // Rise from the bottom (+y) → settle (0) → exit through the top (−y).
  const y = useTransform(local, (l) => -l * 64)
  const scale = useTransform(local, (l) => clamp(1 - Math.abs(l) * 0.09, 0.8, 1))
  const opacity = useTransform(local, (l) => {
    const al = Math.abs(l)
    return al <= 0.46 ? 1 : clamp(1 - (al - 0.46) / 0.5, 0, 1)
  })
  const blur = useTransform(local, (l) => {
    const al = Math.abs(l)
    return al <= 0.5 ? 0 : (al - 0.5) * 9
  })
  const zIndex = useTransform(local, (l) => 30 - Math.round(Math.abs(l) * 12))
  // The meta block lifts a touch independently for a layered parallax feel.
  const metaLift = useTransform(local, (l) => {
    const al = Math.abs(l)
    return (1 - easeOutCubic(clamp(1 - al / 0.7, 0, 1))) * 14
  })

  const transform = useMotionTemplate`translate3d(0, ${y}vh, 0) scale(${scale})`
  const filter = useMotionTemplate`blur(${blur}px)`
  const metaTransform = useMotionTemplate`translateY(${metaLift}px)`

  return (
    <motion.div
      className="w-[min(1100px,92vw)] will-change-transform [grid-area:1/1]"
      style={{ transform, opacity, filter, zIndex }}
      aria-hidden
    >
      <div
        className="relative aspect-[20/9] max-h-[62vh] w-full overflow-hidden rounded-2xl border border-white/[0.12]"
        style={{
          background: '#0a0d12',
          boxShadow:
            '0 60px 140px -40px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(255,255,255,0.03)',
        }}
      >
        {/* Department photo. */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${dept.image})`,
            backgroundPosition: dept.focal,
          }}
        />

        {/* Scrim — keeps the index, chip, and meta legible over any photo. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(4,8,10,0.45) 0%, transparent 26%), linear-gradient(0deg, rgba(4,8,10,0.92) 0%, rgba(4,8,10,0.34) 30%, transparent 56%)',
          }}
        />

        {/* Index — top-left. */}
        <span className="absolute left-[22px] top-[18px] z-[3] flex items-baseline gap-1.5 font-playfair text-[30px] font-semibold italic leading-none text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
          {pad(index + 1)}
          <span className="font-mono text-[11px] not-italic tracking-[0.1em] text-stone-400">
            / {pad(total)}
          </span>
        </span>

        {/* Tag chip — top-right. */}
        <span
          className="absolute right-5 top-5 z-[3] rounded-full px-[11px] py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] backdrop-blur-[6px]"
          style={{
            color: 'color-mix(in oklab, var(--accent), white 22%)',
            border: '1px solid color-mix(in oklab, var(--accent), transparent 60%)',
            background: 'color-mix(in oklab, var(--accent-deep), transparent 30%)',
          }}
        >
          {dept.tag}
        </span>

        {/* Meta — bottom-left: icon + name, then floor. */}
        <motion.div
          className="absolute inset-x-6 bottom-[22px] z-[3] flex flex-col items-start gap-1.5"
          style={{ transform: metaTransform }}
        >
          <div className="flex items-center gap-3">
            <span
              className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px]"
              style={{
                color: 'var(--accent)',
                border:
                  '1px solid color-mix(in oklab, var(--accent), transparent 62%)',
                background: 'color-mix(in oklab, var(--accent), transparent 86%)',
              }}
            >
              <DeptIcon name={dept.icon} className="h-[19px] w-[19px]" />
            </span>
            <h3 className="m-0 font-playfair text-[clamp(22px,3vw,34px)] font-bold leading-[1.02] tracking-[-0.015em] text-white [text-wrap:balance]">
              {dept.name}
            </h3>
          </div>
          <p
            className="pl-[46px] font-cormorant text-[clamp(15px,1.5vw,19px)] italic leading-[1.15]"
            style={{ color: 'color-mix(in oklab, var(--accent), white 20%)' }}
          >
            {dept.floor}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
