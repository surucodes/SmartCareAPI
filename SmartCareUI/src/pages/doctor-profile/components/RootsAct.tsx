import { type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import type { OtherDoctor } from '../doctorProfiles'
// CLOUD_ASSET: large (~2.4 MB) image; replace with a CDN URL when available.
import grandparentsImg from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/grandparents.png'

interface RootsActProps {
  sectionRef: RefObject<HTMLElement | null>
  otherDoctor: OtherDoctor
}

export function RootsAct({ sectionRef, otherDoctor }: RootsActProps) {
  const prefersReduced = useReducedMotion()

  return (
    <section
      aria-label="The roots"
      ref={sectionRef}
      className="relative z-[1] flex min-h-screen flex-col items-center justify-center bg-[#111111] px-6 py-20 md:px-8 md:py-28"
    >
      <motion.div
        {...(prefersReduced
          ? {}
          : {
              initial: { opacity: 0 },
              whileInView: { opacity: 1 },
              viewport: { once: true, margin: '-50px' },
              transition: { duration: 2, ease: 'easeOut' },
            })}
        className="flex w-full flex-col items-center"
      >
        {/* Grandparents image with a large, floating gratitude headline. */}
        <div className="relative mx-auto w-full max-w-4xl overflow-hidden border border-white/[0.08] shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
          <img
            src={grandparentsImg}
            alt="Family — the grandparents who made it possible"
            className="max-h-[640px] w-full object-cover"
            style={{ filter: 'grayscale(1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <h2 className="absolute inset-x-0 bottom-0 px-6 pb-10 text-center font-playfair text-4xl font-medium italic leading-[1.05] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] md:pb-16 md:text-7xl">
            Forever grateful
            <br />
            for the ones who
            <br />
            made it happen.
          </h2>
        </div>

        <div className="mx-auto mb-12 mt-14 h-px w-16 bg-stone-700" />

        <p className="mx-auto max-w-sm text-center font-cormorant text-lg font-light italic leading-relaxed text-stone-400 md:text-xl">
          To the families of Nisarani and Sirsi — your sacrifices built this.
        </p>

        {/* Cross-link to the other founder + back home. */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <Link
            to={otherDoctor.href}
            className="group inline-flex items-center gap-3 font-cormorant text-base italic text-stone-300 transition-colors hover:text-white"
          >
            <span className="h-px w-8 bg-stone-600 transition-all duration-300 group-hover:w-12 group-hover:bg-stone-300" />
            Meet {otherDoctor.name}
            <span aria-hidden>→</span>
          </Link>
          <Link
            to="/"
            className="font-cormorant text-sm uppercase tracking-[0.3em] text-teal-400 transition-colors hover:text-teal-300"
          >
            ← Back to Spandana Hospital
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
