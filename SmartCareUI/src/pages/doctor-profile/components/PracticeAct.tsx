import { useRef, useState, type RefObject } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react'

interface PracticeActProps {
  sectionRef: RefObject<HTMLElement | null>
}

interface TimelineNode {
  years: string
  location: string
  description: string
  /** Progress point (0–1 of the timeline scroll) at which this node lights up. */
  threshold: number
  current?: boolean
}

const NODES: TimelineNode[] = [
  {
    years: '1995 – 2000',
    location: 'Kerala',
    description: 'Early practice. Building experience far from home.',
    threshold: 0.04,
  },
  {
    years: '2000 – 2007',
    location: 'Bhatkal',
    description: 'Coastal Karnataka. Years of service and quiet growth.',
    threshold: 0.45,
  },
  {
    years: '2007 – Present',
    location: 'Sagara',
    description: 'Home. Spandana Hospital — built from the ground up.',
    threshold: 0.82,
    current: true,
  },
]

const EASE = [0.25, 0.46, 0.45, 0.94] as const

export function PracticeAct({ sectionRef }: PracticeActProps) {
  const prefersReduced = useReducedMotion()
  const timelineRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress: lineProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 55%'],
  })
  const fillHeight = useTransform(lineProgress, [0, 1], ['0%', '100%'])

  // How many nodes the line has reached (drives the dot "lit" state).
  const [reached, setReached] = useState(prefersReduced ? NODES.length : 0)
  useMotionValueEvent(lineProgress, 'change', (v) => {
    if (prefersReduced) return
    setReached(NODES.filter((n) => v >= n.threshold).length)
  })

  return (
    <section
      aria-label="The practice journey"
      ref={sectionRef}
      // On desktop the section is pulled up under the education curtain's
      // final 100vh, so the marriage moment is revealed THROUGH the (now
      // empty, transparent) sticky as the columns clear — no blank cream gap.
      className="relative z-[1] min-h-screen bg-[#F5F0E6] px-6 pb-24 pt-16 md:-mt-[100vh] md:px-8 md:pb-32 md:pt-20"
    >
      {/* Part A — Marriage moment. */}
      <div className="relative mx-auto flex max-w-3xl flex-col items-center pb-12 pt-6 text-center md:pb-16 md:pt-10">
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 select-none font-playfair font-black text-stone-800/10"
          style={{ fontSize: 'clamp(5rem, 18vw, 13rem)' }}
          aria-hidden
        >
          1995
        </span>
        <motion.div
          {...(prefersReduced
            ? {}
            : {
                initial: { opacity: 0, y: 40 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: '-80px' },
                transition: { duration: 1.1, ease: EASE },
              })}
          className="relative z-10"
        >
          <p className="mb-4 font-cormorant text-sm uppercase tracking-[0.4em] text-stone-500">
            Hubli, Karnataka
          </p>
          <p className="mx-auto max-w-2xl font-cormorant text-2xl font-light leading-relaxed text-stone-700 md:text-4xl">
            Two doctors. One family.
            <br />
            The year that changed everything.
          </p>
          <div className="mx-auto my-8 h-16 w-px bg-stone-400" />
        </motion.div>
      </div>

      {/* Part B — Vertical, scroll-driven timeline. */}
      <div className="py-10 md:py-16">
        <p className="mb-14 text-center font-cormorant text-xs uppercase tracking-[0.5em] text-stone-400">
          The Journey
        </p>

        <div ref={timelineRef} className="relative mx-auto max-w-md">
          {/* Static track. */}
          <div
            className="absolute bottom-6 left-[7px] top-2 w-px bg-stone-300"
            aria-hidden
          />
          {/* Green fill that grows as the visitor scrolls. */}
          <motion.div
            style={{ height: prefersReduced ? '100%' : fillHeight }}
            className="absolute left-[6px] top-2 w-[3px] origin-top rounded-full bg-teal-600"
            aria-hidden
          />

          <ol className="relative">
            {NODES.map((node, i) => {
              const lit = i < reached
              return (
                <li
                  key={node.location}
                  className="relative flex gap-6 pb-14 last:pb-0"
                >
                  {/* Dot gutter. */}
                  <div className="relative flex w-4 flex-shrink-0 justify-center">
                    {node.current && lit && !prefersReduced && (
                      <motion.span
                        className="absolute top-1 h-5 w-5 rounded-full bg-teal-500"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        aria-hidden
                      />
                    )}
                    <span
                      className={`relative z-10 mt-1 rounded-full ring-4 ring-[#F5F0E6] transition-all duration-500 ${
                        node.current ? 'h-5 w-5' : 'h-3.5 w-3.5'
                      } ${lit ? 'bg-teal-600' : 'bg-stone-300'}`}
                    />
                  </div>

                  {/* Content. */}
                  <div className="flex-1 pb-2">
                    <p className="font-cormorant text-sm italic text-stone-500">
                      {node.years}
                    </p>
                    <p
                      className={`mt-1 font-playfair text-2xl font-bold transition-colors duration-500 md:text-3xl ${
                        lit && node.current ? 'text-teal-700' : 'text-stone-800'
                      }`}
                    >
                      {node.location}
                    </p>
                    <p className="mt-2 max-w-sm font-cormorant text-base leading-relaxed text-stone-500">
                      {node.description}
                    </p>
                    {node.current && (
                      <span className="mt-4 inline-flex rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 font-cormorant text-xs tracking-wide text-teal-700">
                        Spandana Hospital · Est. 2007
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
