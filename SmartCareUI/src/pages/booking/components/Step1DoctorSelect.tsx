import { useState, useMemo } from 'react'
import { useQuery, useQueries } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { doctorsService } from '@/services/doctors.service'
import { CARD_HOVER_SPRING, EASE_OUT_EXPO, TAP_SCALE } from '@/utils/motion'
import type { Doctor, ConsultationType } from '@/types/doctor.types'
import type { UseBookingFlow } from '@/hooks/useBookingFlow'
import drPrasannaLocal from '@/assets/images/Dr Prasanna.png'
import drLakshmiLocal from '@/assets/images/Dr.Lakshmi.png'

interface Step1Props {
  flow: UseBookingFlow
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function getInitials(name: string): string {
  const parts = name.replace(/^Dr\.?\s*/i, '').trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function localPhotoFor(name: string): string | null {
  if (/prasanna/i.test(name)) return drPrasannaLocal
  if (/lakshmi/i.test(name)) return drLakshmiLocal
  return null
}

function DoctorAvatar({ doctor }: { doctor: Doctor }) {
  const fallback = localPhotoFor(doctor.name)
  const [errored, setErrored] = useState(false)
  const showImage = !errored && (doctor.photoUrl || fallback)
  const src = !errored ? (doctor.photoUrl || fallback || '') : ''

  if (!showImage) {
    return (
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full shrink-0 border-2 border-white shadow-sm overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900 flex flex-col items-center justify-center gap-0.5">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="9" r="6" fill="rgba(255,255,255,0.85)" />
          <path d="M2 27c0-6.6 5.4-11 12-11s12 4.4 12 11" fill="rgba(255,255,255,0.85)" />
        </svg>
        <span className="text-[11px] font-bold text-white/80 tracking-wide leading-none">
          {getInitials(doctor.name)}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={doctor.name}
      onError={() => setErrored(true)}
      className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover object-top border-2 border-white shadow-sm shrink-0 bg-gray-100"
    />
  )
}

function DoctorCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-28 bg-gray-200 rounded-full" />
          <div className="h-8 w-32 bg-gray-200 rounded-full" />
          <div className="h-8 w-24 bg-gray-200 rounded-full" />
        </div>
      </div>
      <div className="h-12 mt-6 bg-gray-200 rounded-lg" />
    </div>
  )
}

interface DoctorCardProps {
  doctor: Doctor
  consultationTypes: ConsultationType[]
  consultationsLoading: boolean
  /** This doctor has been committed to the booking flow via "Select this Doctor". */
  isCommitted: boolean
  /** Another doctor is committed — this card is visually and functionally disabled. */
  isDisabled: boolean
  /** The consultationTypeId committed to the flow (only relevant when isCommitted). */
  committedTypeId: string | null
  /** The pill the user has highlighted locally, before committing (only when !isCommitted). */
  localTypeId: string | null
  onSelectType: (doctor: Doctor, type: ConsultationType) => void
  onSelectCard: (doctor: Doctor) => void
}

function DoctorCard({
  doctor,
  consultationTypes,
  consultationsLoading,
  isCommitted,
  isDisabled,
  committedTypeId,
  localTypeId,
  onSelectType,
  onSelectCard,
}: DoctorCardProps) {
  const activeTypes = consultationTypes.filter((t) => t.isActive)

  // Committed card shows the flow-committed type; uncommitted shows local highlight.
  const highlightedTypeId = isCommitted ? committedTypeId : localTypeId

  const hasLocalPill = Boolean(localTypeId)
  // Button is enabled when committed (acts as deselect) or a local pill is highlighted.
  const buttonEnabled = isCommitted || hasLocalPill

  return (
    <motion.div
      whileHover={!isDisabled && !isCommitted ? { y: -3 } : undefined}
      transition={CARD_HOVER_SPRING}
      style={{ transition: 'box-shadow 220ms cubic-bezier(0.32, 0.72, 0, 1), border-color 180ms ease, opacity 200ms ease' }}
      className={cn(
        'relative bg-white rounded-2xl border-2 p-5 md:p-6 flex flex-col',
        // Disabled card: 40% opacity, pointer-events none — no border change
        isDisabled && 'opacity-40 pointer-events-none border-gray-200',
        // Committed card: teal border + shadow
        !isDisabled && isCommitted && 'border-[#0F6E56] shadow-[0_10px_30px_rgba(15,110,86,0.15)]',
        // Default card: gray border + hover shadow growth
        !isDisabled && !isCommitted && 'border-gray-200 shadow-[0_4px_20px_rgba(19,43,26,0.04)] hover:shadow-[0_14px_32px_rgba(19,43,26,0.10)]',
      )}
    >
      {/* Committed checkmark — absolute top-right, 28px, spring scale-in when committed */}
      <AnimatePresence>
        {isCommitted && (
          <motion.div
            key="committed-badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { type: 'spring', stiffness: 420, damping: 22 },
            }}
            exit={{
              scale: 0,
              opacity: 0,
              transition: { duration: 0.14, ease: EASE_OUT_EXPO },
            }}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#0F6E56] flex items-center justify-center shadow-sm"
            aria-label="Doctor selected"
          >
            <CheckIcon />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header: avatar + name + specialty */}
      <div className="flex items-center gap-4 mb-5">
        <DoctorAvatar doctor={doctor} />
        {/* pr-10 ensures text never overlaps the absolute checkmark (28px + 16px gap) */}
        <div className={cn('min-w-0', isCommitted && 'pr-10')}>
          <h3
            className="text-[18px] md:text-[20px] font-bold text-[#111] mb-0.5 truncate"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            {doctor.name}
          </h3>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C9A227]">
            {doctor.specialty}
          </span>
        </div>
      </div>

      {/* Visit types */}
      <div className="mb-5">
        <p className="text-[13px] font-medium text-gray-600 mb-2.5">Select Visit Type:</p>
        {consultationsLoading ? (
          <div className="flex flex-wrap gap-2">
            <div className="h-9 w-28 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-9 w-32 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-9 w-24 rounded-full bg-gray-100 animate-pulse" />
          </div>
        ) : activeTypes.length === 0 ? (
          <p className="text-[13px] text-gray-500 italic">No consultation types available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeTypes.map((type) => {
              const isPicked = highlightedTypeId === type.id
              return (
                <button
                  key={type.id}
                  type="button"
                  // Prevent keyboard focus on disabled card's children
                  tabIndex={isDisabled ? -1 : undefined}
                  onClick={() => onSelectType(doctor, type)}
                  className={cn(
                    'min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-200',
                    isPicked
                      ? 'bg-[#0F6E56] text-white border-2 border-[#0F6E56] shadow-md'
                      : 'bg-white text-[#111] border-2 border-[#D1D5DB] hover:bg-gray-50',
                  )}
                  aria-pressed={isPicked}
                >
                  {isPicked && <CheckIcon />}
                  {type.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* "Select this Doctor" button — three visual states */}
      <motion.button
        type="button"
        tabIndex={isDisabled ? -1 : undefined}
        disabled={!buttonEnabled}
        aria-disabled={!buttonEnabled}
        onClick={() => onSelectCard(doctor)}
        whileTap={buttonEnabled ? TAP_SCALE : undefined}
        className={cn(
          'w-full mt-auto min-h-[48px] rounded-lg text-[15px] font-semibold',
          // COMMITTED: teal, no hover change (this is now a deselect trigger)
          isCommitted && 'bg-[#0F6E56] text-white cursor-pointer',
          // ENABLED (pill selected, not committed): teal + hover darker
          !isCommitted && hasLocalPill && 'bg-[#0F6E56] text-white hover:bg-[#085041] cursor-pointer transition-colors',
          // DISABLED (no pill selected): gray, not clickable
          !isCommitted && !hasLocalPill && 'bg-[#9CA3AF] text-white cursor-not-allowed',
        )}
      >
        {isCommitted ? 'Doctor Selected' : 'Select this Doctor'}
      </motion.button>
    </motion.div>
  )
}

export function Step1DoctorSelect({ flow }: Step1Props) {
  // Local pill highlight state — purely visual, not committed to the booking flow.
  // Key: doctorId, Value: highlighted consultationTypeId on that card.
  const [highlightedPills, setHighlightedPills] = useState<Record<string, string>>({})

  const doctorsQuery = useQuery<Doctor[]>({
    queryKey: ['doctors'],
    queryFn: () => doctorsService.getAll(),
    staleTime: 5 * 60_000,
  })

  const doctors = useMemo(() => doctorsQuery.data ?? [], [doctorsQuery.data])

  const consultationQueries = useQueries({
    queries: doctors.map((d) => ({
      queryKey: ['consultation-types', d.id],
      queryFn: () => doctorsService.getConsultationTypes(d.id),
      staleTime: 5 * 60_000,
    })),
  })

  const handleSelectType = (doctor: Doctor, type: ConsultationType) => {
    if (flow.selectedDoctorId === doctor.id) {
      // STEP C: doctor already committed — update visit type directly in flow, no button click needed.
      flow.setDoctor(doctor, type.id, type.name)
    } else {
      // STEP A: not committed — update local highlight only (radio within card, toggle off if same pill).
      setHighlightedPills((prev) => {
        if (prev[doctor.id] === type.id) {
          // Clicking the active pill again clears the selection for this card.
          const next = { ...prev }
          delete next[doctor.id]
          return next
        }
        return { ...prev, [doctor.id]: type.id }
      })
    }
  }

  const handleSelectCard = (doctor: Doctor) => {
    if (flow.selectedDoctorId === doctor.id) {
      // STEP D: "Doctor Selected" clicked — deselect, clear flow and local highlight.
      flow.clearDoctor()
      setHighlightedPills((prev) => {
        const next = { ...prev }
        delete next[doctor.id]
        return next
      })
      return
    }

    // STEP B: "Select this Doctor" clicked — commit if a local pill is highlighted.
    const localTypeId = highlightedPills[doctor.id]
    if (!localTypeId) return

    const idx = doctors.findIndex((d) => d.id === doctor.id)
    const types = consultationQueries[idx]?.data ?? []
    const selectedType = types.find((t) => t.id === localTypeId && t.isActive)
    if (!selectedType) return

    flow.setDoctor(doctor, selectedType.id, selectedType.name)
    // Clear local state — committed card now reads from flow.selectedConsultationTypeId.
    setHighlightedPills((prev) => {
      const next = { ...prev }
      delete next[doctor.id]
      return next
    })
  }

  const canContinue = Boolean(flow.selectedDoctorId && flow.selectedConsultationTypeId)

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (doctorsQuery.isLoading) {
    return (
      <section className="flex flex-col gap-6">
        <h1
          className="text-[28px] md:text-[36px] font-bold text-center text-[#111]"
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          Choose Your Doctor
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
        </div>
      </section>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (doctorsQuery.isError) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 7v6M12 16v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-[16px] text-gray-700">Unable to load doctors. Please try again.</p>
        <button
          type="button"
          onClick={() => doctorsQuery.refetch()}
          className="min-h-[44px] px-6 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
        >
          Retry
        </button>
      </section>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <section className="flex flex-col gap-6">
      <div className="text-center">
        <h1
          className="text-[28px] md:text-[36px] font-bold text-[#111]"
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          Choose Your Doctor
        </h1>
        <p className="text-[14px] text-gray-600 mt-1">
          Select a doctor and your preferred visit type to continue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {doctors.map((doctor, idx) => {
          const types = consultationQueries[idx]?.data ?? []
          const loading = consultationQueries[idx]?.isLoading ?? false
          const isCommitted = flow.selectedDoctorId === doctor.id
          // Disabled when any other doctor is committed in the flow.
          const isDisabled = flow.selectedDoctorId !== null && !isCommitted
          return (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              consultationTypes={types}
              consultationsLoading={loading}
              isCommitted={isCommitted}
              isDisabled={isDisabled}
              committedTypeId={isCommitted ? flow.selectedConsultationTypeId : null}
              localTypeId={isCommitted ? null : (highlightedPills[doctor.id] ?? null)}
              onSelectType={handleSelectType}
              onSelectCard={handleSelectCard}
            />
          )
        })}
      </div>

      {/* Continue button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => flow.goToStep(2)}
          className={cn(
            'inline-flex items-center gap-2 min-h-[48px] px-7 rounded-lg text-[15px] font-semibold transition-all duration-200 w-full md:w-auto justify-center',
            canContinue
              ? 'bg-[#0F6E56] text-white shadow-md hover:bg-[#085041] hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed',
          )}
          aria-disabled={!canContinue}
        >
          Continue
          <ArrowRight />
        </button>
      </div>

      {!canContinue && (
        <p className="text-center text-[13px] text-gray-500 -mt-2">
          Pick a doctor and a visit type to continue
        </p>
      )}
    </section>
  )
}
