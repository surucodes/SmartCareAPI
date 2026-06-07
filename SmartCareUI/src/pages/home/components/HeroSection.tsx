import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { CARD_HOVER_SPRING, CTA_HOVER_SPRING, EASE_OUT_EXPO, TAP_SCALE } from '@/utils/motion'
// CLOUD_ASSET: hero imagery below is large (~MBs); replace with CDN URLs when available.
import hospitalBg from '@/assets/images/BackgroundImageHero.png'
import doctorsImg from '@/assets/images/DoctorsFinalCutout.png'
import drPrasanna from '@/assets/images/Dr Prasanna.png'
import drLakshmi from '@/assets/images/Dr.Lakshmi.png'

const HERO_PARENT = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const HERO_CHILD = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
}

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen overflow-hidden "
      style={{
        backgroundImage: `url(${hospitalBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 90%, transparent 100%)'
        }}
    >
      {/* ── Dark overlay for mobile readability ──────────────── */}
      <div className="absolute inset-0 z-5 bg-black/40 md:bg-black/0" />

      {/* ── Layer 2: Doctors image ───────────────────────────── */}
      <motion.img
        src={doctorsImg}
        alt="Dr. Prasanna N.M and Dr. Lakshmi Hegde"
        className="hidden md:block absolute bottom-0 right-0 h-[92%] w-auto object-contain object-right-bottom pointer-events-none select-none"
        style={{
          transform: 'translateX(100px) translateY(-50px)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 99%, transparent 50%)',
          maskImage: 'linear-gradient(to bottom, black 96%, transparent 100%)',
        }}
        initial={{ opacity: 0, x: 140, y: -50 }}
        animate={{ opacity: 1, x: 100, y: -50 }}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.15 }}
      />

      {/* ── Floating trust card — on top of doctors image ────── */}
      <motion.div
        initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.5 }}
        whileHover={{ y: -4 }}
        whileTap={TAP_SCALE}
        style={{ transition: 'box-shadow 300ms ease' }}
        className="hidden md:flex absolute bottom-[32%] right-[43%] z-20 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-[0_8px_30px_rgba(19,43,26,0.12)] border border-white/60 items-center gap-4 max-w-[190px] cursor-pointer hover:shadow-[0_18px_44px_rgba(19,43,26,0.20)]"
      >
        <motion.div
          className="flex -space-x-3 shrink-0"
          transition={CARD_HOVER_SPRING}
        >
          <img
            src={drPrasanna}
            alt="Dr. Prasanna N.M"
            className="w-11 h-11 rounded-full border-2 border-white object-cover object-top"
          />
          <img
            src={drLakshmi}
            alt="Dr. Lakshmi Hegde"
            className="w-11 h-11 rounded-full border-2 border-white object-cover object-top"
          />
        </motion.div>
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[#C9A227] text-[22px] leading-none">25+</span>
          <p className="text-[13px] text-[#555555] leading-snug">Years of trusted medical expertise</p>
        </div>
      </motion.div>

      {/* ── Layer 3: Text content ─────────────────────────────── */}
      <div className="relative z-10 max-w-[1200px] mx-auto md:mx-0 md:max-w-none px-4 md:px-16 min-h-screen flex items-start">
        <motion.div
          variants={HERO_PARENT}
          initial="hidden"
          animate="show"
          className="w-full md:w-[50%] flex flex-col gap-10 pt-[104px] pb-16"
        >

          {/* Badge */}
          <motion.div
            variants={HERO_CHILD}
            className="inline-flex items-center gap-3 px-4 py-2.5 w-fit"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(201,162,39,0.35)',
              borderRadius: '6px',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {/* Pulse icon */}
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true" className="shrink-0">
              <path
                d="M1 7h3.5l2-5.5L9 11.5l2.5-9L14 10l2-3h5"
                stroke="#C9A227"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#C9A227]">
                Est. 2007
              </span>
              <span className="text-[12px] font-medium text-white/80 md:text-[#333333]/70">
                Sagara, Karnataka
              </span>
            </div>
          </motion.div>

          {/* H1 — line 1 brand-dark, line 2 italic amber */}
          <motion.h1
            variants={HERO_CHILD}
            className="font-bold leading-[1.1] text-white md:text-[#132b1a]"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              letterSpacing: '-0.01em',
              fontSize: 'clamp(42px, 5vw, 68px)',
            }}
          >
            <span>25 Years of Caring for</span>
            <br />
            <span className="italic md:text-[#C9A227]" style={{ color: '#FFC827' }}>Malnad Families</span>
          </motion.h1>

          {/* Body */}
          <motion.p
            variants={HERO_CHILD}
            className="text-[17px] md:text-[18px] text-white md:text-[#555555] leading-relaxed max-w-[460px]"
          >
            Professional healthcare with a personal touch and utmost care. Discover premier specialist care in Orthopaedics and Gynaecology in a welcoming environment.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={HERO_CHILD}
            className="flex flex-col sm:flex-row gap-5"
          >
            <motion.div whileHover={{ y: -3 }} whileTap={TAP_SCALE} transition={CTA_HOVER_SPRING}>
              <Link
                to="/book"
                className="inline-flex items-center justify-center gap-2 bg-brand-dark text-white text-[15px] font-semibold px-7 py-3.5 rounded-full hover:bg-teal-600 transition-colors min-h-[44px] w-full sm:w-auto shadow-sm"
                aria-label="Find a doctor and book an appointment"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Find a Doctor
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} whileTap={TAP_SCALE} transition={CTA_HOVER_SPRING}>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 bg-brand-dark text-white text-[15px] font-semibold px-7 py-3.5 rounded-full hover:bg-teal-600 transition-colors min-h-[44px] w-full sm:w-auto shadow-sm"
                aria-label="Learn about our hospital"
              >
                Our Story
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} whileTap={TAP_SCALE} transition={CTA_HOVER_SPRING}>
              <Link
                to="/hospital-tour"
                className="inline-flex items-center justify-center gap-2 border border-brand-dark text-brand-dark md:text-brand-dark text-[15px] font-semibold px-7 py-3.5 rounded-full hover:bg-brand-dark hover:text-white transition-colors min-h-[44px] w-full sm:w-auto bg-white/80 md:bg-transparent"
                aria-label="Take a virtual tour of the hospital"
              >
                Take a Tour
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature blocks — icon inline with title, description below */}
          <motion.div
            variants={HERO_CHILD}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 mt-[72px]"
          >

            {/* Heritage Care */}
            <div className="flex flex-col gap-1.5 md:border-r md:border-gray-300 ">
              <div className="flex items-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
                  <path
                    d="M10 2L3 5.5V10c0 3.9 2.9 7.4 7 8.4 4.1-1 7-4.5 7-8.4V5.5L10 2z"
                    fill="#C9A227"
                    fillOpacity="0.18"
                    stroke="#C9A227"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path d="M7 10.5l2 2 4-4" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3 className="text-[17px] md:text-[18px] font-semibold text-white md:text-[#111111]">Heritage Care</h3>
              </div>
              <p className="text-[15px] md:text-[16px] text-white/90 md:text-[#555555] leading-relaxed">
                A quarter-century of proven clinical  excellence and community trust
                in the heart of Jayanagar.
              </p>
            </div>

            {/* Modern Technology */}
            <div className="flex flex-col gap-1.5 ">
              <div className="flex items-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
                  <rect x="1.5" y="4.5" width="17" height="10" rx="1.5" stroke="#C9A227" strokeWidth="1.5" />
                  <path d="M4.5 9.5h3L9 7l2.5 6 2-3.5H16" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 14.5v2M12 14.5v2M6 17h8" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <h3 className="text-[17px] md:text-[18px] font-semibold text-white md:text-[#111111]">Modern Technology</h3>
              </div>
              <p className="text-[15px] md:text-[16px] text-white/90 md:text-[#555555] leading-relaxed">
                Equipped with advanced diagnostic<br className="hidden md:block" />and surgical facilities for precise treatments.
              </p>
            </div>

          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
