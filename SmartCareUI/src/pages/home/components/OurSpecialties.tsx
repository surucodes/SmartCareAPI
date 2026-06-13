import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { CARD_HOVER_SPRING, SECTION_ENTER, STAGGER_CHILD, STAGGER_PARENT } from '@/utils/motion'
import orthoIcon      from '@/assets/images/orthoIcon.png'
import gynaeIcon      from '@/assets/images/GynaeIcon.png'
import physioIcon     from '@/assets/images/physioLogo.png'
import microIcon      from '@/assets/images/MicroscopeIcon.png'
import radiologyIcon  from '@/assets/images/Radiology icon.jpeg'
import pharmacyIcon   from '@/assets/images/pharmacy icon.jpeg'

type Specialty = {
  label: string
  icon: { type: 'img'; src: string; alt: string } | { type: 'svg'; el: React.ReactNode }
  href: string
}

const SPECIALTIES: Specialty[] = [
  {
    label: 'Orthopaedics',
    icon: { type: 'img', src: orthoIcon, alt: 'Orthopaedics icon' },
    href: '/specialties',
  },
  {
    label: 'Gynaecology & Obstetrics',
    icon: { type: 'img', src: gynaeIcon, alt: 'Gynaecology & Obstetrics icon' },
    href: '/specialties',
  },
  {
    label: 'Physiotherapy',
    icon: { type: 'img', src: physioIcon, alt: 'Physiotherapy icon' },
    href: '/specialties',
  },
  {
    label: 'Radiology',
    icon: { type: 'img', src: radiologyIcon, alt: 'Radiology icon' },
    href: '/specialties',
  },
  {
    label: 'Pathology & Laboratory',
    icon: { type: 'img', src: microIcon, alt: 'Pathology & Laboratory icon' },
    href: '/specialties',
  },
  {
    label: 'Pharmacy',
    icon: { type: 'img', src: pharmacyIcon, alt: 'Pharmacy icon' },
    href: '/specialties',
  },
]

const MotionLink = motion(Link)

export function OurSpecialties() {
  return (
    <motion.section
      id="specialties"
      {...SECTION_ENTER}
      className="w-full bg-white py-16 px-4 md:px-12 overflow-hidden"
    >
      <div className="w-full">

        {/* ── Section header ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-4">
          <div>
            <span
              className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C9A227] mb-3"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Our Specialties
            </span>
            <h2
              className="text-[32px] md:text-[36px] font-bold leading-[1.2] text-[#111111]"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Comprehensive Care<br className="md:hidden" /> for Every Need
            </h2>
          </div>

          <Link
            to="/specialties"
            className="self-start md:self-auto inline-flex items-center gap-2 text-[14px] font-semibold text-[#111111] border border-gray-300 hover:border-[#132b1a] hover:text-[#132b1a] px-5 py-2.5 rounded-lg transition-colors group"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Explore All Specialties
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* ── Specialties grid ─────────────────────────────────── */}
        <motion.div
          variants={STAGGER_PARENT}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {SPECIALTIES.map(({ label, icon, href }) => (
            <MotionLink
              key={label}
              to={href}
              variants={STAGGER_CHILD}
              whileHover={{ y: -4 }}
              transition={CARD_HOVER_SPRING}
              style={{ transition: 'box-shadow 250ms cubic-bezier(0.32, 0.72, 0, 1)' }}
              className="group bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-4 hover:shadow-[0_10px_28px_rgba(19,43,26,0.10)]"
            >
              {icon.type === 'img' ? (
                <img
                  src={icon.src}
                  alt={icon.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-16 h-16 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-[#132b1a]/10 flex items-center justify-center transition-colors shrink-0">
                  {icon.el}
                </div>
              )}
              <span
                className="text-[14px] font-semibold text-center text-[#111111] leading-snug"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {label}
              </span>
            </MotionLink>
          ))}
        </motion.div>

      </div>
    </motion.section>
  )
}
