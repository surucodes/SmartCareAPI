import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { testimonialsService } from '@/services/testimonials.service'
import type { Testimonial } from '@/types/testimonial.types'

const QUERY_KEY = ['admin-testimonials'] as const

export interface UseTestimonialsAdmin {
  pendingTestimonials: Testimonial[]
  pendingCount: number
  isLoading: boolean
  isError: boolean
  approve: (id: string) => void
  dismiss: (id: string) => void
  approvingId: string | null
}

export function useTestimonialsAdmin(): UseTestimonialsAdmin {
  const queryClient = useQueryClient()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => testimonialsService.getAll(true),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => testimonialsService.approve(id),
    onMutate: (id) => {
      setApprovingId(id)
      const previous = queryClient.getQueryData<Testimonial[]>(QUERY_KEY) ?? []
      queryClient.setQueryData<Testimonial[]>(
        QUERY_KEY,
        previous.filter((t) => t.id !== id),
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous)
      }
    },
    onSettled: () => {
      setApprovingId(null)
    },
  })

  const dismiss = (id: string) => {
    console.warn(
      'Dismiss is client-side only — testimonial will reappear on refresh.',
    )
    setDismissed((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const pendingTestimonials = useMemo(() => {
    const all = query.data ?? []
    return all
      .filter((t) => !t.isApproved && !dismissed.has(t.id))
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }, [query.data, dismissed])

  return {
    pendingTestimonials,
    pendingCount: pendingTestimonials.length,
    isLoading: query.isLoading,
    isError: query.isError,
    approve: (id) => approveMutation.mutate(id),
    dismiss,
    approvingId,
  }
}
