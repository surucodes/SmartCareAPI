import api from './api'
import type {
  Testimonial,
  CreateTestimonialDto,
} from '@/types/testimonial.types'

export const testimonialsService = {
  getApproved: () =>
    api.get<Testimonial[]>('/api/testimonials').then((r) => r.data),

  getAll: (includePending: boolean) =>
    api
      .get<Testimonial[]>('/api/testimonials', { params: { includePending } })
      .then((r) => r.data),

  create: (dto: CreateTestimonialDto) =>
    api.post<Testimonial>('/api/testimonials', dto).then((r) => r.data),

  approve: (id: string) =>
    api.patch(`/api/testimonials/${id}/approve`).then((r) => r.data),
}
