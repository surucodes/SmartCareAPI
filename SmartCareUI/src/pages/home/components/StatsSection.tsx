const STATS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" fill="#132b1a" fillOpacity="0.15" stroke="#132b1a" strokeWidth="1.5" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#132b1a" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    value: '25+',
    label: 'Years of Trusted Medical Expertise',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="8" r="3.5" stroke="#132b1a" strokeWidth="1.5" />
        <circle cx="16" cy="8" r="3.5" stroke="#132b1a" strokeWidth="1.5" />
        <path d="M2 20c0-3.3 3.1-6 7-6" stroke="#132b1a" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12.5 14.3C13.5 14.1 14.7 14 16 14c3.9 0 7 2.7 7 6" stroke="#132b1a" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    value: '50,000+',
    label: 'Patients Treated with Care',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3L4 6.5V11c0 4.7 3.4 8.9 8 10 4.6-1.1 8-5.3 8-10V6.5L12 3z"
          fill="#132b1a"
          fillOpacity="0.12"
          stroke="#132b1a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9 12l2 2 4-4" stroke="#132b1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    value: '15+',
    label: 'Specialties Under One Roof',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21C12 21 4 15.5 4 9.5a4 4 0 0 1 8-0.5 4 4 0 0 1 8 0.5C20 15.5 12 21 12 21z"
          fill="#132b1a"
          fillOpacity="0.12"
          stroke="#132b1a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    value: '99%',
    label: 'Patient Satisfaction Rate',
  },
]

export function StatsSection() {
  return (
    <section className="relative z-20 w-full px-4 md:px-12 -mt-12 md:-mt-16 pb-16">
      <div className="max-w-[2000px] mx-auto">
        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(19,43,26,0.10)] border border-gray-200 px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {STATS.map(({ icon, value, label }) => (
              <div
                key={value}
                className="flex flex-col items-center justify-center text-center px-6 py-4 md:py-2 gap-2"
              >
                <div className="mb-1">{icon}</div>
                <span className="text-[32px] font-bold leading-none text-[#C9A227]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {value}
                </span>
                <p className="text-[14px] font-semibold text-[#555555] leading-snug max-w-[180px]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
