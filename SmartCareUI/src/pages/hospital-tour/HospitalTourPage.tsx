import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import 'lenis/dist/lenis.css'
import { useLenis } from '@/hooks/useLenis'
import { useFrameSequence } from './hooks/useFrameSequence'
import { ScrollCanvas } from './components/ScrollCanvas'
import { TourProgressBar } from './components/TourProgressBar'
import { departments } from './data/departments'
import frameFirst from '@/assets/images/HospitalAssets/ezgif-1538aed688ee4782-jpg/ezgif-frame-001.jpg'
import frameLast from '@/assets/images/HospitalAssets/ezgif-1538aed688ee4782-jpg/ezgif-frame-192.jpg'

/* ── Shared small pieces ─────────────────────────────────────── */

function BackButton() {
  return (
    <Link
      to="/"
      className="fixed left-6 top-6 z-50 inline-flex min-h-touch items-center rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-black/70"
    >
      ← Spandana Hospital
    </Link>
  )
}

function LoadingScreen({ progress }: { progress: number }) {
  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#0A0A0A]"
    >
      <h1 className="font-playfair text-2xl text-white">Spandana Hospital</h1>
      <p className="mt-2 font-cormorant text-stone-400">Preparing your tour…</p>
      <div className="mx-auto mt-6 h-px w-full max-w-xs bg-stone-800">
        <div
          className="h-px bg-teal-600 transition-[width] duration-200"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </motion.div>
  )
}

/** Stacked, frame-agnostic department cards shown below the canvas on mobile. */
function MobileHotspotList() {
  return (
    <section
      aria-label="Hospital departments"
      className="px-5 pb-24 pt-8 md:hidden"
    >
      <div className="mx-auto flex max-w-md flex-col gap-4">
        {departments.map((d) => (
          <div
            key={d.id}
            className="rounded-xl border border-white/10 p-4"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <span className="mb-2 inline-block rounded-full border border-teal-600/30 bg-teal-600/20 px-2 py-0.5 text-xs text-teal-400">
              {d.tag}
            </span>
            <h3 className="font-playfair text-base font-bold leading-tight text-white">
              {d.name}
            </h3>
            <p className="mt-1 font-cormorant text-sm italic text-teal-400">
              {d.floor}
            </p>
            <div className="my-2 h-px w-full bg-white/10" />
            <p className="font-cormorant text-xs leading-relaxed text-stone-400">
              {d.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

const STATS = [
  { value: '2007', label: 'Established' },
  { value: '20', label: 'Inpatient Beds' },
  { value: '7', label: 'Specialties' },
  { value: '24/7', label: 'Emergency Care' },
]

function PostTourSection({
  sectionRef,
}: {
  sectionRef?: React.Ref<HTMLElement>
}) {
  return (
    <section
      ref={sectionRef}
      id="post-tour"
      aria-label="About Spandana Hospital"
      className="bg-[#0A0A0A] px-6 py-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        viewport={{ once: true, margin: '-80px' }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="font-cormorant text-xs uppercase tracking-[0.5em] text-stone-400">
          Sagara, Karnataka
        </p>
        <h2 className="mt-4 font-playfair text-3xl font-bold leading-tight text-white md:text-5xl">
          A place built for care.
        </h2>
        <p className="mx-auto mt-6 max-w-xl font-cormorant text-xl font-light leading-relaxed text-stone-400">
          Since 2007, Spandana Hospital has served Sagara and the surrounding
          region — with 20 beds, seven specialties, and two doctors who have
          given their careers to this community.
        </p>

        <div className="mt-16 flex flex-wrap justify-center gap-x-16 gap-y-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-playfair text-4xl font-bold text-white">
                {s.value}
              </p>
              <p className="mt-1 font-cormorant text-sm text-stone-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/book"
            className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-teal-600 px-8 py-4 font-cormorant text-lg text-white transition-colors hover:bg-teal-800"
          >
            Book an Appointment →
          </Link>
          <Link
            to="/doctors/prasanna"
            className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-stone-600 px-8 py-4 font-cormorant text-lg text-stone-400 transition-colors hover:border-stone-400 hover:text-stone-200"
          >
            Meet Our Doctors
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

/* ── Reduced-motion fallback: static before/after + list ─────── */

function ReducedMotionTour() {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <BackButton />
      <section
        aria-label="Hospital virtual tour"
        className="px-6 pt-24"
      >
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          <figure>
            <img
              src={frameFirst}
              alt="Spandana Hospital entrance — exterior glass doors"
              loading="lazy"
              decoding="async"
              className="w-full rounded-xl border border-white/10"
            />
            <figcaption className="mt-2 text-center font-cormorant text-sm italic text-stone-400">
              The entrance
            </figcaption>
          </figure>
          <figure>
            <img
              src={frameLast}
              alt="Spandana Hospital reception — interior"
              loading="lazy"
              decoding="async"
              className="w-full rounded-xl border border-white/10"
            />
            <figcaption className="mt-2 text-center font-cormorant text-sm italic text-stone-400">
              The reception
            </figcaption>
          </figure>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
          {departments.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-white/10 p-4"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <span className="mb-2 inline-block rounded-full border border-teal-600/30 bg-teal-600/20 px-2 py-0.5 text-xs text-teal-400">
                {d.tag}
              </span>
              <h3 className="font-playfair text-base font-bold leading-tight text-white">
                {d.name}
              </h3>
              <p className="mt-1 font-cormorant text-sm italic text-teal-400">
                {d.floor}
              </p>
              <div className="my-2 h-px w-full bg-white/10" />
              <p className="font-cormorant text-xs leading-relaxed text-stone-400">
                {d.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      <PostTourSection />
    </main>
  )
}

/* ── Page ────────────────────────────────────────────────────── */

export default function HospitalTourPage() {
  const prefersReducedMotion = useReducedMotion()
  const [currentFrame, setCurrentFrame] = useState(0)
  const postTourRef = useRef<HTMLElement>(null)
  // Hide the progress bar once the post-tour section scrolls into view.
  const postTourInView = useInView(postTourRef, { margin: '0px 0px -40% 0px' })

  // The frame sequence only loads for the full cinematic experience.
  const { frames, isLoaded, loadProgress } = useFrameSequence(
    !prefersReducedMotion
  )
  // Lenis smooth scroll drives the eased frame scrubbing (skipped if reduced).
  useLenis(!prefersReducedMotion)

  if (prefersReducedMotion) return <ReducedMotionTour />

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <a
        href="#post-tour"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[70] focus:rounded-lg focus:bg-teal-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to hospital information
      </a>

      <AnimatePresence>
        {!isLoaded && <LoadingScreen progress={loadProgress} />}
      </AnimatePresence>

      {isLoaded && (
        <>
          <BackButton />
          <ScrollCanvas frames={frames} onFrameChange={setCurrentFrame} />
          <MobileHotspotList />
          <TourProgressBar currentFrame={currentFrame} hidden={postTourInView} />
          <PostTourSection sectionRef={postTourRef} />
        </>
      )}
    </main>
  )
}
