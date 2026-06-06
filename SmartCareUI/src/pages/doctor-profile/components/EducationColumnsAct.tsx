import { type RefObject } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import {
  EducationColumn,
  type EducationColumnData,
} from './EducationColumn'
import { useIsMobile } from '../useIsMobile'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

interface EducationColumnsActProps {
  /** Used both as the scroll target and the era-indicator sentinel. */
  sectionRef: RefObject<HTMLElement | null>
  columns: EducationColumnData[]
}

export function EducationColumnsAct({
  sectionRef,
  columns,
}: EducationColumnsActProps) {
  const prefersReduced = useReducedMotion()
  const isMobile = useIsMobile()
  const isStatic = prefersReduced || isMobile

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Phase 1 — staggered enter from below.
  const col1Y = useTransform(scrollYProgress, [0, 0.28], ['100vh', '0vh'])
  const col2Y = useTransform(scrollYProgress, [0.06, 0.34], ['100vh', '0vh'])
  const col3Y = useTransform(scrollYProgress, [0.12, 0.4], ['100vh', '0vh'])

  // Opacity uses the functional clamp form. A 2-stop numeric opacity doesn't
  // clamp in this Motion build — it drifts back toward translucent past the
  // range, which made the columns look semi-transparent during the exit.
  const col1Opacity = useTransform(() => clamp01(scrollYProgress.get() / 0.2))
  const col2Opacity = useTransform(() =>
    clamp01((scrollYProgress.get() - 0.06) / 0.2)
  )
  const col3Opacity = useTransform(() =>
    clamp01((scrollYProgress.get() - 0.12) / 0.2)
  )

  // Phase 2 — the curtain leaves as a growing stack:
  //  · the MIDDLE column slides right first, landing on the rightmost column
  //  · the LEFT column follows while the middle is still moving
  //  · all three — now stacked on the right — then slide off together
  // Column width = ⅓ viewport, so 100% == one column over. The right column
  // sits at ⅔vw; middle reaches it at +100%, left reaches it at +200%.
  const col2X = useTransform(
    scrollYProgress,
    [0.5, 0.64, 0.74, 0.95],
    ['0%', '100%', '100%', '200%']
  )
  const col1X = useTransform(
    scrollYProgress,
    [0.54, 0.7, 0.74, 0.95],
    ['0%', '200%', '200%', '300%']
  )
  const col3X = useTransform(scrollYProgress, [0.74, 0.95], ['0%', '100%'])

  const columnYs = [col1Y, col2Y, col3Y]
  const columnXs = [col1X, col2X, col3X]
  const columnOpacities = [col1Opacity, col2Opacity, col3Opacity]
  // Left rides on top of middle rides on top of the stationary right column.
  const columnZ = [30, 20, 10]

  const headingOpacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.48, 0.58],
    [0, 1, 1, 0]
  )

  // Dividers fade in once landed, then clear as the sweep begins.
  const dividerOpacity = useTransform(
    scrollYProgress,
    [0.4, 0.46, 0.48, 0.51],
    [0, 1, 1, 0]
  )

  if (isStatic) {
    return (
      <section
        aria-label="The making of a surgeon"
        ref={sectionRef}
        className="relative"
      >
        <p className="bg-[#0A0A0A] px-6 pb-2 pt-16 text-center font-cormorant text-[11px] uppercase tracking-[0.35em] text-stone-400">
          The Making of a Surgeon
        </p>
        <div className="flex flex-col">
          {columns.map((data) => (
            <StaticColumn key={data.year} data={data} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label="The making of a surgeon"
      ref={sectionRef}
      className="relative z-[5] h-[500vh]"
    >
      <div className="sticky top-0 z-[5] h-screen overflow-hidden">
        <motion.p
          style={{ opacity: headingOpacity }}
          className="absolute inset-x-0 top-6 z-40 px-4 text-center font-cormorant text-[10px] uppercase tracking-[0.25em] text-stone-400 md:top-8 md:text-xs md:tracking-[0.5em]"
        >
          The Making of a Surgeon
        </motion.p>

        <div className="flex h-screen w-full">
          {columns.map((data, i) => (
            <EducationColumn
              key={data.year}
              data={data}
              translateY={columnYs[i]}
              translateX={columnXs[i]}
              opacity={columnOpacities[i]}
              zIndex={columnZ[i]}
            />
          ))}

          {/* Hairline dividers between columns. */}
          <motion.div
            style={{ opacity: dividerOpacity }}
            className="pointer-events-none absolute inset-y-0 left-1/3 z-[5] w-px bg-stone-600/40"
            aria-hidden
          />
          <motion.div
            style={{ opacity: dividerOpacity }}
            className="pointer-events-none absolute inset-y-0 left-2/3 z-[5] w-px bg-stone-600/40"
            aria-hidden
          />
        </div>
      </div>
    </section>
  )
}

/**
 * Static, full-width card used on phones (and for reduced-motion visitors).
 * Each college reads as its own tinted card with the image caption floating
 * on top, then the year + reflection below — stacked vertically, no overlap.
 */
function StaticColumn({ data }: { data: EducationColumnData }) {
  return (
    <div className="w-full px-6 py-12 md:px-8" style={{ backgroundColor: data.bg }}>
      <div className="mx-auto max-w-md">
        <div className="relative overflow-hidden">
          <img
            src={data.img}
            alt={data.alt}
            className="aspect-[4/3] w-full object-cover"
            style={{ filter: data.imgFilter }}
          />
          <div className="absolute inset-0" style={{ background: data.imgOverlay }} />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p
              className={`font-cormorant text-[11px] uppercase tracking-[0.25em] ${data.labelClass}`}
            >
              {data.label}
            </p>
            <h3
              className={`mt-1.5 font-playfair text-2xl font-bold leading-tight ${data.nameClass}`}
            >
              {data.nameLines[0]}
              <br />
              {data.nameLines[1]}
            </h3>
            <p className={`mt-1 font-cormorant text-sm italic ${data.degreeClass}`}>
              {data.degree}
            </p>
            <div className={`mt-3 h-px w-8 ${data.ruleClass}`} />
          </div>
        </div>
        <div className="pt-5">
          <p
            className={`font-playfair text-4xl font-black leading-none opacity-40 ${data.yearClass}`}
          >
            {data.year}
          </p>
          <p
            className={`mt-3 font-cormorant text-sm leading-relaxed ${data.bodyClass}`}
          >
            {data.body}
          </p>
        </div>
      </div>
    </div>
  )
}
