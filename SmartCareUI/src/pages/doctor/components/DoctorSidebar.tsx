import { useEffect, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAuth } from '@/context/AuthContext'
import type { Doctor } from '@/types/doctor.types'
import logoImg from '@/assets/images/Logo.png'

export type DoctorNav = 'schedule' | 'today' | 'settings'

interface DoctorSidebarProps {
  doctor: Doctor
  selectedNav: DoctorNav
  onNavChange: (nav: DoctorNav) => void
  todayCount: number
}

const iconClass = 'w-5 h-5 shrink-0'

function CalendarMonthIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
      <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h14M7 3v4M13 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="13" r="0.8" fill="currentColor" />
      <circle cx="10" cy="13" r="0.8" fill="currentColor" />
      <circle cx="13" cy="13" r="0.8" fill="currentColor" />
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

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
      <path d="M12 4h3a1 1 0 011 1v10a1 1 0 01-1 1h-3M9 13l-3-3 3-3M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function getInitials(name: string): string {
  const cleaned = name.replace(/^Dr\.?\s*/i, '').trim()
  const parts = cleaned.split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] ?? '')
  return (first + last).toUpperCase()
}

export function DoctorSidebar({
  doctor,
  selectedNav,
  onNavChange,
  todayCount,
}: DoctorSidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [hasImgError, setHasImgError] = useState(false)

  useEffect(() => {
    console.log('[DoctorSidebar] doctor.photoUrl:', doctor?.photoUrl)
  }, [doctor?.photoUrl])

  // Reset error state when doctor switches (e.g., re-selecting a different doctor)
  useEffect(() => {
    setHasImgError(false)
  }, [doctor?.id])

  const showPhoto =
    !!doctor?.photoUrl &&
    doctor.photoUrl.trim() !== '' &&
    !hasImgError

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  type NavItem = { id: DoctorNav; label: string; icon: () => ReactElement; badge?: number }
  const navItems: NavItem[] = [
    { id: 'schedule', label: 'My Schedule', icon: CalendarMonthIcon, badge: todayCount > 0 ? todayCount : undefined },
    { id: 'settings', label: 'Settings',    icon: GearIcon },
  ]

  return (
    <aside className="hidden md:flex w-[220px] h-full bg-white border-r border-gray-100 flex-col shrink-0">

      {/* Logo + portal label */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="" aria-hidden="true" className="h-8 w-auto object-contain" />
          <div className="min-w-0">
            <h1 className="font-bold text-brand-dark text-sm leading-tight truncate">
              Spandana Hospital
            </h1>
            <p className="text-xs text-gray-400 leading-tight">Doctor Portal</p>
          </div>
        </div>
      </div>

      {/* Doctor profile segment */}
      <div className="px-4 py-4 border-b border-gray-100 mb-3 flex items-center gap-3">
        {showPhoto ? (
          <img
            src={doctor.photoUrl}
            alt={doctor.name}
            className="w-12 h-12 rounded-full object-cover bg-gray-100 shrink-0"
            onError={() => setHasImgError(true)}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
            {getInitials(doctor?.name ?? '')}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-semibold text-sm text-brand-dark truncate">{doctor.name}</h2>
          <p className="text-[10px] font-semibold text-brand-gold uppercase tracking-widest mt-0.5">
            {doctor.specialty}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = selectedNav === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 pl-3 pr-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                isActive
                  ? 'bg-teal-50 text-teal-800 border-l-2 border-teal-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50',
              )}
            >
              <Icon />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Logout (no Add Appointment) */}
      <div className="p-4 border-t border-gray-100">
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
