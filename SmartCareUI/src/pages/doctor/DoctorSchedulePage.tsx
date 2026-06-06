import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { addDays, format } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/utils/cn'
import {
  BACKDROP_FADE,
  CARD_HOVER_SPRING,
  SHEET_SLIDE_UP,
  TAP_SCALE,
} from '@/utils/motion'
import { useAuth } from '@/context/AuthContext'
import { useDoctorSchedule } from '@/hooks/useDoctorSchedule'
import { useDoctorAppointmentActions } from '@/hooks/useDoctorAppointmentActions'
import { doctorsService } from '@/services/doctors.service'
import {
  formatDisplayDate,
  getDayName,
  getTodayIST,
} from '@/utils/date.utils'
import type { Doctor } from '@/types/doctor.types'
import { DoctorSidebar, type DoctorNav } from './components/DoctorSidebar'
import { DoctorTopBar } from './components/DoctorTopBar'
import { WeekStrip } from './components/WeekStrip'
import { StatusFilterPills } from './components/StatusFilterPills'
import { DoctorAppointmentCard } from './components/DoctorAppointmentCard'
import { DoctorDetailPanel } from './components/DoctorDetailPanel'
import { BrandedCalendar } from '@/components/BrandedCalendar'
import logoImg from '@/assets/images/Logo.png'

/* ── Local SVGs (page-only) ────────────────────────────────────────── */

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 22 22" fill="none" className="w-6 h-6" aria-hidden="true">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M12 4h3a1 1 0 011 1v10a1 1 0 01-1 1h-3M9 13l-3-3 3-3M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EmptyCalendarIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true">
      <rect x="8" y="12" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 20h32M16 8v8M32 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function storageKeyFor(email: string | undefined): string | null {
  if (!email) return null
  return 'smartcare:doctorId:' + email
}

function mondayOfYyyymmdd(yyyymmdd: string): Date {
  const [y, m, d] = yyyymmdd.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const monday = new Date(date)
  // getDay(): 0 = Sun, 1 = Mon … 6 = Sat. We want Monday as start.
  const offset = (date.getDay() + 6) % 7
  monday.setDate(date.getDate() - offset)
  return monday
}

function getInitials(name: string): string {
  const cleaned = name.replace(/^Dr\.?\s*/i, '').trim()
  const parts = cleaned.split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? '')
  return (first + last).toUpperCase()
}

/* ── Inline: DoctorSelector ────────────────────────────────────────── */

interface DoctorSelectorProps {
  doctors: Doctor[]
  onSelect: (doctorId: string) => void
}

function DoctorSelector({ doctors, onSelect }: DoctorSelectorProps) {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <img src={logoImg} alt="" aria-hidden="true" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-brand-dark leading-tight">
            Welcome — which doctor are you?
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            One-time setup for this session. Your selection will be remembered until you sign out.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {doctors.map((d) => (
            <motion.button
              key={d.id}
              type="button"
              onClick={() => onSelect(d.id)}
              whileHover={{ y: -4 }}
              whileTap={TAP_SCALE}
              transition={CARD_HOVER_SPRING}
              style={{ transition: 'box-shadow 220ms cubic-bezier(0.32, 0.72, 0, 1), border-color 180ms ease' }}
              className="text-left bg-white border border-gray-100 rounded-xl p-6 hover:border-teal-600 hover:shadow-[0_14px_30px_rgba(19,43,26,0.12)] min-h-[120px] cursor-pointer flex items-center gap-4"
            >
              {d.photoUrl ? (
                <img
                  src={d.photoUrl}
                  alt=""
                  aria-hidden="true"
                  className="w-14 h-14 rounded-full object-cover bg-gray-100 shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base shrink-0">
                  {getInitials(d.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-serif text-lg font-bold text-brand-dark truncate">
                  {d.name}
                </p>
                <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mt-1">
                  {d.specialty}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Inline: DoctorMobileNav (bottom sheet) ────────────────────────── */

interface DoctorMobileNavProps {
  doctor: Doctor
  selectedNav: DoctorNav
  onNavChange: (nav: DoctorNav) => void
  onClose: () => void
}

function DoctorMobileNav({
  doctor,
  selectedNav,
  onNavChange,
  onClose,
}: DoctorMobileNavProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const items: { id: DoctorNav; label: string }[] = [
    { id: 'schedule', label: 'My Schedule' },
    { id: 'today',    label: 'Today' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <motion.div
        role="presentation"
        onClick={onClose}
        variants={BACKDROP_FADE}
        initial="initial"
        animate="animate"
        exit="exit"
        className="absolute inset-0 bg-black/40"
      />
      <motion.div
        variants={SHEET_SLIDE_UP}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative bg-white rounded-t-2xl w-full max-h-[80vh] flex flex-col p-4 shadow-2xl"
        style={{ transformOrigin: 'bottom' }}
      >
        <div className="flex justify-center mb-2">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {doctor.photoUrl ? (
              <img src={doctor.photoUrl} alt="" aria-hidden="true" className="w-10 h-10 rounded-full object-cover bg-gray-100" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                {getInitials(doctor.name)}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-semibold text-sm text-brand-dark truncate">{doctor.name}</h2>
              <p className="text-[10px] font-semibold text-brand-gold uppercase tracking-widest truncate">
                {doctor.specialty}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-brand-dark"
          >
            <XIcon />
          </button>
        </div>

        <nav className="flex flex-col">
          {items.map((it) => {
            const isActive = selectedNav === it.id
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => { onNavChange(it.id); onClose() }}
                className={cn(
                  'text-left px-4 py-3 rounded-lg text-sm font-medium min-h-[44px]',
                  isActive ? 'bg-teal-50 text-teal-800' : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                {it.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 text-red-700 hover:bg-red-50 text-sm font-medium rounded-lg min-h-[44px] transition-colors"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Inline: ScheduleView ──────────────────────────────────────────── */

interface ScheduleViewProps {
  doctor: Doctor
}

function ScheduleView({ doctor }: ScheduleViewProps): ReactElement {
  const schedule = useDoctorSchedule(doctor.id)
  const actions = useDoctorAppointmentActions(schedule.refetch)

  const today = getTodayIST()
  const isTodaySelected = schedule.selectedDate === today

  // Sidebar badge: show today's open count if today is selected;
  // otherwise show 1 if today has any appointments at all (presence indicator).
  const todayCount = useMemo(() => {
    if (isTodaySelected) {
      return schedule.activeAppointments.filter(
        (a) => a.status === 'Pending' || a.status === 'Confirmed',
      ).length
    }
    return schedule.daysWithAppointments.has(today) ? 1 : 0
  }, [
    isTodaySelected,
    schedule.activeAppointments,
    schedule.daysWithAppointments,
    today,
  ])

  const [selectedNav, setSelectedNav] = useState<DoctorNav>('schedule')
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)

  // Close detail panel when changing days — the appointment may not exist
  // in the new day's filtered list.
  useEffect(() => {
    setSelectedAppointmentId(null)
  }, [schedule.selectedDate])

  // Find the currently selected appointment (in either active or past list)
  const selectedAppointment = useMemo(() => {
    if (!selectedAppointmentId) return null
    return (
      schedule.activeAppointments.find((a) => a.id === selectedAppointmentId) ??
      schedule.pastAppointments.find((a) => a.id === selectedAppointmentId) ??
      null
    )
  }, [
    selectedAppointmentId,
    schedule.activeAppointments,
    schedule.pastAppointments,
  ])

  const handleResetToToday = () => {
    schedule.setSelectedDate(today)
    schedule.setCurrentWeekStart(mondayOfYyyymmdd(today))
  }

  // "This Week" button: same as reset — go to today and show this week's strip
  const handleGoToThisWeek = handleResetToToday

  // Called from the calendar (native date picker on month label click):
  // also snaps the week strip to the week containing the picked date.
  const handleSelectDateFromCalendar = (d: string) => {
    schedule.setSelectedDate(d)
    schedule.setCurrentWeekStart(mondayOfYyyymmdd(d))
  }

  // Whether the week strip is currently showing the real current week
  const isCurrentWeek = useMemo(() => {
    const mondayToday = mondayOfYyyymmdd(today)
    const cs = schedule.currentWeekStart
    return (
      cs.getFullYear() === mondayToday.getFullYear() &&
      cs.getMonth() === mondayToday.getMonth() &&
      cs.getDate() === mondayToday.getDate()
    )
  }, [schedule.currentWeekStart, today])

  // Month label for the mobile WeekStrip header (mirrors DoctorTopBar's label)
  const mobileMonthLabel = useMemo(() => {
    const weekEnd = addDays(schedule.currentWeekStart, 6)
    const sm = format(schedule.currentWeekStart, 'MMM yyyy')
    const em = format(weekEnd, 'MMM yyyy')
    return sm === em
      ? sm
      : `${format(schedule.currentWeekStart, 'MMM')}–${format(weekEnd, 'MMM yyyy')}`
  }, [schedule.currentWeekStart])

  const [showMobileCalendar, setShowMobileCalendar] = useState(false)

  const handleNavChange = (nav: DoctorNav) => {
    if (nav === 'today') {
      handleResetToToday()
      setSelectedNav('schedule')
      return
    }
    setSelectedNav(nav)
  }

  const handlePrevWeek = () => {
    schedule.setCurrentWeekStart(addDays(schedule.currentWeekStart, -7))
  }
  const handleNextWeek = () => {
    schedule.setCurrentWeekStart(addDays(schedule.currentWeekStart, +7))
  }
  const handleSelectDate = (d: string) => {
    schedule.setSelectedDate(d)
  }

  /* ── Canvas per nav ─────────────────────────────────────────────── */

  let canvas: ReactElement
  if (selectedNav === 'settings') {
    canvas = (
      <div className="p-10 text-center text-sm text-gray-400">
        Settings coming soon.
      </div>
    )
  } else {
    canvas = (
      <div className="px-4 md:px-6 py-6 max-w-3xl mx-auto w-full">
        {/* Date heading */}
        <div className="flex items-center gap-3 mb-4 flex-wrap pb-4 border-b border-gray-100">
          <h1 className="font-serif text-2xl font-bold text-brand-dark">
            {getDayName(schedule.selectedDate)}, {formatDisplayDate(schedule.selectedDate)}
          </h1>
          <span className="bg-warm-200 text-gray-600 font-semibold text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full">
            {schedule.totalCount} {schedule.totalCount === 1 ? 'appointment' : 'appointments'}
          </span>
        </div>

        {/* Filter pills */}
        <div className="mb-6">
          <StatusFilterPills
            value={schedule.selectedFilter}
            onChange={schedule.setSelectedFilter}
          />
        </div>

        {/* Cards */}
        {schedule.isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-40 max-w-2xl mx-auto" />
            ))}
          </div>
        ) : schedule.isError ? (
          <div className="text-center py-12 text-sm text-gray-500">
            Failed to load your schedule. Please refresh.
          </div>
        ) : schedule.totalCount === 0 ? (
          <div className="text-center py-12">
            <EmptyCalendarIcon />
            <p className="text-sm text-gray-400">No appointments for this day.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {schedule.activeAppointments.map((a) => (
              <DoctorAppointmentCard
                key={a.id}
                appointment={a}
                actions={actions}
                onCardClick={() => setSelectedAppointmentId(a.id)}
                selected={selectedAppointmentId === a.id}
              />
            ))}
            {schedule.selectedFilter === 'all' && schedule.pastAppointments.length > 0 && (
              <>
                <div className="my-2 text-xs font-semibold tracking-widest text-gray-400 uppercase border-t border-gray-100 pt-4 max-w-2xl mx-auto w-full">
                  Past &amp; Closed
                </div>
                {schedule.pastAppointments.map((a) => (
                  <DoctorAppointmentCard
                    key={a.id}
                    appointment={a}
                    actions={actions}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-warm-50">

      {/* Sidebar (desktop) */}
      <DoctorSidebar
        doctor={doctor}
        selectedNav={selectedNav}
        onNavChange={handleNavChange}
        todayCount={todayCount}
      />

      {/* Main column */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div className="md:hidden bg-white sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={() => setShowMobileNav(true)}
            aria-label="Open menu"
            className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-brand-dark"
          >
            <HamburgerIcon />
          </button>
          <p className="font-semibold text-sm text-brand-dark truncate mx-2">
            {doctor.name}
          </p>
          {/* Today + This Week — shown when not on today / not on this week */}
          <div className="flex items-center gap-1 shrink-0">
            {!isTodaySelected && (
              <button
                type="button"
                onClick={handleResetToToday}
                className="px-2 py-1 rounded-full border border-teal-600 text-teal-700 text-xs font-semibold min-h-[44px]"
              >
                Today
              </button>
            )}
            {!isCurrentWeek && (
              <button
                type="button"
                onClick={handleGoToThisWeek}
                className="px-2 py-1 rounded-full border border-teal-600 text-teal-700 text-xs font-semibold min-h-[44px]"
              >
                This Week
              </button>
            )}
            {/* Placeholder keeps layout balanced when both buttons are hidden */}
            {isTodaySelected && isCurrentWeek && <span className="w-11 h-11" />}
          </div>
        </div>

        {/* Mobile WeekStrip — sticky below top bar */}
        <div className="md:hidden bg-warm-50 sticky top-14 z-30 border-b border-gray-100 px-3 pt-2 pb-3 shrink-0">
          {/* Month label — opens branded calendar bottom sheet */}
          <button
            type="button"
            onClick={() => setShowMobileCalendar(true)}
            aria-label={`${mobileMonthLabel} — tap to open date picker`}
            className="text-sm font-semibold text-brand-dark hover:text-teal-700 transition-colors flex items-center gap-1 min-h-[32px] px-1 mb-2"
          >
            {mobileMonthLabel}
            <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 text-gray-400 shrink-0" aria-hidden="true">
              <rect x="1" y="3" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M1 6h14M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
          <WeekStrip
            currentWeekStart={schedule.currentWeekStart}
            selectedDate={schedule.selectedDate}
            daysWithAppointments={schedule.daysWithAppointments}
            onSelectDate={handleSelectDate}
          />
        </div>

        {/* Desktop top bar */}
        <DoctorTopBar
          currentWeekStart={schedule.currentWeekStart}
          selectedDate={schedule.selectedDate}
          daysWithAppointments={schedule.daysWithAppointments}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onSelectDate={handleSelectDate}
          onResetToToday={handleResetToToday}
          onGoToThisWeek={handleGoToThisWeek}
          onSelectDateFromCalendar={handleSelectDateFromCalendar}
        />

        {/* Canvas — only this scrolls */}
        <div className="flex-1 overflow-y-auto">
          {canvas}
        </div>
      </main>

      {/* Mobile nav bottom sheet */}
      <AnimatePresence>
        {showMobileNav && (
          <DoctorMobileNav
            key="doctor-mobile-nav"
            doctor={doctor}
            selectedNav={selectedNav}
            onNavChange={handleNavChange}
            onClose={() => setShowMobileNav(false)}
          />
        )}
      </AnimatePresence>

      {/* Appointment detail panel */}
      {selectedAppointment && (
        <DoctorDetailPanel
          appointment={selectedAppointment}
          actions={actions}
          onClose={() => setSelectedAppointmentId(null)}
        />
      )}

      {/* Mobile calendar — branded bottom sheet (md:hidden) */}
      <AnimatePresence>
        {showMobileCalendar && (
          <div className="fixed inset-0 z-50 flex items-end md:hidden">
            <motion.div
              role="presentation"
              onClick={() => setShowMobileCalendar(false)}
              variants={BACKDROP_FADE}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 bg-black/40"
            />
            <motion.div
              variants={SHEET_SLIDE_UP}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full"
              style={{ transformOrigin: 'bottom' }}
              onClick={(e) => e.stopPropagation()}
            >
              <BrandedCalendar
                selectedDate={schedule.selectedDate}
                daysWithAppointments={schedule.daysWithAppointments}
                onSelect={(d) => {
                  handleSelectDateFromCalendar(d)
                  setShowMobileCalendar(false)
                }}
                onClose={() => setShowMobileCalendar(false)}
                mobile
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Page (handles identity resolution) ────────────────────────────── */

export default function DoctorSchedulePage() {
  const { user } = useAuth()
  const storageKey = storageKeyFor(user?.email)

  // Initial doctorId from sessionStorage (if any)
  const [doctorId, setDoctorId] = useState<string | null>(() => {
    if (!storageKey) return null
    try {
      return sessionStorage.getItem(storageKey)
    } catch {
      return null
    }
  })

  const doctorsQuery = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: doctorsService.getAll,
    staleTime: Infinity,
  })

  // Auto-select if exactly one doctor exists
  useEffect(() => {
    if (doctorId) return
    const list = doctorsQuery.data
    if (!list) return
    if (list.length === 1 && storageKey) {
      try { sessionStorage.setItem(storageKey, list[0].id) } catch { /* ignore */ }
      setDoctorId(list[0].id)
    }
  }, [doctorId, doctorsQuery.data, storageKey])

  const handleSelectDoctor = (id: string) => {
    if (storageKey) {
      try { sessionStorage.setItem(storageKey, id) } catch { /* ignore */ }
    }
    setDoctorId(id)
  }

  /* ── State branches ───────────────────────────────────────────── */

  if (doctorsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  if (doctorsQuery.isError) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-brand-dark">Failed to load doctor list.</p>
        <p className="text-sm text-gray-500 mt-2">Please refresh the page to try again.</p>
      </div>
    )
  }

  const doctors = doctorsQuery.data ?? []
  const storedDoctorIsValid =
    doctorId !== null && doctors.some((d) => d.id === doctorId)

  if (!storedDoctorIsValid) {
    return <DoctorSelector doctors={doctors} onSelect={handleSelectDoctor} />
  }

  const doctor = doctors.find((d) => d.id === doctorId)
  if (!doctor) {
    return <DoctorSelector doctors={doctors} onSelect={handleSelectDoctor} />
  }

  return <ScheduleView doctor={doctor} />
}
