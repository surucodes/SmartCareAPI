import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { cn } from '@/utils/cn'
import { getTodayIST } from '@/utils/date.utils'
import { appointmentsService } from '@/services/appointments.service'
import { doctorsService } from '@/services/doctors.service'
import type { Doctor } from '@/types/doctor.types'

interface WalkInBookingModalProps {
  doctors: Doctor[]
  onClose: () => void
  onSuccess: (patientName: string) => void
}

const schema = z.object({
  doctorId:             z.string().min(1, 'Select a doctor'),
  consultationTypeId:   z.string().optional(),
  date:                 z.string().min(1, 'Date is required'),
  slot:                 z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM (e.g. 14:30)'),
  patientName:          z.string().min(2, 'Name too short'),
  patientPhone:         z.string()
                          .transform((v) => v.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, ''))
                          .refine((v) => /^\d{10}$/.test(v), 'Phone must be 10 digits'),
  patientEmail:         z.string().email('Invalid email'),
  patientType:          z.enum(['New', 'Returning']),
  notes:                z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function getError(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data
    if (data && typeof data === 'object' && 'error' in data) {
      const e = (data as { error: unknown }).error
      if (typeof e === 'string') return e
    }
    return err.message || 'Request failed.'
  }
  return 'Something went wrong. Please try again.'
}

export function WalkInBookingModal({
  doctors,
  onClose,
  onSuccess,
}: WalkInBookingModalProps) {
  const today = getTodayIST()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      doctorId: doctors[0]?.id ?? '',
      date: today,
      patientType: 'New',
    },
  })

  const doctorId = watch('doctorId')
  const consultationTypeId = watch('consultationTypeId')
  const patientType = watch('patientType')

  const consultTypesQuery = useQuery({
    queryKey: ['walk-in-consult-types', doctorId],
    queryFn: () => doctorsService.getConsultationTypes(doctorId),
    enabled: !!doctorId,
  })

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      appointmentsService.create({
        doctorId:             values.doctorId,
        consultationTypeId:   values.consultationTypeId || undefined,
        patientName:          values.patientName,
        patientPhone:         values.patientPhone,
        patientEmail:         values.patientEmail,
        date:                 values.date,
        slot:                 values.slot,
        notes:                values.notes || '',
        patientType:          values.patientType,
        referralSource:       'Self',
        appointmentType:      'OPD',
        isFollowUp:           false,
      }),
    onSuccess: (data) => {
      onSuccess(data.appointment.patientName)
      onClose()
    },
    onError: (err) => setServerError(getError(err)),
  })

  const onSubmit = (values: FormValues) => {
    setServerError(null)
    createMutation.mutate(values)
  }

  const inputBase =
    'w-full min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 text-base text-brand-dark focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-gray-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="presentation"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-bold text-brand-dark leading-tight">
              Walk-in Appointment
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Book an appointment for a patient at the desk.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-h-[44px] min-w-[44px] -m-2 flex items-center justify-center text-gray-400 hover:text-brand-dark rounded-full hover:bg-gray-50"
          >
            <XIcon />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >

          {/* Doctor selector */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Doctor</label>
            <div className="grid grid-cols-2 gap-2">
              {doctors.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setValue('doctorId', d.id, { shouldValidate: true })}
                  className={cn(
                    'text-left rounded-lg border p-3 min-h-[44px] transition-colors',
                    doctorId === d.id
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:bg-gray-50',
                  )}
                >
                  <p className="font-semibold text-brand-dark text-sm">{d.name}</p>
                  <p className="text-xs text-brand-gold mt-0.5 uppercase tracking-widest">
                    {d.specialty}
                  </p>
                </button>
              ))}
            </div>
            {errors.doctorId && <p className="text-xs text-red-600 mt-1">{errors.doctorId.message}</p>}
          </div>

          {/* Consultation type pills */}
          {consultTypesQuery.data && consultTypesQuery.data.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Consultation Type</label>
              <div className="flex flex-wrap gap-2">
                {consultTypesQuery.data.map((ct) => (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() =>
                      setValue(
                        'consultationTypeId',
                        consultationTypeId === ct.id ? '' : ct.id,
                      )
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                      consultationTypeId === ct.id
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    {ct.name} • {ct.durationMinutes}min
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date + slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" min={today} {...register('date')} className={inputBase} />
              {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Time slot</label>
              <input type="text" placeholder="HH:MM" {...register('slot')} className={inputBase} />
              {errors.slot && <p className="text-xs text-red-600 mt-1">{errors.slot.message}</p>}
            </div>
          </div>

          {/* Patient name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Patient Name</label>
            <input type="text" {...register('patientName')} className={inputBase} />
            {errors.patientName && <p className="text-xs text-red-600 mt-1">{errors.patientName.message}</p>}
          </div>

          {/* Phone + email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input type="tel" placeholder="10 digits" {...register('patientPhone')} className={inputBase} />
              {errors.patientPhone && <p className="text-xs text-red-600 mt-1">{errors.patientPhone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" {...register('patientEmail')} className={inputBase} />
              {errors.patientEmail && <p className="text-xs text-red-600 mt-1">{errors.patientEmail.message}</p>}
            </div>
          </div>

          {/* Patient type toggle */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Patient Type</label>
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-warm-100">
              {(['New', 'Returning'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setValue('patientType', opt)}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium min-h-[44px] transition-colors',
                    patientType === opt
                      ? 'bg-white shadow text-brand-dark'
                      : 'text-gray-500',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
            <textarea {...register('notes')} className="w-full min-h-[60px] rounded-lg border border-gray-200 bg-white p-3 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-gray-400" />
          </div>

          {serverError && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-800 text-white font-semibold rounded-lg min-h-[44px] transition-colors disabled:opacity-70"
          >
            {createMutation.isPending && <Spinner />}
            {createMutation.isPending ? 'Booking…' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  )
}
