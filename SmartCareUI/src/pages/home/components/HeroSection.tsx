import { Link } from 'react-router-dom'
import hospitalBg from '@/assets/images/BackgroundImageHero.png'
import doctorsImg from '@/assets/images/DoctorsFinalCutout.png'
import drPrasanna from '@/assets/images/Dr Prasanna.png'
import drLakshmi from '@/assets/images/Dr.Lakshmi.png'

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
      <img
        src={doctorsImg}
        alt="Dr. Prasanna N.M and Dr. Lakshmi Hegde"
        className="hidden md:block absolute bottom-0 right-0 h-[92%] w-auto object-contain object-right-bottom pointer-events-none select-none"
        style={{ transform: 'translateX(100px) translateY(-50px)' }}
      />

      {/* ── Floating trust card — on top of doctors image ────── */}
      <div className="hidden md:block absolute bottom-[32%] right-[43%] z-20 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-[0_8px_30px_rgba(19,43,26,0.12)] border border-white/60 flex items-center gap-4 max-w-[190px] cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-[0_20px_50px_rgba(19,43,26,0.25)]">
        <div className="flex -space-x-3 shrink-0">
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
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[#C9A227] text-[22px] leading-none">25+</span>
          <p className="text-[13px] text-[#555555] leading-snug">Years of trusted medical expertise</p>
        </div>
      </div>

      {/* ── Layer 3: Text content ─────────────────────────────── */}
      {/*
        items-start  → anchors content to the top, not the middle.
        pt-[104px]   → clears the 64px fixed header + 40px breathing room.
        Desktop: left 50% width keeps text in the light left zone.
      */}
      <div className="relative z-10 max-w-[1200px] mx-auto md:mx-0 md:max-w-none px-4 md:px-16 min-h-screen flex items-start">
        <div className="w-full md:w-[50%] flex flex-col gap-10 pt-[104px] pb-16">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 border border-gray-200 shadow-sm w-fit">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="7.5" cy="7.5" r="7.5" fill="#0F6E56" />
              <path d="M4.5 7.5l2.5 2.5 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[14px] font-medium text-gray-600">State-of-the-art facilities</span>
          </div>

          {/* H1 — line 1 brand-dark, line 2 italic amber */}
          <h1
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
          </h1>

          {/* Body */}
          <p className="text-[17px] md:text-[18px] text-white md:text-[#555555] leading-relaxed max-w-[460px]">
            Professional healthcare with a personal touch and utmost care. Discover premier specialist care in Orthopaedics and Gynaecology in a welcoming environment.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-5  ">
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
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 bg-brand-dark text-white text-[15px] font-semibold px-7 py-3.5 rounded-full hover:bg-teal-600 transition-colors min-h-[44px] w-full sm:w-auto shadow-sm"
              aria-label="Learn about our hospital"
            >
              Our Story
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Feature blocks — icon inline with title, description below */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 mt-[72px]">

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

          </div>
        </div>
      </div>
    </section>
  )
}
