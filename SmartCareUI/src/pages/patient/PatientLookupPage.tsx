import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { useAppointmentLookup } from '@/hooks/useAppointmentLookup'
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

  // Auto-fetch on mount when both params are present. Use a ref so this fires
  // exactly once even under StrictMode double-mount and never re-fires if the
  // user clicks "Search Again" (which calls reset()).
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

  // Decide which view to render.
  // 1. We have an appointment → detail card.
  // 2. Loading (auto-fetch in flight or initial fetch from URL) → full-page loader.
  // 3. Otherwise → lookup form (with appropriate prefilled error if applicable).
  const showDetailCard = !!appointment
  const showAutoLoader =
    autoFetchAttempted &&
    !appointment &&
    !isError &&
    !userSubmittedAfterFail &&
    isLoading

  const autoFetchFailed =
    autoFetchAttempted && isError && !userSubmittedAfterFail

  // After user re-submits the form post auto-fetch fail, switch to the form's
  // own server-error stream. Otherwise show the AUTO_FETCH message.
  const formServerError = userSubmittedAfterFail
    ? errorMessage
    : autoFetchFailed
      ? AUTO_FETCH_FAILED_MESSAGE
      : null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warm-50 pt-20 md:pt-24 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
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
                <button
                  type="button"
                  onClick={() => navigate('/book')}
                  className="inline-flex items-center gap-2 px-7 py-3 min-h-[48px] rounded-full border-2 border-teal-800 text-teal-800 font-semibold text-[14.5px] hover:bg-teal-50 hover:border-teal-600 transition-all active:scale-[0.99]"
                >
                  Book a New Appointment
                  <ArrowRight />
                </button>
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
        </div>
      </main>
    </>
  )
}
