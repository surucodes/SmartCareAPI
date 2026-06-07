import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  PageHero,
  SectionHeading,
  MarketingCTA,
  ArrowIcon,
  useScrollTopOnMount,
} from '@/components/marketing/MarketingPrimitives'
import { STAGGER_PARENT, STAGGER_CHILD, CARD_HOVER_SPRING } from '@/utils/motion'
// CLOUD_ASSET: specialty icon images below are large; replace with CDN URLs when available.
import orthoIcon from '@/assets/images/orthoIcon.png'
import gynaeIcon from '@/assets/images/GynaeIcon.png'
import physioIcon from '@/assets/images/physioLogo.png'
import microIcon from '@/assets/images/MicroscopeIcon.png'
import radiologyIcon from '@/assets/images/Radiology icon.jpeg'
import pharmacyIcon from '@/assets/images/pharmacy icon.jpeg'

const SERIF = '"Playfair Display", Georgia, serif'
const SANS = 'Inter, sans-serif'

interface Specialty {
  name: string
  icon: string
  lead: string
  description: string
  doctor?: { name: string; to: string }
  highlights: string[]
}

const SPECIALTIES: Specialty[] = [
  {
    name: 'Orthopaedics',
    icon: orthoIcon,
    lead: 'Bone, joint & trauma care',
    description:
      'Comprehensive management of bone, joint and muscle conditions — from everyday aches to complex fractures and joint replacement.',
    doctor: { name: 'Dr. Prasanna', to: '/doctors/prasanna' },
    highlights: [
      'Fracture & trauma management',
      'Joint replacement surgery',
      'Arthroscopy & sports injuries',
      'Spine & back pain care',
    ],
  },
  {
    name: 'Gynaecology & Obstetrics',
    icon: gynaeIcon,
    lead: "Women's health & maternity",
    description:
      "Compassionate care through every stage of a woman's life, from antenatal care and safe deliveries to routine gynaecological health.",
    doctor: { name: 'Dr. Lakshmi', to: '/doctors/lakshmi' },
    highlights: [
      'Antenatal & postnatal care',
      'Normal & assisted deliveries',
      'Menstrual & hormonal disorders',
      'Gynaecological surgery',
    ],
  },
  {
    name: 'Physiotherapy',
    icon: physioIcon,
    lead: 'Rehabilitation & recovery',
    description:
      'Guided rehabilitation that restores mobility, builds strength and relieves pain — for post-surgical recovery and chronic conditions alike.',
    highlights: [
      'Post-operative rehabilitation',
      'Pain & posture management',
      'Mobility & strength training',
      'Electrotherapy & manual therapy',
    ],
  },
  {
    name: 'Radiology & Imaging',
    icon: radiologyIcon,
    lead: 'Accurate, on-site diagnostics',
    description:
      'In-house digital imaging means faster diagnoses and fewer trips — with same-day reporting you can rely on.',
    highlights: [
      'Digital X-Ray',
      'Ultrasound & obstetric scanning',
      'C-Arm fluoroscopy in surgery',
      'Same-day reporting',
    ],
  },
  {
    name: 'Pathology & Laboratory',
    icon: microIcon,
    lead: 'Full diagnostic testing',
    description:
      'A complete on-site laboratory for blood work and diagnostic testing, with prompt and dependable results.',
    highlights: [
      'Routine & specialised blood tests',
      'Pre-operative screening',
      'Health check-up panels',
      'Same-day results',
    ],
  },
  {
    name: 'Pharmacy',
    icon: pharmacyIcon,
    lead: 'In-house dispensary',
    description:
      'A well-stocked pharmacy within the hospital, so prescriptions are filled before you leave — no separate trip needed.',
    highlights: [
      'All prescriptions stocked',
      'Guidance on safe medication use',
      'Convenient single-visit care',
      'Quality-assured supplies',
    ],
  },
]

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-0.5 shrink-0">
      <circle cx="8" cy="8" r="8" fill="#0F6E56" fillOpacity="0.12" />
      <path d="M5 8.2l2 2 4-4.4" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function SpecialtiesPage() {
  useScrollTopOnMount()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warm-50 pt-20 md:pt-24">
        <PageHero
          eyebrow="Our Specialties"
          title={<>Expert Care Across<br className="hidden md:block" /> Every Specialty</>}
          subtitle="From orthopaedics and maternity to diagnostics and rehabilitation, Spandana Hospital brings together experienced specialists and modern facilities — all under one roof in Sagara."
          primaryCta={{ label: 'Book an Appointment', to: '/book' }}
          secondaryCta={{ label: 'Take a Virtual Tour', to: '/hospital-tour' }}
        />

        {/* ── Specialty detail cards ─────────────────────────────── */}
        <section className="w-full bg-white py-16 md:py-20 px-4 md:px-12">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              eyebrow="Comprehensive Care"
              title="Specialties Under One Roof"
              subtitle="Each specialty is led by experienced clinicians and supported by on-site diagnostics, so your care stays coordinated from consultation to recovery."
            />

            <motion.div
              variants={STAGGER_PARENT}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {SPECIALTIES.map((s) => (
                <motion.article
                  key={s.name}
                  variants={STAGGER_CHILD}
                  whileHover={{ y: -4 }}
                  transition={CARD_HOVER_SPRING}
                  className="group bg-white border border-gray-200 rounded-xl p-7 flex flex-col hover:shadow-[0_10px_28px_rgba(19,43,26,0.10)] transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={s.icon}
                      alt=""
                      aria-hidden="true"
                      className="w-14 h-14 rounded-full object-cover shrink-0 ring-1 ring-gray-100"
                    />
                    <div>
                      <h3 className="text-[19px] font-bold text-[#111111] leading-tight" style={{ fontFamily: SERIF }}>
                        {s.name}
                      </h3>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#C9A227]" style={{ fontFamily: SANS }}>
                        {s.lead}
                      </p>
                    </div>
                  </div>

                  <p className="text-[14.5px] text-[#555555] leading-[1.65] mb-5" style={{ fontFamily: SANS }}>
                    {s.description}
                  </p>

                  <ul className="flex flex-col gap-2.5 mb-5">
                    {s.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-[14px] text-[#333333]" style={{ fontFamily: SANS }}>
                        <CheckIcon />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    {s.doctor ? (
                      <Link
                        to={s.doctor.to}
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0F6E56] hover:text-[#085041] transition-colors"
                      >
                        Meet {s.doctor.name}
                        <ArrowIcon className="transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ) : (
                      <span className="text-[13px] text-gray-400" style={{ fontFamily: SANS }}>
                        Available on-site
                      </span>
                    )}
                    <Link
                      to="/book"
                      className="text-[13px] font-semibold text-[#111111] hover:text-[#0F6E56] transition-colors"
                    >
                      Book →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <MarketingCTA
          title="Not sure which specialist you need?"
          subtitle="Reach out and our team will guide you to the right care. Booking an appointment takes less than a minute."
        />
      </main>
      <Footer />
    </>
  )
}
