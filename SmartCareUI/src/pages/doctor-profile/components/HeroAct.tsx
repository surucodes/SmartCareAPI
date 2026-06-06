import { useRef, type RefObject } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { HeroData } from '../doctorProfiles'
import { useIsMobile } from '../useIsMobile'

interface HeroActProps {
  data: HeroData
  /** Sentinel marking the opening "origins" scene (the village). */
  originsSentinelRef: RefObject<HTMLDivElement | null>
  /** Sentinel marking the revealed "doctor" scene. */
  heroSentinelRef: RefObject<HTMLDivElement | null>
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function HeroAct({
  data,
  originsSentinelRef,
  heroSentinelRef,
}: HeroActProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const isMobile = useIsMobile()
  const isStatic = prefersReduced || isMobile

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  })

  // Opening — the village memory. Caption clears first, then the image zooms
  // gently inward and dissolves, like stepping out of a remembered place.
  // NB: opacity uses the functional clamp form — 2-stop numeric opacity drifts
  // back past its range in this Motion build. Transform props (y/scale) clamp.
  const captionOpacity = useTransform(() =>
    clamp01(1 - scrollYProgress.get() / 0.16)
  )
  const captionY = useTransform(scrollYProgress, [0, 0.16], ['0%', '-14%'])
  const villageOpacity = useTransform(() =>
    clamp01((0.52 - scrollYProgress.get()) / 0.24)
  )
  const villageScale = useTransform(scrollYProgress, [0, 0.55], [1, 1.16])

  // Reveal — the doctor settles into focus and rises as the memory clears.
  const doctorOpacity = useTransform(() =>
    clamp01((scrollYProgress.get() - 0.3) / 0.22)
  )
  const doctorScale = useTransform(scrollYProgress, [0.05, 0.9], [1.14, 1])
  const doctorY = useTransform(scrollYProgress, [0.3, 0.9], ['6%', '0%'])

  // The doctor's title fades in last.
  const textOpacity = useTransform(() =>
    clamp01((scrollYProgress.get() - 0.62) / 0.18)
  )
  const textY = useTransform(scrollYProgress, [0.62, 0.82], ['14%', '0%'])

  if (isStatic) {
    return (
      <section aria-label="Origins and introduction" className="relative">
        {/* Opening — the village. */}
        <div className="relative h-[100svh] w-full overflow-hidden">
          <img
            src={data.afterSplitImg}
            alt={data.villageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <VillageText data={data} withScrollCue />
          <div ref={originsSentinelRef} className="absolute top-0" aria-hidden />
        </div>
        {/* The doctor. */}
        <div className="relative h-[100svh] w-full overflow-hidden">
          <img
            src={data.heroImg}
            alt={data.heroAlt}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/80" />
          <HeroText data={data} />
          <div ref={heroSentinelRef} className="absolute top-0" aria-hidden />
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label="Origins and introduction"
      ref={outerRef}
      className="relative h-[400vh]"
    >
      {/* Sentinels at real scroll depths: opening = origins, reveal = doctor. */}
      <div
        ref={originsSentinelRef}
        className="pointer-events-none absolute left-0 top-0 h-px w-full"
        aria-hidden
      />
      <div
        ref={heroSentinelRef}
        className="pointer-events-none absolute left-0 top-[72%] h-px w-full"
        aria-hidden
      />

      <div className="sticky top-0 z-10 h-screen overflow-hidden bg-[#0A0A0A]">
        {/* LAYER 0 — the doctor, revealed beneath as the memory dissolves. */}
        <motion.div
          style={{ opacity: doctorOpacity, scale: doctorScale, y: doctorY }}
          className="absolute inset-0 z-0"
        >
          <img
            src={data.heroImg}
            alt={data.heroAlt}
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/75" />
        </motion.div>

        {/* LAYER 20 — the doctor's floating title (fades in last). */}
        <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 z-20">
          <motion.div style={{ y: textY }} className="h-full w-full">
            <HeroText data={data} />
          </motion.div>
        </motion.div>

        {/* LAYER 30 — the opening village memory (zooms in + dissolves away). */}
        <motion.div
          style={{ opacity: villageOpacity, scale: villageScale }}
          className="absolute inset-0 z-30"
        >
          <img
            src={data.afterSplitImg}
            alt={data.villageAlt}
            className="h-full w-full object-cover"
          />
          {/* Cinematic vignette so the caption reads cleanly. */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
        </motion.div>

        {/* LAYER 40 — opening caption + scroll cue (clears first). */}
        <motion.div style={{ opacity: captionOpacity }} className="absolute inset-0 z-40">
          <motion.div
            style={{ y: captionY }}
            className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
          >
            {/* Soft dark halo so the caption stays legible over the bright wall. */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-[40rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-black/55 blur-3xl"
              aria-hidden
            />
            <span className="relative mb-4 font-cormorant text-xs uppercase tracking-[0.45em] text-stone-200/90">
              The Beginning
            </span>
            <h2 className="relative font-playfair text-3xl font-bold tracking-wide text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)] md:text-5xl">
              Where it began.
            </h2>
            <p className="relative mt-4 font-cormorant text-lg italic text-stone-200 drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)] md:text-xl">
              {data.originPlaceYear}
            </p>
            <div className="relative mt-10 flex flex-col items-center" aria-hidden="true">
              <span className="font-cormorant text-xs uppercase tracking-[0.4em] text-stone-300">
                scroll to begin
              </span>
              <span className="animate-scroll-line mt-3 block h-10 w-0.5 bg-stone-300" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function HeroText({ data }: { data: HeroData }) {
  return (
    <div className="absolute bottom-8 left-6 z-20 max-w-[88%] md:bottom-16 md:left-16 md:max-w-none">
      {/* Soft scrim — keeps the copy legible over light-background portraits,
          invisible over dark ones. */}
      <div
        className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.5),transparent_72%)] blur-2xl"
        aria-hidden
      />
      <p className="mb-4 font-cormorant text-sm uppercase tracking-[0.35em] text-stone-300">
        {data.preTitle}
      </p>
      <h1 className="mb-6 font-playfair text-4xl font-black leading-[0.9] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] md:text-7xl">
        {data.titleLines[0]}
        <br />
        {data.titleLines[1]}
      </h1>
      <div className="mb-6 h-px w-16 bg-stone-400" />
      <p className="max-w-sm font-cormorant text-xl font-light leading-relaxed text-stone-300">
        {data.bodyText}
      </p>
    </div>
  )
}

function VillageText({
  data,
  withScrollCue,
}: {
  data: HeroData
  withScrollCue?: boolean
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6),rgba(0,0,0,0.25)_70%)]" />
      <span className="relative mb-4 font-cormorant text-xs uppercase tracking-[0.45em] text-stone-200/90">
        The Beginning
      </span>
      <h2 className="relative font-playfair text-3xl font-bold tracking-wide text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)] md:text-5xl">
        Where it began.
      </h2>
      <p className="relative mt-4 font-cormorant text-lg italic text-stone-200 drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)] md:text-xl">
        {data.originPlaceYear}
      </p>
      {withScrollCue && (
        <div className="relative mt-10 flex flex-col items-center" aria-hidden="true">
          <span className="font-cormorant text-xs uppercase tracking-[0.4em] text-stone-300">
            scroll to begin
          </span>
          <span className="animate-scroll-line mt-3 block h-10 w-0.5 bg-stone-300" />
        </div>
      )}
    </div>
  )
}
