import { useEffect, useState } from 'react'

/**
 * Tracks whether the viewport is below the `md` breakpoint (768px).
 * Used to swap the heavy sticky scroll-choreography for clean, static
 * stacked layouts on phones — without altering the desktop experience.
 */
export function useIsMobile(query = '(max-width: 767px)'): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])

  return isMobile
}
