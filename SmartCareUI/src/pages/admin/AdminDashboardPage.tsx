import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addDays, format } from 'date-fns'
import { isAxiosError } from 'axios'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/utils/cn'
import {
  BACKDROP_FADE,
  BANNER_SLIDE,
  CANVAS_SWAP,
  SHEET_SLIDE_UP,
  TAP_SCALE,
} from '@/utils/motion'
import { useAuth } from '@/context/AuthContext'
import { useAdminAppointments } from '@/hooks/useAdminAppointments'
import { useAppointmentActions } from '@/hooks/useAppointmentActions'
import { useTestimonialsAdmin } from '@/hooks/useTestimonialsAdmin'
import { appointmentsService } from '@/services/appointments.service'
import {
  formatDisplayDate,
  formatDisplayTime,
  getTodayIST,
} from '@/utils/date.utils'
import type { Appointment } from '@/types/appointment.types'
import type { Doctor } from '@/types/doctor.types'
import { AdminSidebar, type AdminNav } from './components/AdminSidebar'
import { AdminTopBar } from './components/AdminTopBar'
import { DoctorColumn } from './components/DoctorColumn'
import { AppointmentDetailPanel } from './components/AppointmentDetailPanel'
import { WalkInBookingModal } from './components/WalkInBookingModal'
import { SearchOverlay } from './components/SearchOverlay'
import { TestimonialsView } from './components/TestimonialsView'
import { MobileTabBar } from './components/MobileTabBar'
import logoImg from '@/assets/images/Logo.png'

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7" aria-hidden="true">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M18 18l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/* ── Date helpers ──────────────────────────────────────────────────── */

function shiftDay(yyyymmdd: string, delta: number): string {
  const [y, m, d] = yyyymmdd.split('-').map(Number)
  const next = addDays(new Date(y, m - 1, d), delta)
  return format(next, 'yyyy-MM-dd')
}

/* ── All appointments table ────────────────────────────────────────── */

const STATUS_BADGE: Record<string, string> = {
  Pending:   'bg-amber-100 text-amber-800',
  Confirmed: 'bg-teal-100 text-teal-800',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-gray-100 text-gray-400',
  NoShow:    'bg-red-50 text-red-600',
}

function AllAppointmentsView({
  doctors,
  data,
  isLoading,
  isError,
}: {
  doctors: Doctor[]
  data: Appointment[]
  isLoading: boolean
  isError: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return data
    const numeric = q.replace(/\D/g, '')
    return data.filter((a) => {
      if (a.patientName.toLowerCase().includes(q)) return true
      if (numeric.length > 0 && a.patientPhone.replace(/\s/g, '').includes(numeric)) return true
      const doctor = doctors.find((d) => d.id === a.doctorId)
      if (doctor?.name.toLowerCase().includes(q)) return true
      return false
    })
  }, [data, searchQuery, doctors])

  if (isLoading) {
    return (
      <div className="p-6 space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-10 rounded" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg m-6">
        Failed to load appointments.
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <h1 className="font-serif text-2xl font-bold text-brand-dark">All Appointments</h1>
        <div className="relative sm:ml-auto w-full sm:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
              <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13.5 13.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or doctor"
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 bg-white text-sm text-brand-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-brand-dark"
            >
              <XIcon />
            </button>
          )}
        </div>
      </div>
      {searchQuery.trim() && (
        <p className="text-xs text-gray-400 mb-3">
          {filtered.length === 0
            ? `No appointments matching "${searchQuery.trim()}"`
            : `Showing ${filtered.length} of ${data.length} appointment${data.length !== 1 ? 's' : ''}`}
        </p>
      )}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-warm-100 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Patient</th>
              <th className="px-4 py-3 text-left">Doctor</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const doctor = doctors.find((d) => d.id === a.doctorId)
              const badgeClass = STATUS_BADGE[a.status] ?? 'bg-gray-100 text-gray-500'
              return (
                <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 text-gray-700">{formatDisplayDate(a.date)}</td>
                  <td className="px-4 py-2.5 text-gray-700">{formatDisplayTime(a.slot)}</td>
                  <td className="px-4 py-2.5 font-medium text-brand-dark">{a.patientName}</td>
                  <td className="px-4 py-2.5">
                    {doctor ? (
                      <span className="text-gray-700">{doctor.name}</span>
                    ) : (
                      <span className="text-gray-400 italic">Unknown</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', badgeClass)}>
                      {a.status === 'NoShow' ? 'No Show' : a.status}
                    </span>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && !searchQuery.trim() && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No appointments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Mobile bottom-sheet navigation ────────────────────────────────── */

interface MobileNavSheetProps {
  selectedNav: AdminNav
  onNavChange: (nav: AdminNav) => void
  onAddAppointment: () => void
  onClose: () => void
  pendingCount: number
}

function MobileNavSheet({
  selectedNav,
  onNavChange,
  onAddAppointment,
  onClose,
  pendingCount,
}: MobileNavSheetProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const items: { id: AdminNav; label: string }[] = [
    { id: 'schedule',     label: "Today's Schedule" },
    { id: 'all',          label: 'All Appointments' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'settings',     label: 'Settings' },
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
          <div className="flex items-center gap-2 min-w-0">
            <img src={logoImg} alt="" aria-hidden="true" className="h-8 w-auto" />
            <div className="min-w-0">
              <h2 className="font-bold text-sm text-brand-dark truncate">Spandana Hospital</h2>
              {user?.email && <p className="text-xs text-gray-400 truncate">{user.email}</p>}
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
            const showBadge = it.id === 'testimonials' && pendingCount > 0
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => {
                  onNavChange(it.id)
                  onClose()
                }}
                className={cn(
                  'text-left px-4 py-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center justify-between',
                  isActive ? 'bg-teal-50 text-teal-800' : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                {it.label}
                {showBadge && (
                  <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {pendingCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => {
              onAddAppointment()
              onClose()
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-800 text-white font-semibold text-sm rounded-lg min-h-[44px] transition-colors"
          >
            <PlusIcon />
            Add Appointment
          </button>
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

/* ── Page ──────────────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayIST())

  const queryClient = useQueryClient()

  const { doctors, appointmentsByDoctorId, daysWithAppointments, isLoading, isError, refetch } =
    useAdminAppointments(selectedDate)

  // Full dataset — used by SearchOverlay and AllAppointmentsView so both always
  // search across all dates, not just the currently selected day.
  const {
    data: allAppointmentsData = [],
    isLoading: allLoading,
    isError: allError,
  } = useQuery({
    queryKey: ['admin-appointments-all'],
    queryFn: () => appointmentsService.getAll(true),
  })

  // Invalidate both the date-filtered schedule query and the full-dataset query
  // so that any mutation (status change, walk-in, reschedule) is reflected in both views.
  const handleRefetch = useCallback(() => {
    refetch()
    queryClient.invalidateQueries({ queryKey: ['admin-appointments-all'] })
  }, [refetch, queryClient])

  const actions = useAppointmentActions(handleRefetch)
  const { pendingCount } = useTestimonialsAdmin()

  const [selectedNav, setSelectedNav] = useState<AdminNav>('schedule')
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [showWalkInModal, setShowWalkInModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [activeTabDoctorId, setActiveTabDoctorId] = useState<string>('')
  const [processedCount, setProcessedCount] = useState<number | null>(null)
  const [walkInBanner, setWalkInBanner] = useState<string | null>(null)

  /* ── Date navigation handlers ────────────────────────────────────── */
  const goPrev   = () => setSelectedDate((d) => shiftDay(d, -1))
  const goNext   = () => setSelectedDate((d) => shiftDay(d, +1))
  const resetToday = () => setSelectedDate(getTodayIST())

  // Initialize active mobile tab to first doctor once doctors load
  useEffect(() => {
    if (!activeTabDoctorId && doctors.length > 0) {
      setActiveTabDoctorId(doctors[0].id)
    }
  }, [doctors, activeTabDoctorId])

  // Auto-dismiss walk-in success banner
  useEffect(() => {
    if (!walkInBanner) return
    const t = setTimeout(() => setWalkInBanner(null), 4000)
    return () => clearTimeout(t)
  }, [walkInBanner])

  // Close detail panel when changing days (the appointment may not exist
  // in the new day's filtered list)
  useEffect(() => {
    setSelectedAppointmentId(null)
    setCancellingId(null)
  }, [selectedDate])

  // Derive selectedAppointment from the full dataset so that an appointment found
  // via global search (which may be on a different date than selectedDate) can still
  // open the detail panel without requiring a date navigation.
  const selectedAppointment: Appointment | null = useMemo(() => {
    if (!selectedAppointmentId) return null
    return allAppointmentsData.find((a) => a.id === selectedAppointmentId) ?? null
  }, [selectedAppointmentId, allAppointmentsData])

  // When data refetches, re-sync cancellingId using the full dataset so cancel
  // state is correctly tracked even for appointments not on the current date.
  useEffect(() => {
    if (!cancellingId) return
    const appt = allAppointmentsData.find((a) => a.id === cancellingId)
    if (!appt) {
      setCancellingId(null)
      setSelectedAppointmentId(null)
    } else if (appt.status === 'Cancelled') {
      setCancellingId(null)
    }
  }, [allAppointmentsData, cancellingId])

  /* ── Mark expired mutation (manual trigger) ──────────────────────── */
  const markExpiredMutation = useMutation({
    mutationFn: () => appointmentsService.processExpired(),
    onSuccess: (data) => {
      setProcessedCount(data.processed)
      refetch()
    },
    onError: (err) => {
      const msg = isAxiosError(err) ? err.message : 'Failed to process expired'
      console.error('processExpired failed:', msg)
      setProcessedCount(0)
    },
  })

  /* ── Card / detail handlers ──────────────────────────────────────── */

  const handleCardClick = (appt: Appointment) => setSelectedAppointmentId(appt.id)
  const handleStartCancel = (id: string) => {
    setSelectedAppointmentId(id)
    setCancellingId(id)
  }
  const handleAbortCancel = () => setCancellingId(null)
  const handleCloseDetail = () => {
    setSelectedAppointmentId(null)
    setCancellingId(null)
  }
  const handleSelectFromSearch = (appt: Appointment) =>
    setSelectedAppointmentId(appt.id)

  /* ── Error state ─────────────────────────────────────────────────── */

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-warm-50 p-6 text-center">
        <p className="text-lg font-semibold text-brand-dark">Failed to load dashboard data.</p>
        <p className="text-sm text-gray-500 mt-2">Please refresh the page to try again.</p>
      </div>
    )
  }

  /* ── Main content per nav ────────────────────────────────────────── */

  let mainContent: ReactElement

  if (selectedNav === 'all') {
    mainContent = (
      <div className="flex-1 overflow-y-auto">
        <AllAppointmentsView
          doctors={doctors}
          data={allAppointmentsData}
          isLoading={allLoading}
          isError={allError}
        />
      </div>
    )
  } else if (selectedNav === 'testimonials') {
    mainContent = (
      <div className="flex-1 overflow-y-auto">
        <TestimonialsView />
      </div>
    )
  } else if (selectedNav === 'settings') {
    mainContent = (
      <div className="flex-1 overflow-y-auto">
        <div className="p-10 text-center text-sm text-gray-400">
          Settings coming soon.
        </div>
      </div>
    )
  } else {
    // schedule — only the canvas scrolls; top bar + sidebar stay fixed
    mainContent = (
      <div className="flex-1 overflow-y-auto">
        {/* Desktop: two columns */}
        <div className="hidden md:grid grid-cols-2 gap-6 p-6">
          {doctors.map((d) => (
            <DoctorColumn
              key={d.id}
              doctor={d}
              appointments={appointmentsByDoctorId[d.id] ?? []}
              isLoading={isLoading}
              selectedAppointmentId={selectedAppointmentId}
              onCardClick={handleCardClick}
              onConfirm={actions.confirm}
              onComplete={actions.complete}
              onMarkNoShow={actions.markNoShow}
              onCancel={handleStartCancel}
              onCheckIn={actions.checkIn}
            />
          ))}
        </div>
        {/* Mobile: single column for active tab */}
        <div className="md:hidden p-4">
          {activeTabDoctorId &&
            (() => {
              const d = doctors.find((x) => x.id === activeTabDoctorId)
              if (!d) return null
              return (
                <DoctorColumn
                  doctor={d}
                  appointments={appointmentsByDoctorId[d.id] ?? []}
                  isLoading={isLoading}
                  selectedAppointmentId={selectedAppointmentId}
                  onCardClick={handleCardClick}
                  onConfirm={actions.confirm}
                  onComplete={actions.complete}
                  onMarkNoShow={actions.markNoShow}
                  onCancel={handleStartCancel}
                  onCheckIn={actions.checkIn}
                />
              )
            })()}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-warm-50">

      {/* Sidebar (desktop) — own height, does NOT scroll with content */}
      <AdminSidebar
        selectedNav={selectedNav}
        onNavChange={setSelectedNav}
        onAddAppointment={() => setShowWalkInModal(true)}
        pendingCount={pendingCount}
      />

      {/* Main column */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar + tabs */}
        {selectedNav === 'schedule' && (
          <MobileTabBar
            doctors={doctors}
            appointmentsByDoctorId={appointmentsByDoctorId}
            daysWithAppointments={daysWithAppointments}
            activeTabDoctorId={activeTabDoctorId}
            onTabChange={setActiveTabDoctorId}
            onHamburgerClick={() => setShowMobileNav(true)}
            onSearchClick={() => setShowSearch(true)}
            selectedDate={selectedDate}
            onPrevDay={goPrev}
            onNextDay={goNext}
            onResetToToday={resetToday}
            onSelectDate={setSelectedDate}
          />
        )}
        {selectedNav !== 'schedule' && (
          <div className="md:hidden bg-white h-14 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
            <button
              type="button"
              onClick={() => setShowMobileNav(true)}
              aria-label="Open menu"
              className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-brand-dark"
            >
              <svg viewBox="0 0 22 22" fill="none" className="w-6 h-6" aria-hidden="true">
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <p className="font-semibold text-sm text-brand-dark">
              {selectedNav === 'all' ? 'All Appointments' :
                selectedNav === 'testimonials' ? 'Testimonials' :
                'Settings'}
            </p>
            <span className="w-11 h-11" />
          </div>
        )}

        {/* Desktop top bar — fixed, does NOT scroll */}
        <AdminTopBar
          selectedDate={selectedDate}
          daysWithAppointments={daysWithAppointments}
          onPrevDay={goPrev}
          onNextDay={goNext}
          onResetToToday={resetToday}
          onSelectDate={setSelectedDate}
          onSearchFocus={() => setShowSearch(true)}
          onMarkExpired={() => markExpiredMutation.mutate()}
          processedCount={processedCount}
          onDismissBanner={() => setProcessedCount(null)}
          markExpiredPending={markExpiredMutation.isPending}
        />

        {/* Walk-in success banner */}
        <AnimatePresence initial={false}>
          {walkInBanner && (
            <motion.div
              key="walk-in-banner"
              variants={BANNER_SLIDE}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-teal-50 border-b border-teal-200 text-teal-800 px-6 py-2 flex items-center justify-between text-sm shrink-0 overflow-hidden"
            >
              <span>{walkInBanner}</span>
              <button
                type="button"
                onClick={() => setWalkInBanner(null)}
                aria-label="Dismiss"
                className="text-teal-800 min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <XIcon />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content — only this scrolls; canvas swap animated */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedNav}
            variants={CANVAS_SWAP}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            {mainContent}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Desktop detail panel */}
      <AnimatePresence>
        {selectedAppointment && (
          <>
            <div className="hidden md:block" key="detail-desktop">
              <AppointmentDetailPanel
                appointment={selectedAppointment}
                doctors={doctors}
                onClose={handleCloseDetail}
                actions={actions}
                cancellingId={cancellingId}
                onStartCancel={handleStartCancel}
                onAbortCancel={handleAbortCancel}
                onSilentRefetch={handleRefetch}
              />
            </div>
            <div className="md:hidden" key="detail-mobile">
              <AppointmentDetailPanel
                appointment={selectedAppointment}
                doctors={doctors}
                onClose={handleCloseDetail}
                actions={actions}
                cancellingId={cancellingId}
                onStartCancel={handleStartCancel}
                onAbortCancel={handleAbortCancel}
                onSilentRefetch={handleRefetch}
                mobile
              />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && (
          <SearchOverlay
            key="search-overlay"
            appointments={allAppointmentsData}
            doctors={doctors}
            onClose={() => setShowSearch(false)}
            onSelectAppointment={handleSelectFromSearch}
          />
        )}
      </AnimatePresence>

      {/* Walk-in booking modal */}
      <AnimatePresence>
        {showWalkInModal && (
          <WalkInBookingModal
            key="walk-in-modal"
            doctors={doctors}
            onClose={() => setShowWalkInModal(false)}
            onSuccess={(patientName) => {
              setWalkInBanner(`Appointment booked for ${patientName}.`)
              handleRefetch()
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile bottom-sheet nav */}
      <AnimatePresence>
        {showMobileNav && (
          <MobileNavSheet
            key="mobile-nav"
            selectedNav={selectedNav}
            onNavChange={setSelectedNav}
            onAddAppointment={() => setShowWalkInModal(true)}
            onClose={() => setShowMobileNav(false)}
            pendingCount={pendingCount}
          />
        )}
      </AnimatePresence>

      {/* Mobile FAB (search) */}
      {!selectedAppointment && !showSearch && !showWalkInModal && (
        <motion.button
          type="button"
          onClick={() => setShowSearch(true)}
          whileTap={TAP_SCALE}
          aria-label="Search appointments"
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-teal-800 hover:bg-teal-900 text-white rounded-full shadow-lg flex items-center justify-center z-30"
        >
          <SearchIcon />
        </motion.button>
      )}
    </div>
  )
}
