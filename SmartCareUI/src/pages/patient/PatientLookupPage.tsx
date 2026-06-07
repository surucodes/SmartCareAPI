import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Header } from '@/components/layout/Header'
import { useAppointmentLookup } from '@/hooks/useAppointmentLookup'
import { EASE_OUT_EXPO, TAP_SCALE } from '@/utils/motion'
import { AppointmentLookupForm } from './components/AppointmentLookupForm'
import { AppointmentDetailCard } from './components/AppointmentDetailCard'

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 8a5.5 5.5 0 0 1 9.4-3.9M13.5 8a5.5 5.5 0 0 1-9.4 3.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 2v3h-3M4 14v-3h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FullPageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mb-4" />
      <p className="text-[14px] text-gray-600">Loading your appointment...</p>
    </div>
  )
}

const AUTO_FETCH_FAILED_MESSAGE =
  "We couldn't find your appointment. Please enter your details below."

const stateTransition = {
  duration: 0.32,
  ease: EASE_OUT_EXPO,
}
const exitTransition = {
  duration: 0.18,
  ease: EASE_OUT_EXPO,
}

const stateVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(5px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: stateTransition },
  exit: { opacity: 0, y: -6, filter: 'blur(3px)', transition: exitTransition },
}

export default function PatientLookupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    appointment,
    isLoading,
    isError,
    errorMessage,
    lookup,
    cancelAppointment,
    isCancelling,
    cancelError,
    cancelSuccess,
    reset,
  } = useAppointmentLookup()

  const urlId = searchParams.get('id')
  const urlPhone = searchParams.get('phone')
  const hasUrlParams = !!urlId && !!urlPhone

  const autoFetchedRef = useRef(false)
  const [autoFetchAttempted, setAutoFetchAttempted] = useState(false)
  const [userSubmittedAfterFail, setUserSubmittedAfterFail] = useState(false)

  useEffect(() => {
    if (hasUrlParams && !autoFetchedRef.current) {
      autoFetchedRef.current = true
      setAutoFetchAttempted(true)
      lookup(urlId!, urlPhone!)
    }
  }, [hasUrlParams, urlId, urlPhone, lookup])

  const handleFormSubmit = (id: string, phone: string) => {
    setUserSubmittedAfterFail(true)
    lookup(id, phone)
  }

  const handleSearchAgain = () => {
    reset()
    setUserSubmittedAfterFail(false)
  }

  const showDetailCard = !!appointment
  const showAutoLoader =
    autoFetchAttempted &&
    !appointment &&
    !isError &&
    !userSubmittedAfterFail &&
    isLoading

  const autoFetchFailed =
    autoFetchAttempted && isError && !userSubmittedAfterFail

  const formServerError = userSubmittedAfterFail
    ? errorMessage
    : autoFetchFailed
      ? AUTO_FETCH_FAILED_MESSAGE
      : null

  // Compute view key for AnimatePresence wait-mode swap
  const viewKey = showDetailCard ? 'detail' : showAutoLoader ? 'loader' : 'form'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warm-50 pt-20 md:pt-24 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={viewKey}
              variants={stateVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {showDetailCard ? (
                <>
                  <div className="max-w-lg md:max-w-2xl mx-auto mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSearchAgain}
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-3 -mr-2 rounded-lg text-[13px] font-semibold text-brand-gold hover:text-teal-700 hover:bg-white transition-colors"
                    >
                      <RefreshIcon />
                      Search Again
                    </button>
                  </div>

                  <AppointmentDetailCard
                    appointment={appointment!}
                    onCancel={cancelAppointment}
                    isCancelling={isCancelling}
                    cancelError={cancelError}
                    cancelSuccess={cancelSuccess}
                  />

                  <div className="text-center mt-10 md:mt-12">
                    <motion.button
                      type="button"
                      onClick={() => navigate('/book')}
                      whileTap={TAP_SCALE}
                      className="inline-flex items-center gap-2 px-7 py-3 min-h-[48px] rounded-full border-2 border-teal-800 text-teal-800 font-semibold text-[14.5px] hover:bg-teal-50 hover:border-teal-600 transition-colors"
                    >
                      Book a New Appointment
                      <ArrowRight />
                    </motion.button>
                  </div>
                </>
              ) : showAutoLoader ? (
                <FullPageLoader />
              ) : (
                <AppointmentLookupForm
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading && userSubmittedAfterFail}
                  serverError={formServerError}
                  initialId={autoFetchFailed ? urlId ?? undefined : undefined}
                  initialPhone={autoFetchFailed ? urlPhone ?? undefined : undefined}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  )
}
