import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Header } from '@/components/layout/Header'
import { useBookingFlow, type BookingStep } from '@/hooks/useBookingFlow'
import { EASE_OUT_EXPO } from '@/utils/motion'
import { StepIndicator } from './components/StepIndicator'
import { Step1DoctorSelect } from './components/Step1DoctorSelect'
import { Step2DateTime } from './components/Step2DateTime'
import { Step3PatientDetails } from './components/Step3PatientDetails'
import { BookingConfirmation } from './components/BookingConfirmation'

function BackArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12 5l-5 5 5 5M7 10h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function stepOrder(step: BookingStep): number {
  return step === 'confirmation' ? 4 : step
}

export default function BookingPage() {
  const flow = useBookingFlow()
  const navigate = useNavigate()

  // Track direction of step navigation for slide animations.
  // Forward = new step is later in sequence; back = earlier.
  const prevStepRef = useRef<BookingStep>(flow.currentStep)
  const [direction, setDirection] = useState<1 | -1>(1)

  useEffect(() => {
    const prev = prevStepRef.current
    if (prev !== flow.currentStep) {
      setDirection(stepOrder(flow.currentStep) >= stepOrder(prev) ? 1 : -1)
      prevStepRef.current = flow.currentStep
    }
  }, [flow.currentStep])

  const showBack = flow.currentStep === 2 || flow.currentStep === 3

  const handleBack = () => {
    if (flow.currentStep === 1) navigate('/')
    else flow.goBack()
  }

  const handleStepClick = (step: 1 | 2 | 3) => {
    const currentStepNum = flow.currentStep === 'confirmation' ? 3 : flow.currentStep
    if (step < currentStepNum) {
      flow.goToStep(step)
    }
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-warm-50 pt-20 md:pt-18 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto px-4">

          {/* Sub-toolbar: back button */}
          {flow.currentStep !== 'confirmation' && (
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 min-h-[40px] -ml-2 px-2 py-2 rounded-lg text-[14px] font-medium text-gray-600 hover:text-teal-700 hover:bg-white transition-colors"
                aria-label={showBack ? 'Go back to previous step' : 'Return home'}
              >
                <BackArrow />
                {showBack ? 'Back' : 'Home'}
              </button>
              <span className="text-[12px] font-medium text-gray-500">
                Book an Appointment
              </span>
            </div>
          )}

          {/* Step indicator */}
          <div className="mb-8 md:mb-5">
            <StepIndicator currentStep={flow.currentStep} onStepClick={handleStepClick} />
          </div>

          {/* Step content — animated swap with directional slide */}
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={String(flow.currentStep)}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  opacity: 0,
                  x: dir * 24,
                  filter: 'blur(5px)',
                }),
                center: {
                  opacity: 1,
                  x: 0,
                  filter: 'blur(0px)',
                  transition: { duration: 0.28, ease: EASE_OUT_EXPO },
                },
                exit: (dir: number) => ({
                  opacity: 0,
                  x: dir * -12,
                  filter: 'blur(3px)',
                  transition: { duration: 0.16, ease: EASE_OUT_EXPO },
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {flow.currentStep === 1 && <Step1DoctorSelect flow={flow} />}
              {flow.currentStep === 2 && <Step2DateTime flow={flow} />}
              {flow.currentStep === 3 && <Step3PatientDetails flow={flow} />}
              {flow.currentStep === 'confirmation' && flow.completedAppointment && (
                <BookingConfirmation
                  appointment={flow.completedAppointment.appointment}
                  message={flow.completedAppointment.message}
                  patientPhone={flow.completedAppointment.appointment.patientPhone}
                  flow={flow}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  )
}
