import { cn } from '@/utils/cn'
import { TOTAL_FRAMES } from '../hooks/useFrameSequence'

interface TourProgressBarProps {
  currentFrame: number
  /** Hidden once the sticky tour section leaves the viewport. */
  hidden: boolean
}

interface AreaMarker {
  label: string
  /** Track position as a percentage. */
  at: number
  /** Frame past which the marker is considered "reached". */
  frame: number
}

// One marker per rising card, at the scroll moment it holds focus — centres
// sit at (i+1)/9 of the track (≈ frame (i+1)/9 × TOTAL_FRAMES, here 192).
// Order matches departments.ts.
const MARKERS: AreaMarker[] = [
  { label: 'Ortho', at: 11.1, frame: 21 },
  { label: 'Gynae', at: 22.2, frame: 43 },
  { label: 'X-Ray', at: 33.3, frame: 64 },
  { label: 'Scan', at: 44.4, frame: 85 },
  { label: 'OT', at: 55.6, frame: 107 },
  { label: 'Lab', at: 66.7, frame: 128 },
  { label: 'Physio', at: 77.8, frame: 149 },
  { label: 'Pharmacy', at: 88.9, frame: 171 },
]

const LAST_INDEX = TOTAL_FRAMES - 1

export function TourProgressBar({ currentFrame, hidden }: TourProgressBarProps) {
  const progress = (currentFrame / LAST_INDEX) * 100

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex h-10 items-center gap-4 border-t border-white/[0.08] px-4 backdrop-blur-sm transition-opacity duration-500 md:h-14 md:px-8',
        hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
      )}
      style={{ background: 'rgba(10, 10, 10, 0.8)' }}
    >
      {/* Left label — desktop only */}
      <span className="hidden shrink-0 font-cormorant text-xs uppercase tracking-widest text-stone-400 lg:block">
        Spandana Hospital · Sagara
      </span>

      {/* Centre progress track */}
      <div className="relative h-px flex-1 bg-stone-800">
        <div
          className="absolute left-0 top-0 h-px bg-teal-600 transition-[width] duration-75"
          style={{ width: `${progress}%` }}
        />
        {/* Area markers — desktop only */}
        {MARKERS.map((marker) => {
          const active = currentFrame >= marker.frame
          return (
            <div
              key={marker.label}
              className="absolute top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
              style={{ left: `${marker.at}%` }}
            >
              <div
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  active ? 'bg-teal-400' : 'bg-stone-600'
                )}
              />
              {active && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-cormorant text-xs text-teal-400">
                  {marker.label}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Right frame counter */}
      <span className="shrink-0 font-cormorant text-xs text-stone-600">
        {currentFrame + 1} / {TOTAL_FRAMES}
      </span>
    </div>
  )
}
