import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/utils/cn'
import logoImg from '@/assets/images/Logo.png'

const NAV_LINKS = [
  { label: 'Home',           href: '/'              },
  { label: 'Find Doctors',   href: '/book'          },
  { label: 'My Appointment', href: '/my-appointment' },
  { label: 'Specialties',    href: '/specialties'   },
  { label: 'Services',       href: '/services'      },
  { label: 'About Us',       href: '/about'         },
] as const

export function Header() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname }                = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white shadow-sm' : 'bg-transparent',
      )}
    >
      {/* ── Main bar ──────────────────────────────────────────── */}
      {/*
        w-full + px padding → spans the full viewport.
        justify-between → logo hard-left, nav centred, CTA hard-right.
      */}
      <div className="w-full px-4 md:px-12 flex items-center justify-between h-14 md:h-16">

        {/* ── Slot 1: Logo (left) ──────────────────────────────── */}
        <Link
          to="/"
          className="flex items-center gap-3 min-h-[44px] shrink-0 whitespace-nowrap"
          aria-label="Spandana Hospital home"
        >
          <img
            src={logoImg}
            alt=""
            aria-hidden="true"
            className="h-16 w-auto object-contain"
          />
          <span className={cn(
            'font-bold text-[22px] leading-none tracking-tight transition-colors duration-300',
            scrolled ? 'text-[#111111]' : 'text-white md:text-[#111111]'
          )}>
            Spandana Hospital
          </span>
        </Link>

        {/* ── Slot 2: Desktop nav (centre) ────────────────────── */}
        <nav
          className="hidden md:flex items-center gap-8 h-full"
          role="navigation"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = href === '/' ? pathname === '/' : pathname === href
            const isInternalRoute = href.startsWith('/')
            const linkClass = 'flex items-center h-full text-[15px] font-medium transition-colors'
            // Underline sits directly under the text via border-b on the
            // <span>. pb-1 creates 4 px of gap between baseline and line.
            // This keeps the indicator close to the text, not at the very
            // bottom of the 64 px header bar.
            const labelSpan = (
              <span
                className={cn(
                  'pb-1 transition-colors',
                  isActive
                    ? 'text-[#C9A227] border-b-2 border-[#C9A227]'
                    : 'text-[#333333] hover:text-[#0F6E56]',
                )}
              >
                {label}
              </span>
            )
            return isInternalRoute ? (
              <Link key={label} to={href} className={linkClass}>
                {labelSpan}
              </Link>
            ) : (
              <a key={label} href={href} className={linkClass}>
                {labelSpan}
              </a>
            )
          })}
        </nav>

        {/* ── Slot 3: CTA (hard right) ────────────────────────── */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Link
            to="/login"
            className={cn(
              'text-[15px] font-semibold px-5 py-2 rounded-full min-h-[44px] flex items-center border transition-colors',
              scrolled
                ? 'border-teal-600 text-teal-600 hover:bg-teal-50'
                : 'border-white/70 text-white hover:bg-white/10',
            )}
          >
            Staff Login
          </Link>
          <Link
            to="/book"
            className="inline-flex items-center gap-1.5 bg-brand-dark text-white text-[15px] font-semibold px-6 py-2.5 rounded-full min-h-[44px] hover:bg-teal-600 transition-colors shadow-sm"
            aria-label="Book an appointment"
          >
            Book Now
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2 7h10M8 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* ── Mobile hamburger ────────────────────────────────── */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] text-[#111111]"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            key="mobile-drawer"
            id="mobile-nav"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{
              type: 'tween',
              ease: [0.32, 0.72, 0, 1],
              duration: 0.22,
            }}
            style={{ transformOrigin: 'top center' }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
          >
            <nav
              role="navigation"
              aria-label="Mobile navigation"
              className="px-4 py-2"
            >
              {NAV_LINKS.map(({ label, href }) => {
                const isInternalRoute = href.startsWith('/')
                const drawerLinkClass =
                  'flex items-center min-h-[44px] text-[15px] font-medium text-[#333333] hover:text-[#0F6E56] border-b border-gray-50 last:border-0'
                const closeDrawer = () => setMobileOpen(false)
                return isInternalRoute ? (
                  <Link key={label} to={href} className={drawerLinkClass} onClick={closeDrawer}>
                    {label}
                  </Link>
                ) : (
                  <a key={label} href={href} className={drawerLinkClass} onClick={closeDrawer}>
                    {label}
                  </a>
                )
              })}
              <div className="border-t border-gray-100 my-2" />
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center min-h-[44px] text-[15px] font-medium text-gray-500 hover:text-[#0F6E56]"
              >
                Staff Login
              </Link>
              <Link
                to="/book"
                className="flex items-center justify-center gap-1.5 bg-brand-dark text-white text-[15px] font-semibold px-5 rounded-full my-3 min-h-[44px] hover:bg-teal-600 transition-colors"
                onClick={() => setMobileOpen(false)}
                aria-label="Book an appointment"
              >
                Book Now
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
