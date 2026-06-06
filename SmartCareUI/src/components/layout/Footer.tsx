import { Link } from 'react-router-dom'
import logoImg from '@/assets/images/Logo.png'

const QUICK_LINKS = [
  { label: 'Home',         href: '/'           },
  { label: 'Find Doctors', href: '/book'        },
  { label: 'Specialties',  href: '#specialties' },
  { label: 'Services',     href: '#services'    },
]

const ABOUT_LINKS = [
  { label: 'Our Story',      href: '#about' },
  { label: 'Our Team',       href: '#'      },
  { label: 'Careers',        href: '#'      },
  { label: 'News & Updates', href: '#'      },
]

const RESOURCE_LINKS = [
  { label: 'Health Articles', href: '#' },
  { label: 'Patient Guide',   href: '#' },
  { label: 'FAQs',            href: '#' },
  { label: 'Insurance & TPA', href: '#' },
]

function LinkColumn({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h4
        className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#111111] mb-1"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {heading}
      </h4>
      <ul className="flex flex-col gap-3">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="text-[14px] text-[#666666] hover:text-[#0F6E56] hover:underline transition-colors duration-300"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-[#f8f8f8] w-full py-16 px-4 md:px-12" aria-label="Site footer">
      <div className="w-full">

        {/* ── Main grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 mb-12">

          {/* ── Brand column ────────────────────────────────────── */}
          <div className="sm:col-span-2 md:col-span-4 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-300" aria-label="Spandana Hospital home">
              <img
                src={logoImg}
                alt=""
                aria-hidden="true"
                className="h-9 w-auto object-contain"
              />
              <span
                className="text-[20px] font-bold leading-none text-[#111111]"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Spandana Hospital
              </span>
            </Link>

            <p
              className="text-[14px] text-[#666666] leading-relaxed max-w-[260px] mt-1"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              25 years of trusted care for the Malnad community and beyond.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-2">
              {/* Facebook */}
              <a
                href="#"
                aria-label="Spandana Hospital on Facebook"
                className="w-10 h-10 rounded-full border border-gray-300 hover:border-[#0F6E56] hover:bg-[#0F6E56]/10 flex items-center justify-center transition-colors duration-300 group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#666666] group-hover:text-[#0F6E56] transition-colors"
                  />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Spandana Hospital on Instagram"
                className="w-10 h-10 rounded-full border border-gray-300 hover:border-[#0F6E56] hover:bg-[#0F6E56]/10 flex items-center justify-center transition-colors duration-300 group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" className="text-[#666666] group-hover:text-[#0F6E56] transition-colors" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" className="text-[#666666] group-hover:text-[#0F6E56] transition-colors" />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" className="text-[#666666] group-hover:text-[#0F6E56] transition-colors" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="#"
                aria-label="Spandana Hospital on WhatsApp"
                className="w-10 h-10 rounded-full border border-gray-300 hover:border-[#0F6E56] hover:bg-[#0F6E56]/10 flex items-center justify-center transition-colors duration-300 group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#666666] group-hover:text-[#0F6E56] transition-colors"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Quick Links ─────────────────────────────────────── */}
          <div className="md:col-span-2">
            <LinkColumn heading="Quick Links" links={QUICK_LINKS} />
          </div>

          {/* ── About Us ────────────────────────────────────────── */}
          <div className="md:col-span-2">
            <LinkColumn heading="About Us" links={ABOUT_LINKS} />
          </div>

          {/* ── Resources ───────────────────────────────────────── */}
          <div className="md:col-span-2">
            <LinkColumn heading="Resources" links={RESOURCE_LINKS} />
          </div>

          {/* ── Contact Us ──────────────────────────────────────── */}
          <div className="sm:col-span-2 md:col-span-2 flex flex-col gap-3">
            <h4
              className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#111111] mb-1"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Contact Us
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
                  <path d="M9 1C6.2 1 4 3.2 4 6c0 3.8 5 11 5 11s5-7.2 5-11c0-2.8-2.2-5-5-5z" stroke="#0F6E56" strokeWidth="1.4" />
                  <circle cx="9" cy="6" r="1.8" stroke="#0F6E56" strokeWidth="1.3" />
                </svg>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[13px] text-[#666666] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Sagara, Karnataka 577401
                  </span>
                  <a
                    href="https://maps.app.goo.gl/pwiHCVhxsn6aS9L3A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-[#0F6E56] hover:underline transition-colors duration-300 w-fit"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Get Directions →
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
                  <path d="M3 1h3.5l1.5 4-2 1.5a10 10 0 0 0 5.5 5.5L13 10l4 1.5V15a2 2 0 0 1-2 2C6.3 17 1 11.7 1 3a2 2 0 0 1 2-2z" stroke="#0F6E56" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                <a href="tel:+919071880718" className="flex-1 text-[13px] text-[#666666] hover:text-[#0F6E56] hover:underline transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                  +91 90718 80718
                </a>
              </li>

              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
                  <rect x="1" y="3" width="16" height="12" rx="2" stroke="#0F6E56" strokeWidth="1.4" />
                  <path d="M1 5l8 6 8-6" stroke="#0F6E56" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <a href="mailto:spandanahospital@gmail.com" className="flex-1 text-[13px] text-[#666666] hover:text-[#0F6E56] hover:underline transition-colors duration-300 break-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                  spandanahospital@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────── */}
        <div className="pt-8 border-t border-gray-300 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[12px] text-[#888888]" style={{ fontFamily: 'Inter, sans-serif' }}>
            © 2024 Spandana Hospital. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[12px] text-[#888888] hover:text-[#0F6E56] hover:underline transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
              Privacy Policy
            </a>
            <span className="w-px h-3 bg-gray-300" aria-hidden="true" />
            <a href="#" className="text-[12px] text-[#888888] hover:text-[#0F6E56] hover:underline transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
              Terms &amp; Conditions
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
