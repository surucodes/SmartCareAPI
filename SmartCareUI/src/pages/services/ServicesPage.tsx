import { motion } from 'motion/react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  PageHero,
  SectionHeading,
  MarketingCTA,
  useScrollTopOnMount,
} from '@/components/marketing/MarketingPrimitives'
import { STAGGER_PARENT, STAGGER_CHILD, CARD_HOVER_SPRING } from '@/utils/motion'

const SERIF = '"Playfair Display", Georgia, serif'
const SANS = 'Inter, sans-serif'

interface Service {
  name: string
  meta: string
  description: string
  icon: React.ReactNode
}

const stroke = { stroke: '#132b1a', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }

const SERVICES: Service[] = [
  {
    name: 'OPD Consultations',
    meta: 'First Floor',
    description: 'Outpatient consultations with our orthopaedic and gynaecology specialists, with minimal waiting times.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M7 4v6a5 5 0 0 0 10 0V4" {...stroke} />
        <path d="M7 4h-1M17 4h1" {...stroke} />
        <path d="M12 20a4 4 0 0 0 8 0v-2" {...stroke} />
        <circle cx="20" cy="15" r="2.2" {...stroke} />
      </svg>
    ),
  },
  {
    name: 'Digital X-Ray',
    meta: 'Ground Floor',
    description: 'On-site digital radiography producing high-clarity images with same-day reporting.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect x="4" y="3" width="18" height="20" rx="2.5" {...stroke} />
        <path d="M13 6v14M9 9c2 1.5 6 1.5 8 0M9 13c2 1.5 6 1.5 8 0M9 17c2 1.5 6 1.5 8 0" {...stroke} />
      </svg>
    ),
  },
  {
    name: 'Ultrasound & Scanning',
    meta: 'First Floor',
    description: 'Obstetric and gynaecological ultrasound scanning performed by experienced hands.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M4 13a9 9 0 0 1 18 0" {...stroke} />
        <path d="M7 13a6 6 0 0 1 12 0M10 13a3 3 0 0 1 6 0" {...stroke} />
        <circle cx="13" cy="20" r="1.4" fill="#C9A227" />
      </svg>
    ),
  },
  {
    name: 'Operation Theatre',
    meta: 'First Floor · C-Arm',
    description: 'A fully-equipped theatre with C-Arm fluoroscopy for orthopaedic and general surgery.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M5 6l11 11M16 6L5 17" {...stroke} />
        <circle cx="20" cy="6" r="2.2" {...stroke} />
        <path d="M14 14l5 5" {...stroke} />
      </svg>
    ),
  },
  {
    name: 'Pathology & Laboratory',
    meta: 'Ground Floor',
    description: 'A full diagnostic laboratory for blood work and testing, with dependable same-day results.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M10 3v7L5 19a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 21 19l-5-9V3" {...stroke} />
        <path d="M8 3h10M8.5 14h9" {...stroke} />
      </svg>
    ),
  },
  {
    name: 'Physiotherapy',
    meta: 'Ground Floor',
    description: 'Guided rehabilitation for mobility, strength and lasting pain relief after injury or surgery.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M3 14h4l2-5 4 11 2-6h5" {...stroke} />
      </svg>
    ),
  },
  {
    name: 'In-House Pharmacy',
    meta: 'Ground Floor · East Wing',
    description: 'A well-stocked dispensary so prescriptions are filled before you leave — no separate trip.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect x="4" y="8" width="13" height="9" rx="4.5" transform="rotate(45 10.5 12.5)" {...stroke} />
        <path d="M9 9l5 5" {...stroke} />
      </svg>
    ),
  },
  {
    name: '24/7 Emergency Support',
    meta: 'Always available',
    description: 'Round-the-clock assistance for urgent care — call us any time and our team will respond.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M13 22S4 16 4 9.5A4.5 4.5 0 0 1 13 8a4.5 4.5 0 0 1 9 1.5C22 16 13 22 13 22z" {...stroke} />
        <path d="M13 9v4M11 11h4" stroke="#C9A227" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
]

interface Step {
  n: string
  title: string
  description: string
}

const JOURNEY: Step[] = [
  { n: '01', title: 'Book', description: 'Reserve a slot online in under a minute, or walk in during OPD hours.' },
  { n: '02', title: 'Consult', description: 'Meet the specialist for an unhurried, thorough consultation.' },
  { n: '03', title: 'Diagnose', description: 'On-site lab and imaging mean faster, coordinated diagnoses.' },
  { n: '04', title: 'Treat & Recover', description: 'Treatment, surgery if needed, and physiotherapy — all in one place.' },
]

export default function ServicesPage() {
  useScrollTopOnMount()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warm-50 pt-20 md:pt-24">
        <PageHero
          eyebrow="Our Services"
          title={<>Comprehensive Healthcare,<br className="hidden md:block" /> Under One Roof</>}
          subtitle="Consultations, diagnostics, surgery, rehabilitation and pharmacy — everything your treatment needs, in a single trusted hospital in Sagara."
          primaryCta={{ label: 'Book an Appointment', to: '/book' }}
          secondaryCta={{ label: 'Explore the Hospital', to: '/hospital-tour' }}
        />

        {/* ── Services grid ──────────────────────────────────────── */}
        <section className="w-full bg-white py-16 md:py-20 px-4 md:px-12">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              eyebrow="What We Offer"
              title="Everything Your Care Requires"
              subtitle="Because our facilities are on-site and connected, your journey stays seamless — no chasing reports across town."
            />

            <motion.div
              variants={STAGGER_PARENT}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {SERVICES.map((s) => (
                <motion.div
                  key={s.name}
                  variants={STAGGER_CHILD}
                  whileHover={{ y: -4 }}
                  transition={CARD_HOVER_SPRING}
                  className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3 hover:shadow-[0_10px_28px_rgba(19,43,26,0.10)] transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-[#111111] leading-snug" style={{ fontFamily: SERIF }}>
                      {s.name}
                    </h3>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#C9A227] mt-0.5" style={{ fontFamily: SANS }}>
                      {s.meta}
                    </p>
                  </div>
                  <p className="text-[14px] text-[#555555] leading-[1.6]" style={{ fontFamily: SANS }}>
                    {s.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Patient journey ────────────────────────────────────── */}
        <section className="w-full bg-warm-50 py-16 md:py-20 px-4 md:px-12">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              eyebrow="How It Works"
              title="A Simple Path to Better Health"
            />
            <motion.div
              variants={STAGGER_PARENT}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {JOURNEY.map((step, i) => (
                <motion.div key={step.n} variants={STAGGER_CHILD} className="relative">
                  <div className="text-[44px] font-bold leading-none text-brand-dark/10" style={{ fontFamily: SERIF }}>
                    {step.n}
                  </div>
                  <h3 className="mt-2 text-[18px] font-bold text-[#111111]" style={{ fontFamily: SERIF }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14px] text-[#555555] leading-[1.6]" style={{ fontFamily: SANS }}>
                    {step.description}
                  </p>
                  {i < JOURNEY.length - 1 && (
                    <div className="hidden lg:block absolute top-6 right-[-12px] text-gray-300" aria-hidden="true">→</div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <MarketingCTA
          title="Ready when you are"
          subtitle="Whether it's a routine check-up or a procedure, our team is here to help you take the next step with confidence."
        />
      </main>
      <Footer />
    </>
  )
}
