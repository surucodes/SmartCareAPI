export interface BreakPeriod {
  start: string
  end: string
  reason: string
}

export interface DaySchedule {
  start: string
  end: string
  emergencyOnly: boolean
  breaks: BreakPeriod[]
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  bio: string
  photoUrl: string
  isActive: boolean
  schedulingPolicy: 'Strict' | 'Flexible'
  slotCapacity: number
  monday: DaySchedule | null
  tuesday: DaySchedule | null
  wednesday: DaySchedule | null
  thursday: DaySchedule | null
  friday: DaySchedule | null
  saturday: DaySchedule | null
  sunday: DaySchedule | null
}

export interface ConsultationType {
  id: string
  doctorId: string
  name: string
  durationMinutes: number
  bufferMinutes: number
  isActive: boolean
}

export type SlotStatus = 'Available' | 'Limited' | 'Unavailable'

export interface SlotResponse {
  time: string
  status: SlotStatus
  bookingsCount?: number
  capacity?: number
}

export interface AvailableSlotsResponse {
  doctorId: string
  doctorName: string
  date: string
  dayOfWeek: string
  consultationDurationMinutes: number
  consultationTypeName: string | null
  bufferMinutes: number
  emergencyOnly: boolean
  emergencyMessage?: string
  slots: SlotResponse[]
}
