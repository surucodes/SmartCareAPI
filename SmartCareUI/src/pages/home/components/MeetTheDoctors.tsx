import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  CARD_HOVER_SPRING,
  CTA_HOVER_SPRING,
  SECTION_ENTER,
  STAGGER_CHILD,
  STAGGER_PARENT,
  TAP_SCALE,
} from '@/utils/motion'
// CLOUD_ASSET: doctor portraits below are large; replace with CDN URLs when available.
import drPrasanna from '@/assets/images/Dr Prasanna.png'
import drLakshmi from '@/assets/images/Dr.Lakshmi.png'

const DOCTORS = [
  {
    img: drPrasanna,
    name: 'Dr. Prasanna N.M',
    specialty: 'Orthopaedic Surgeon',
    quote: '"Every fracture tells a story. My job is to help write the recovery chapter."',
    profileHref: '/doctors/prasanna',
  },
  {
    img: drLakshmi,
    name: 'Dr. Lakshmi Hegde',
    specialty: 'Gynaecologist',
    quote: '"Women\'s health deserves unhurried attention and genuine care. That is what we offer here."',
    profileHref: '/doctors/lakshmi',
  },
]

export function MeetTheDoctors() {
  return (
    <motion.section
      id="about"
      {...SECTION_ENTER}
      className="relative w-full bg-[#faf9f6] py-10 px-4 md:px-12 overflow-hidden"
    >

      {/* Subtle botanical decoration */}
      <div
        className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none opacity-[0.04] -z-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M100 10 C40 10 10 60 10 100 C10 140 40 190 100 190 C160 190 190 140 190 100 C190 60 160 10 100 10Z"
            fill="#132b1a"
          />
          <path
            d="M100 30 C60 30 30 65 30 100 C30 135 60 170 100 170"
            fill="none"
            stroke="#faf9f6"
            strokeWidth="3"
          />
          <path
            d="M100 50 Q70 70 65 100 Q70 130 100 150"
            fill="none"
            stroke="#faf9f6"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="relative z-10 w-full">

        {/* ── Section header ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-gray-200 md:border-none md:pb-0 mb-10">
          <div className="flex flex-col max-w-xl">
            <span
              className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C9A227] mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Our Founders
            </span>
            <h2
              className="text-[36px] font-bold leading-[44px] text-[#111111] mb-2"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Meet The Doctors
            </h2>
            <p className="text-[18px] text-[#555555] leading-[28px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Care guided by empathy, rooted in 25+ years of experience.
            </p>
          </div>

          <Link
            to="/about"
            className="hidden md:inline-flex items-center gap-1 text-[14px] font-medium text-[#111111] hover:text-[#0F6E56] underline underline-offset-4 decoration-gray-300 hover:decoration-[#0F6E56] transition-colors shrink-0"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            View all doctors
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* ── Doctor cards grid ───────────────────────────────── */}
        <motion.div
          variants={STAGGER_PARENT}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {DOCTORS.map(({ img, name, specialty, quote, profileHref }) => (
            <motion.div
              key={name}
              variants={STAGGER_CHILD}
              whileHover={{ y: -4 }}
              transition={CARD_HOVER_SPRING}
              style={{ transition: 'box-shadow 280ms cubic-bezier(0.32, 0.72, 0, 1)' }}
              className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start shadow-[0_2px_10px_rgba(19,43,26,0.04)] hover:shadow-[0_14px_30px_rgba(19,43,26,0.10)]"
            >
              {/* Circular photo */}
              <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={img}
                  alt={`Portrait of ${name}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-grow">
                <h3
                  className="text-[20px] font-bold leading-[28px] text-[#111111] mb-1"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  {name}
                </h3>
                <p
                  className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#C9A227] mb-4"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {specialty}
                </p>
                <blockquote
                  className="text-[16px] italic text-[#555555] leading-relaxed mb-6 flex-grow"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {quote}
                </blockquote>
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={TAP_SCALE}
                  transition={CTA_HOVER_SPRING}
                  className="mt-auto"
                >
                  <Link
                    to={profileHref}
                    className="inline-flex items-center gap-2 bg-[#132b1a] hover:bg-teal-700 text-white text-[13px] font-semibold px-6 py-2.5 rounded-xl transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    View Profile
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile "View all" link */}
        <div className="md:hidden flex justify-center mt-8 pt-6 border-t border-gray-200">
          <Link
            to="/about"
            className="inline-flex items-center gap-1 text-[14px] font-medium text-[#111111] hover:text-[#0F6E56] underline underline-offset-4 decoration-gray-300 transition-colors"
          >
            View all doctors
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

      </div>
    </motion.section>
  )
}
