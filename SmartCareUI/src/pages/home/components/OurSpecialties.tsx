import orthoIcon    from '@/assets/images/orthoIcon.png'
import gynaeIcon    from '@/assets/images/GynaeIcon.png'
import physioIcon   from '@/assets/images/physioLogo.png'
import microIcon    from '@/assets/images/MicroscopeIcon.png'

type Specialty = {
  label: string
  icon: { type: 'img'; src: string; alt: string } | { type: 'svg'; el: React.ReactNode }
  href: string
}

const SPECIALTIES: Specialty[] = [
  {
    label: 'Orthopaedics',
    icon: { type: 'img', src: orthoIcon, alt: 'Orthopaedics icon' },
    href: '#',
  },
  {
    label: 'Gynaecology',
    icon: { type: 'img', src: gynaeIcon, alt: 'Gynaecology icon' },
    href: '#',
  },
  {
    label: 'Pediatrics',
    icon: {
      type: 'svg',
      el: (
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="9" r="4.5" stroke="#132b1a" strokeWidth="1.6" />
          <path d="M7 28c0-5 4-9 9-9s9 4 9 9" stroke="#132b1a" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16 18v-3M13 17l1.5 1M19 17l-1.5 1" stroke="#132b1a" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="23" cy="13" r="2.5" stroke="#C9A227" strokeWidth="1.4" />
          <path d="M23 11.5v3M21.5 13h3" stroke="#C9A227" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    href: '#',
  },
  {
    label: 'General Medicine',
    icon: {
      type: 'svg',
      el: (
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M6 12a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v4a10 10 0 0 1-20 0v-4z"
            stroke="#132b1a"
            strokeWidth="1.6"
          />
          <path d="M16 13v6M13 16h6" stroke="#132b1a" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M11 7V5M21 7V5" stroke="#132b1a" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 26v2" stroke="#132b1a" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="29" r="1.2" fill="#C9A227" />
        </svg>
      ),
    },
    href: '#',
  },
  {
    label: 'Physiotherapy',
    icon: { type: 'img', src: physioIcon, alt: 'Physiotherapy icon' },
    href: '#',
  },
  {
    label: 'Pathology',
    icon: { type: 'img', src: microIcon, alt: 'Pathology icon' },
    href: '#',
  },
]

export function OurSpecialties() {
  return (
    <section className="w-full bg-white py-16 px-4 md:px-12 overflow-hidden">
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

          <a
            href="#"
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
          </a>
        </div>

        {/* ── Specialties grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {SPECIALTIES.map(({ label, icon, href }) => (
            <a
              key={label}
              href={href}
              className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group"
            >
              {icon.type === 'img' ? (
                <img
                  src={icon.src}
                  alt={icon.alt}
                  className="w-16 h-16 rounded-full object-cover group-hover:scale-105 transition-transform shrink-0"
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
            </a>
          ))}
        </div>

      </div>
    </section>
  )
}
