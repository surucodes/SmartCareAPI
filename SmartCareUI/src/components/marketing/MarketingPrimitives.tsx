import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { EASE_OUT_EXPO } from '@/utils/motion'

const SERIF = '"Playfair Display", Georgia, serif'
const SANS = 'Inter, sans-serif'

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-[#C9A227]"
      style={{ fontFamily: SANS }}
    >
      {children}
    </span>
  )
}

interface Cta {
  label: string
  to: string
}

interface PageHeroProps {
  eyebrow: string
  title: React.ReactNode
  subtitle?: string
  primaryCta?: Cta
  secondaryCta?: Cta
}

/** Light hero band that sits under the (transparent → white) fixed header. */
export function PageHero({ eyebrow, title, subtitle, primaryCta, secondaryCta }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-warm-50">
      {/* Decorative glow */}
      <div
        className="absolute -top-32 right-0 w-[480px] h-[480px] pointer-events-none opacity-[0.06]"
        aria-hidden="true"
        style={{ background: 'radial-gradient(circle at 70% 30%, #132b1a 0%, transparent 62%)' }}
      />
      {/* Decorative botanical ring */}
      <div
        className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full border border-brand-dark/10 pointer-events-none hidden md:block"
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 md:px-12 pt-10 md:pt-16 pb-14 md:pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1
            className="mt-4 text-[34px] md:text-[52px] font-bold leading-[1.08] text-[#111111]"
            style={{ fontFamily: SERIF }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="mt-5 text-[16px] md:text-[19px] text-[#555555] leading-[1.7] max-w-2xl mx-auto"
              style={{ fontFamily: SANS }}
            >
              {subtitle}
            </p>
          )}
          {(primaryCta || secondaryCta) && (
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              {primaryCta && (
                <Link
                  to={primaryCta.to}
                  className="inline-flex items-center gap-2 bg-brand-dark text-white text-[15px] font-semibold px-7 py-3.5 rounded-full hover:bg-teal-600 transition-colors shadow-sm min-h-[44px]"
                >
                  {primaryCta.label}
                  <ArrowIcon />
                </Link>
              )}
              {secondaryCta && (
                <Link
                  to={secondaryCta.to}
                  className="inline-flex items-center gap-2 border border-gray-300 text-[#111111] text-[15px] font-semibold px-7 py-3.5 rounded-full hover:border-brand-dark hover:text-brand-dark transition-colors min-h-[44px]"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

interface SectionHeadingProps {
  eyebrow: string
  title: React.ReactNode
  subtitle?: string
  align?: 'center' | 'left'
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'center' }: SectionHeadingProps) {
  return (
    <div className={cn('mb-12', align === 'center' && 'text-center max-w-2xl mx-auto')}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        className="mt-2 text-[28px] md:text-[36px] font-bold leading-tight text-[#111111]"
        style={{ fontFamily: SERIF }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-4 text-[15px] md:text-[17px] text-[#555555] leading-relaxed"
          style={{ fontFamily: SANS }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

interface MarketingCTAProps {
  title: string
  subtitle: string
  primaryLabel?: string
  primaryTo?: string
}

/** Dark closing call-to-action band, shared across the marketing pages. */
export function MarketingCTA({
  title,
  subtitle,
  primaryLabel = 'Book an Appointment',
  primaryTo = '/book',
}: MarketingCTAProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
      className="relative w-full bg-brand-dark py-16 md:py-20 px-4 md:px-12 overflow-hidden"
    >
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none"
        aria-hidden="true"
        style={{ background: 'radial-gradient(circle at 10% 90%, rgba(168,213,184,0.15) 0%, transparent 55%)' }}
      />
      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-5">
        <h2 className="text-[28px] md:text-[38px] font-bold leading-tight text-white" style={{ fontFamily: SERIF }}>
          {title}
        </h2>
        <p className="text-[16px] md:text-[18px] text-[#A8D5B8]/80 leading-relaxed max-w-xl" style={{ fontFamily: SANS }}>
          {subtitle}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={primaryTo}
            className="inline-flex items-center gap-2 bg-[#C9A227] text-brand-dark text-[15px] font-bold px-7 py-3.5 rounded-full hover:bg-[#d8b43a] transition-colors min-h-[44px]"
          >
            {primaryLabel}
            <ArrowIcon />
          </Link>
          <a
            href="tel:+919071880718"
            className="inline-flex items-center gap-2 border border-white/30 text-white text-[15px] font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors min-h-[44px]"
          >
            Call +91 90718 80718
          </a>
        </div>
      </div>
    </motion.section>
  )
}

/** Scrolls to the top when a marketing page mounts (no global scroll restoration). */
export function useScrollTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
}
