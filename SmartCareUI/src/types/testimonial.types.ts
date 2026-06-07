export interface Testimonial {
  id: string
  patientName: string
  text: string
  rating: number
  isApproved: boolean
  date: string
}

export interface CreateTestimonialDto {
  patientName: string
  text: string
  rating: number
}
