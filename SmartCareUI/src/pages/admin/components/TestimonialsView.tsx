import { useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { cn } from '@/utils/cn'
import { useTestimonialsAdmin } from '@/hooks/useTestimonialsAdmin'

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} className={cn('w-4 h-4', filled ? 'text-amber-400' : 'text-gray-300')} aria-hidden="true">
      <path d="M10 2l2.39 4.84 5.34.78-3.86 3.77.91 5.31L10 14.27l-4.78 2.51.91-5.31L2.27 7.62l5.34-.78L10 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto mb-3 text-teal-400" aria-hidden="true">
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
      <path d="M16 24l6 6 12-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function timeAgo(date: string): string {
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true })
  } catch {
    return ''
  }
}

export function TestimonialsView() {
  const queryClient = useQueryClient()
  const {
    pendingTestimonials,
    pendingCount,
    isLoading,
    isError,
    approve,
    dismiss,
    approvingId,
  } = useTestimonialsAdmin()

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-serif text-2xl font-bold text-brand-dark">
            Pending Testimonials
          </h1>
          {pendingCount > 0 && (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-semibold">
              {pendingCount} Pending
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve patient feedback before it appears on the public site.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-28" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-center justify-between gap-3">
          <span className="text-sm">Failed to load testimonials. Try again.</span>
          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })}
            className="text-sm font-medium underline"
          >
            Retry
          </button>
        </div>
      ) : pendingCount === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <CheckIcon />
          <p className="text-sm text-gray-500">No testimonials pending approval</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pendingTestimonials.map((t) => (
            <li
              key={t.id}
              className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-brand-dark text-sm">
                      {t.patientName}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarIcon key={s} filled={s <= t.rating} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo(t.date)}</span>
                  </div>
                  <p className="text-sm text-gray-600 italic mt-2 leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => approve(t.id)}
                    disabled={approvingId === t.id}
                    className="min-h-[44px] px-3 rounded-lg bg-teal-600 hover:bg-teal-800 text-white text-sm font-semibold disabled:opacity-70"
                  >
                    {approvingId === t.id ? 'Approving…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    className="min-h-[44px] px-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
