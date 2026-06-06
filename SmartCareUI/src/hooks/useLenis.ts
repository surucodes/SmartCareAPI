import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/**
 * Smooth, weighted document scrolling. Lenis eases the real scroll position via
 * its own RAF loop, so any scroll-linked Motion value (useScroll / useTransform)
 * inherits the cinematic glide for free.
 *
 * Returns a ref to the live Lenis instance so callers can drive programmatic
 * smooth-scroll (e.g. `lenis.scrollTo(el)` for in-page section navigation).
 *
 * No-op when `enabled` is false (e.g. prefers-reduced-motion); the ref stays
 * null so callers can fall back to native scrolling.
 */
export function useLenis(enabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      // Exponential ease-out: scroll input decelerates into place rather than
      // tracking 1:1, giving long-form scrolling a filmic weight.
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Smooth the touch drag on mobile so the motion feels intentional.
      syncTouch: true,
      syncTouchLerp: 0.08,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    })
    lenisRef.current = lenis

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled])

  return lenisRef
}
