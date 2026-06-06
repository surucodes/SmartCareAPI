import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { EASE_OUT_EXPO } from '@/utils/motion'
import type { BookingStep } from '@/hooks/useBookingFlow'

interface StepIndicatorProps {
  currentStep: BookingStep
  onStepClick?: (step: 1 | 2 | 3) => void
}

const STEPS: { num: 1 | 2 | 3; label: string }[] = [
  { num: 1, label: 'Doctor'  },
  { num: 2, label: 'Date & Time' },
  { num: 3, label: 'Your Details' },
]

function statusOf(stepNum: 1 | 2 | 3, current: BookingStep): 'completed' | 'active' | 'inactive' {
  if (current === 'confirmation') return 'completed'
  if (stepNum < current) return 'completed'
  if (stepNum === current) return 'active'
  return 'inactive'
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const activeNum =
    currentStep === 'confirmation' ? 3 : (currentStep as 1 | 2 | 3)
  const activeLabel =
    currentStep === 'confirmation' ? 'Confirmation' : STEPS[activeNum - 1].label

  return (
    <div className="w-full">
      {/* Step bubbles + connector lines */}
      <div className="flex items-center justify-between max-w-md mx-auto px-2">
        {STEPS.map((step, idx) => {
          const status = statusOf(step.num, currentStep)
          const isLast = idx === STEPS.length - 1
          const isClickable = status === 'completed' && onStepClick

          const connectorActive = status === 'completed'

          return (
            <div key={step.num} className="flex items-center flex-1 last:flex-none">
              {/* Bubble */}
              <div className="flex flex-col items-center relative z-10">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.num)}
                  disabled={!isClickable}
                  className={cn(
                    'relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[14px] font-semibold transition-shadow duration-150',
                    isClickable && 'cursor-pointer hover:ring-4 hover:ring-teal-100',
                    !isClickable && 'cursor-default',
                    status === 'completed' && 'bg-teal-600 text-white shadow-md',
                    status === 'active' && 'bg-teal-600 text-white shadow-md ring-4 ring-teal-100',
                    status === 'inactive' && 'bg-white text-gray-400 border-2 border-gray-200',
                  )}
                  aria-current={status === 'active' ? 'step' : undefined}
                  aria-label={`Step ${step.num}: ${step.label}${status === 'completed' ? ' completed' : ''}`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {status === 'completed' ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.5, opacity: 0, rotate: 15, filter: 'blur(4px)' }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          rotate: 0,
                          filter: 'blur(0px)',
                          transition: { duration: 0.22, ease: EASE_OUT_EXPO },
                        }}
                        exit={{
                          scale: 0.6,
                          opacity: 0,
                          rotate: -15,
                          filter: 'blur(3px)',
                          transition: { duration: 0.12, ease: EASE_OUT_EXPO },
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <CheckIcon />
                      </motion.span>
                    ) : (
                      <motion.span
                        key={`num-${step.num}`}
                        initial={{ scale: 0.5, opacity: 0, rotate: -15, filter: 'blur(4px)' }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          rotate: 0,
                          filter: 'blur(0px)',
                          transition: { duration: 0.22, ease: EASE_OUT_EXPO },
                        }}
                        exit={{
                          scale: 0.6,
                          opacity: 0,
                          rotate: 15,
                          filter: 'blur(3px)',
                          transition: { duration: 0.12, ease: EASE_OUT_EXPO },
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        {step.num}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="flex-1 h-[2px] mx-2 md:mx-3 relative overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={cn(
                      'absolute inset-0 transition-transform duration-500 ease-out origin-left',
                      connectorActive ? 'bg-teal-600 scale-x-100' : 'bg-teal-600 scale-x-0',
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Active step label */}
      <p className="text-center mt-3 text-[13px] font-medium text-gray-600">
        Step {activeNum} of 3:{' '}
        <span className="text-teal-700 font-semibold">{activeLabel}</span>
      </p>
    </div>
  )
}
