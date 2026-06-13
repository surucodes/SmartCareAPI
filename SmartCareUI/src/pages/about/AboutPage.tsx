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
import { SECTION_ENTER, STAGGER_PARENT, STAGGER_CHILD, CARD_HOVER_SPRING } from '@/utils/motion'
// CLOUD_ASSET: doctor portraits below are large; replace with CDN URLs when available.
import drPrasanna from '@/assets/images/Dr Prasanna.png'
import drLakshmi from '@/assets/images/Dr.Lakshmi.png'

const SERIF = '"Playfair Display", Georgia, serif'
const SANS = 'Inter, sans-serif'

const STATS = [
  { value: '25+', label: 'Years of trusted care' },
  { value: '1,00,000+', label: 'Patients treated' },
  { value: '10+', label: 'Specialties on-site' },
  { value: '99%', label: 'Patient satisfaction' },
]

interface Value {
  title: string
  description: string
  icon: React.ReactNode
}

const stroke = { stroke: '#0F6E56', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }

const VALUES: Value[] = [
  {
    title: 'Compassion First',
    description: 'Every patient is met with patience, dignity and genuine care — the way we would want our own family treated.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20S4 14.5 4 9a4 4 0 0 1 8-0.5A4 4 0 0 1 20 9c0 5.5-8 11-8 11z" {...stroke} />
      </svg>
    ),
  },
  {
    title: 'Clinical Excellence',
    description: 'Experienced specialists and modern facilities, working together to deliver care you can rely on.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5 7.1 18.2l.9-5.5-4-3.9L9.5 8 12 3z" {...stroke} />
      </svg>
    ),
  },
  {
    title: 'Accessible to All',
    description: 'Quality healthcare close to home for the Malnad community — affordable, approachable and welcoming.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="7" r="3.2" {...stroke} />
        <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" {...stroke} />
      </svg>
    ),
  },
  {
    title: 'Integrity & Trust',
    description: 'Honest advice, transparent care and no unnecessary interventions — the foundation of 25 years of trust.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l8 3v5c0 4.7-3.4 8.9-8 10-4.6-1.1-8-5.3-8-10V6l8-3z" {...stroke} />
        <path d="M9 12l2 2 4-4" {...stroke} />
      </svg>
    ),
  },
]

const FOUNDERS = [
  {
    name: 'Dr. Prasanna',
    role: 'Orthopaedic Surgeon · Co-Founder',
    image: drPrasanna,
    blurb: 'Decades of orthopaedic expertise, from trauma and fracture care to joint replacement surgery.',
    to: '/doctors/prasanna',
  },
  {
    name: 'Dr. Lakshmi',
    role: 'Gynaecologist & Obstetrician · Co-Founder',
    image: drLakshmi,
    blurb: "A trusted name in women's health, guiding families through maternity and beyond.",
    to: '/doctors/lakshmi',
  },
]

export default function AboutPage() {
  useScrollTopOnMount()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warm-50 pt-20 md:pt-24">
        <PageHero
          eyebrow="About Spandana Hospital"
          title={<>25 Years of Trusted<br className="hidden md:block" /> Care in the Malnad</>}
          subtitle="What began as a husband-and-wife practice in Sagara has grown into a multi-specialty hospital — yet our promise has never changed: care guided by empathy and rooted in experience."
        />

        {/* ── Story ──────────────────────────────────────────────── */}
        <section className="w-full bg-white py-16 md:py-20 px-4 md:px-12">
          <div className="max-w-5xl mx-auto grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-14 items-start">
            <motion.div {...SECTION_ENTER}>
              <SectionHeading
                eyebrow="Our Story"
                title="Built on care, grown with the community"
                align="left"
              />
              <div className="space-y-4 text-[15.5px] text-[#555555] leading-[1.75]" style={{ fontFamily: SANS }}>
                <p>
                  Spandana Hospital was founded on a simple belief — that good healthcare should
                  be close to home, and should treat people, not just conditions. For over two
                  decades, families across Sagara and the wider Malnad region have walked through
                  our doors knowing they will be cared for honestly and well.
                </p>
                <p>
                  Today the hospital brings orthopaedics, gynaecology, diagnostics, surgery,
                  physiotherapy and an in-house pharmacy together under one roof — so a patient's
                  entire journey, from consultation to recovery, can happen in one trusted place.
                </p>
                <p>
                  Through every stage of growth, the heart of Spandana has stayed the same: the
                  same hands, the same values, the same community we are proud to serve.
                </p>
              </div>
            </motion.div>

            <motion.aside
              {...SECTION_ENTER}
              className="bg-warm-50 border border-gray-200 rounded-2xl p-7 md:sticky md:top-28"
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mb-3">
                <path d="M7 7h4v4c0 2.2-1.8 4-4 4M13 7h4v4c0 2.2-1.8 4-4 4" stroke="#C9A227" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <p className="text-[18px] md:text-[20px] font-semibold text-[#111111] leading-[1.5]" style={{ fontFamily: SERIF }}>
                Care guided by empathy, rooted in 25+ years of experience.
              </p>
              <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#C9A227]" style={{ fontFamily: SANS }}>
                — The Spandana Promise
              </p>
            </motion.aside>
          </div>
        </section>

        {/* ── Stats band ─────────────────────────────────────────── */}
        <section className="w-full bg-warm-50 px-4 md:px-12 pb-4">
          <motion.div
            variants={STAGGER_PARENT}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="max-w-6xl mx-auto bg-white rounded-2xl shadow-[0_4px_20px_rgba(19,43,26,0.08)] border border-gray-200 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-200"
          >
            {STATS.map((s) => (
              <motion.div key={s.label} variants={STAGGER_CHILD} className="flex flex-col items-center justify-center text-center px-4 py-7 gap-1.5">
                <span className="text-[30px] md:text-[34px] font-bold leading-none text-[#C9A227]" style={{ fontFamily: SANS }}>
                  {s.value}
                </span>
                <p className="text-[13px] font-semibold text-[#555555] leading-snug max-w-[160px]" style={{ fontFamily: SANS }}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Mission & Values ───────────────────────────────────── */}
        <section className="w-full bg-white py-16 md:py-20 px-4 md:px-12">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              eyebrow="What We Stand For"
              title="The Values Behind Our Care"
              subtitle="These principles shape every consultation, every procedure and every conversation at Spandana."
            />
            <motion.div
              variants={STAGGER_PARENT}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {VALUES.map((v) => (
                <motion.div
                  key={v.title}
                  variants={STAGGER_CHILD}
                  whileHover={{ y: -4 }}
                  transition={CARD_HOVER_SPRING}
                  className="bg-white border border-gray-200 rounded-xl p-7 flex flex-col gap-3 hover:shadow-[0_10px_28px_rgba(19,43,26,0.10)] transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
                    {v.icon}
                  </div>
                  <h3 className="text-[17px] font-bold text-[#111111]" style={{ fontFamily: SERIF }}>
                    {v.title}
                  </h3>
                  <p className="text-[14px] text-[#555555] leading-[1.6]" style={{ fontFamily: SANS }}>
                    {v.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Founders ───────────────────────────────────────────── */}
        <section className="w-full bg-warm-50 py-16 md:py-20 px-4 md:px-12">
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              eyebrow="Our Founders"
              title="Meet the Doctors"
              subtitle="Two specialists, one shared commitment to the people of Sagara."
            />
            <motion.div
              variants={STAGGER_PARENT}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {FOUNDERS.map((f) => (
                <motion.div key={f.name} variants={STAGGER_CHILD} whileHover={{ y: -4 }} transition={CARD_HOVER_SPRING}>
                  <Link
                    to={f.to}
                    className="group bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-5 hover:shadow-[0_10px_28px_rgba(19,43,26,0.10)] transition-shadow h-full"
                  >
                    <img
                      src={f.image}
                      alt={`Portrait of ${f.name}`}
                      loading="lazy"
                      decoding="async"
                      className="w-24 h-24 rounded-2xl object-cover object-top shrink-0 ring-1 ring-gray-100"
                    />
                    <div>
                      <h3 className="text-[20px] font-bold text-[#111111] leading-tight" style={{ fontFamily: SERIF }}>
                        {f.name}
                      </h3>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#C9A227] mt-1" style={{ fontFamily: SANS }}>
                        {f.role}
                      </p>
                      <p className="text-[14px] text-[#555555] leading-[1.55] mt-2.5" style={{ fontFamily: SANS }}>
                        {f.blurb}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0F6E56] mt-3 group-hover:text-[#085041] transition-colors">
                        View profile
                        <ArrowIcon className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <MarketingCTA
          title="Experience care that truly cares"
          subtitle="Join the thousands of families across the Malnad who trust Spandana Hospital with their health."
        />
      </main>
      <Footer />
    </>
  )
}
