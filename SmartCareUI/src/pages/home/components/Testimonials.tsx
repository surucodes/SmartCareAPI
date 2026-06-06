import { motion } from 'motion/react'
import { CARD_HOVER_SPRING, EASE_OUT_EXPO, SECTION_ENTER, STAGGER_CHILD, STAGGER_PARENT } from '@/utils/motion'

const TESTIMONIALS = [
  {
    quote:
      'Excellent care and attention. The doctors took time to listen and explained everything clearly.',
    name: 'Ramesh S.',
    role: 'Orthopaedic Patient',
    initials: 'RS',
    avatarBg: '#d4e8d8',
    avatarColor: '#132b1a',
  },
  {
    quote:
      'Dr. Lakshmi Hegde is truly compassionate and calm. I felt safe and cared for.',
    name: 'Priya M.',
    role: 'Gynaecology Patient',
    initials: 'PM',
    avatarBg: '#fde9bb',
    avatarColor: '#8a6200',
  },
  {
    quote:
      'Very clean, well-managed hospital with advanced facilities. Highly recommended!',
    name: 'Vikram P.',
    role: 'General Medicine Patient',
    initials: 'VP',
    avatarBg: '#dbeafe',
    avatarColor: '#1e40af',
  },
]

const STAR_PARENT = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
}

const STAR_CHILD = {
  hidden: { opacity: 0, scale: 0.7 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.32, ease: EASE_OUT_EXPO },
  },
}

function StarRating() {
  return (
    <motion.div
      variants={STAR_PARENT}
      className="flex items-center gap-0.5"
      aria-label="5 out of 5 stars"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.svg
          key={i}
          variants={STAR_CHILD}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="#C9A227"
          aria-hidden="true"
        >
          <path d="M7 1l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 9.3l-3.2 1.7.6-3.6L1.8 4.8l3.6-.5z" />
        </motion.svg>
      ))}
    </motion.div>
  )
}

export function Testimonials() {
  return (
    <motion.section
      {...SECTION_ENTER}
      className="w-full bg-[#faf9f6] py-16 px-4 md:px-12 overflow-hidden relative"
    >

      {/* Decorative background shape */}
      <div
        className="absolute right-0 bottom-0 w-72 h-72 pointer-events-none opacity-[0.06] translate-x-1/4 translate-y-1/4"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <circle cx="100" cy="100" r="90" fill="#132b1a" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="#faf9f6" strokeWidth="2" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="#faf9f6" strokeWidth="2" />
        </svg>
      </div>

      <div className="relative z-10 w-full">

        {/* ── Section header ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-4">
          <div>
            <span
              className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C9A227] mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Patients Speak
            </span>
            <h2
              className="text-[32px] md:text-[36px] font-bold leading-[44px] text-[#111111]"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              What Our Patients Say
            </h2>
          </div>

          <button
            type="button"
            className="self-start md:self-auto inline-flex items-center gap-1 text-[14px] font-medium text-[#555555] hover:text-[#0F6E56] transition-colors group"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            View all testimonials
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Testimonial cards ───────────────────────────────── */}
        <motion.div
          variants={STAGGER_PARENT}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
        >
          {TESTIMONIALS.map(({ quote, name, role, initials, avatarBg, avatarColor }) => (
            <motion.div
              key={name}
              variants={STAGGER_CHILD}
              whileHover={{ y: -4 }}
              transition={CARD_HOVER_SPRING}
              style={{ transition: 'box-shadow 280ms cubic-bezier(0.32, 0.72, 0, 1)' }}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-[0_4px_20px_rgba(19,43,26,0.04)] hover:shadow-[0_18px_36px_rgba(19,43,26,0.10)] flex flex-col h-full"
            >
              {/* Top row: quote mark + stars */}
              <div className="flex justify-between items-start mb-4">
                <svg
                  width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true"
                  className="opacity-20"
                >
                  <path
                    d="M4 22c0-6 4-10 10-12l2 3c-3 1-5 3-5 5h4v8H4v-4zm18 0c0-6 4-10 10-12l2 3c-3 1-5 3-5 5h4v8H22v-4z"
                    fill="#132b1a"
                  />
                </svg>
                <StarRating />
              </div>

              {/* Quote text */}
              <p
                className="text-[16px] text-[#333333] leading-relaxed mb-8 flex-grow"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {quote}
              </p>

              {/* Patient info */}
              <div className="flex items-center gap-3 mt-auto">
                <div
                  className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-[13px] font-bold border border-gray-200"
                  style={{ backgroundColor: avatarBg, color: avatarColor }}
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div>
                  <h4
                    className="text-[14px] font-semibold text-[#111111] leading-none mb-0.5"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {name}
                  </h4>
                  <p
                    className="text-[13px] text-[#888888]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Pagination dots ─────────────────────────────────── */}
        <div className="flex justify-center items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#132b1a]" aria-label="Page 1 of 3 (current)" />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" aria-label="Page 2 of 3" />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" aria-label="Page 3 of 3" />
        </div>

      </div>
    </motion.section>
  )
}
