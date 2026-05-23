import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { useBookingFlow } from '@/hooks/useBookingFlow'
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

export default function BookingPage() {
  const flow = useBookingFlow()
  const navigate = useNavigate()

  const showBack = flow.currentStep === 2 || flow.currentStep === 3

  const handleBack = () => {
    if (flow.currentStep === 1) navigate('/')
    else flow.goBack()
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-warm-50 pt-20 md:pt-24 pb-12 md:pb-20">
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
          <div className="mb-8 md:mb-10">
            <StepIndicator currentStep={flow.currentStep} />
          </div>

          {/* Active step */}
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
        </div>
      </main>
    </>
  )
}
