import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

const SECTION_ENTER = {
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
}

const CARD_SPRING = { type: 'spring' as const, stiffness: 320, damping: 26 }
const ARROW_SPRING = { type: 'spring' as const, stiffness: 400, damping: 18 }

export function CTABanner() {
  return (
    <motion.section
      {...SECTION_ENTER}
      className="relative w-full bg-[#132b1a] py-16 md:py-20 px-4 md:px-12 overflow-hidden"
    >
      {/* ── Decorative radial glow (bottom-left) ───────────── */}
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle at 10% 90%, rgba(168,213,184,0.15) 0%, transparent 55%)',
        }}
      />

      {/* ── Decorative medical cross (centre-right of text) ─ */}
      <div className="absolute left-[38%] top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.06]" aria-hidden="true">
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
          <rect x="80" y="10" width="60" height="200" rx="14" fill="#A8D5B8" />
          <rect x="10" y="80" width="200" height="60" rx="14" fill="#A8D5B8" />
        </svg>
      </div>

      {/* ── Decorative ring (top-left of text block) ───────── */}
      <div
        className="absolute -top-10 -left-10 w-56 h-56 rounded-full border border-white/10 pointer-events-none hidden lg:block"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 w-full">

        {/* ── Left: heading + body ────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">

          {/* Calendar icon badge */}
          <div className="w-14 h-14 rounded-full border border-[#A8D5B8]/30 bg-white/10 flex items-center justify-center shrink-0">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <rect x="2" y="5" width="22" height="19" rx="3" stroke="#A8D5B8" strokeWidth="1.6" />
              <path d="M2 11h22" stroke="#A8D5B8" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M8 2v4M18 2v4" stroke="#A8D5B8" strokeWidth="1.6" strokeLinecap="round" />
              <rect x="7" y="15" width="4" height="4" rx="1" fill="#C9A227" />
            </svg>
          </div>

          <h2
            className="text-[30px] md:text-[36px] font-bold leading-tight text-white"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Your Health, Our Priority
          </h2>
          <p
            className="text-[16px] md:text-[18px] text-[#A8D5B8]/80 leading-relaxed max-w-md"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Book an appointment today and experience healthcare that truly cares.
          </p>
        </div>

        {/* ── Right: action cards ─────────────────────────────── */}
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-5 justify-center lg:justify-end">

          {/* Card 1: Book Appointment */}
          <motion.div
            initial={false}
            variants={{ hover: { y: -4 } }}
            whileHover="hover"
            whileTap={{ scale: 0.97 }}
            transition={CARD_SPRING}
            className="w-full sm:w-[260px]"
          >
            <Link
              to="/book"
              className="group relative bg-white rounded-[12px] p-6 shadow-lg block w-full flex flex-col justify-between overflow-hidden border border-gray-100 min-h-[160px]"
              aria-label="Book your appointment"
            >
              {/* Hover tint */}
              <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-10">
                <h3
                  className="text-[18px] font-bold text-[#111111] mb-1 leading-snug"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  Book Your Appointment
                </h3>
                <p
                  className="text-[14px] text-[#888888]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Quick. Easy. Reliable.
                </p>
              </div>

              {/* Amber arrow — springs forward on hover */}
              <div className="relative z-10 flex justify-end mt-6">
                <motion.div
                  variants={{ hover: { x: 4 } }}
                  transition={ARROW_SPRING}
                  className="w-12 h-12 rounded-full bg-[#C9A227] group-hover:bg-[#b08c1a] flex items-center justify-center transition-colors duration-300"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M4 10h12M12 5l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Card 2: Call Us */}
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            transition={CARD_SPRING}
            className="w-full sm:w-[260px]"
          >
            <a
              href="tel:+919071880718"
              className="group bg-[#1e3f2a] rounded-[12px] p-6 shadow-lg w-full flex flex-col justify-between border border-white/10 min-h-[160px]"
              aria-label="Call Spandana Hospital at +91 90718 80718"
            >
              {/* Phone icon badge */}
              <div className="w-10 h-10 rounded-full bg-[#132b1a]/60 flex items-center justify-center mb-4 border border-[#C9A227]/30">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M3 1h3.5l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L13 10l4 1.5V15a2 2 0 0 1-2 2C6.4 17 1 11.6 1 3a2 2 0 0 1 2-2z"
                    stroke="#C9A227"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <p
                  className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#A8D5B8]/70 mb-1"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Call Us
                </p>
                <p
                  className="text-[24px] font-bold text-white leading-tight mb-1 group-hover:text-[#C9A227] transition-colors duration-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  +91 90718 80718
                </p>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A8D5B8]/60"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Available 24/7 for Emergencies
                </p>
              </div>
            </a>
          </motion.div>

        </div>
      </div>
    </motion.section>
  )
}
