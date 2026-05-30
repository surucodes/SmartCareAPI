import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAuth } from '@/context/AuthContext'
import logoImg from '@/assets/images/Logo.png'

export type AdminNav = 'schedule' | 'all' | 'testimonials' | 'settings'

interface AdminSidebarProps {
  selectedNav: AdminNav
  onNavChange: (nav: AdminNav) => void
  onAddAppointment: () => void
  pendingCount: number
}

/* ── Inline SVG icons ──────────────────────────────────────────────── */

const iconClass = 'w-5 h-5 shrink-0'

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
      <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h14M7 3v4M13 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
      <path d="M6 5h11M6 10h11M6 15h11M3 5h.01M3 10h.01M3 15h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
      <path d="M6 4C4 4 3 5.5 3 8c0 2 1 4 3 4l-1 4 4-4c0-3-1-8-3-8zM14 4c-2 0-3 1.5-3 4 0 2 1 4 3 4l-1 4 4-4c0-3-1-8-3-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 1.5v3M10 15.5v3M18.5 10h-3M4.5 10h-3M16 4l-2 2M6 14l-2 2M16 16l-2-2M6 6L4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
      <path d="M12 4h3a1 1 0 011 1v10a1 1 0 01-1 1h-3M9 13l-3-3 3-3M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Component ─────────────────────────────────────────────────────── */

export function AdminSidebar({
  selectedNav,
  onNavChange,
  onAddAppointment,
  pendingCount,
}: AdminSidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  type NavItem = { id: AdminNav; label: string; icon: () => ReactElement }
  const navItems: NavItem[] = [
    { id: 'schedule',     label: "Today's Schedule",   icon: CalendarIcon },
    { id: 'all',          label: 'All Appointments',   icon: ListIcon },
    { id: 'testimonials', label: 'Testimonials',       icon: QuoteIcon },
    { id: 'settings',     label: 'Settings',           icon: GearIcon },
  ]

  return (
    <aside className="hidden md:flex w-[220px] h-full bg-white border-r border-gray-100 flex-col shrink-0">

      {/* Top section */}
      <div className="px-4 pt-5 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="" aria-hidden="true" className="h-8 w-auto object-contain" />
          <div className="min-w-0">
            <h1 className="font-bold text-brand-dark text-sm leading-tight truncate">
              Spandana Hospital
            </h1>
            <p className="text-xs text-gray-400 leading-tight">Admin Dashboard</p>
          </div>
        </div>
        {user?.email && (
          <p className="text-xs text-gray-400 mt-3 truncate" title={user.email}>
            {user.email}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = selectedNav === item.id
          const showBadge = item.id === 'testimonials' && pendingCount > 0

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 pl-3 pr-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                isActive
                  ? 'bg-teal-50 text-teal-800 border-l-2 border-teal-600'
                  : 'text-gray-500 hover:bg-gray-50',
              )}
            >
              <Icon />
              <span className="flex-1 text-left">{item.label}</span>
              {showBadge && (
                <span className="ml-auto bg-amber-100 text-amber-800 text-xs font-semibold rounded-full px-2 py-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom: CTA + logout */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <button
          type="button"
          onClick={onAddAppointment}
          className="w-full inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-800 text-white font-semibold text-sm rounded-lg min-h-[44px] px-3 transition-colors"
        >
          <PlusIcon />
          Add Appointment
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 text-red-700 hover:bg-red-50 text-sm font-medium rounded-lg min-h-[44px] px-3 transition-colors"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </aside>
  )
}
