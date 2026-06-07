import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import 'lenis/dist/lenis.css'
import { useLenis } from '@/hooks/useLenis'
import { HeroAct } from './components/HeroAct'
import { EducationColumnsAct } from './components/EducationColumnsAct'
import { PracticeAct } from './components/PracticeAct'
import { RootsAct } from './components/RootsAct'
import { EraIndicator, type EraSection } from './components/EraIndicator'
import type { DoctorProfileData } from './doctorProfiles'

const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E\")"

interface DoctorBiographyProps {
  data: DoctorProfileData
}

export function DoctorBiography({ data }: DoctorBiographyProps) {
  const [activeSection, setActiveSection] = useState<EraSection>('hero')

  const heroRef = useRef<HTMLDivElement>(null)
  const originsRef = useRef<HTMLDivElement>(null)
  const educationRef = useRef<HTMLElement>(null)
  const practiceRef = useRef<HTMLElement>(null)
  const rootsRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll()
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.3, 0.55, 0.72, 0.88, 1.0],
    ['#0A0A0A', '#0A0A0A', '#0D0D0B', '#F5F0E6', '#F5F0E6', '#111111']
  )

  // Lenis smooths the whole scroll-choreographed journey; its eased scroll
  // position flows into the background-colour transform and every sticky act.
  const prefersReducedMotion = useReducedMotion()
  const lenisRef = useLenis(!prefersReducedMotion)

  // Smooth-scroll the right-rail navigation to each act.
  const scrollToSection = (id: EraSection) => {
    const el =
      id === 'hero'
        ? heroRef.current
        : id === 'origins'
          ? originsRef.current
          : id === 'education'
            ? educationRef.current
            : id === 'practice'
              ? practiceRef.current
              : rootsRef.current
    if (!el) return
    const lenis = lenisRef.current
    if (lenis) lenis.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Each profile lands at the top of the page.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [data.id])

  useEffect(() => {
    const targets: Array<{ id: EraSection; el: Element | null }> = [
      { id: 'hero', el: heroRef.current },
      { id: 'origins', el: originsRef.current },
      { id: 'education', el: educationRef.current },
      { id: 'practice', el: practiceRef.current },
      { id: 'roots', el: rootsRef.current },
    ]

    const lookup = new Map<Element, EraSection>()
    targets.forEach(({ id, el }) => {
      if (el) lookup.set(el, id)
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = lookup.get(entry.target)
            if (id) setActiveSection(id)
          }
        })
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    )

    lookup.forEach((_, el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative w-full font-cormorant">
      {/* Background colour journey. */}
      <motion.div
        style={{ backgroundColor: bgColor }}
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
      />

      {/* Grain texture — above background, below content. */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035]"
        style={{ backgroundImage: GRAIN_SVG }}
        aria-hidden
      />

      <EraIndicator
        activeSection={activeSection}
        isLightBackground={activeSection === 'practice'}
        progress={scrollYProgress}
        onNavigate={scrollToSection}
      />

      <main className="relative z-10">
        <HeroAct
          data={data.hero}
          heroSentinelRef={heroRef}
          originsSentinelRef={originsRef}
        />
        <EducationColumnsAct sectionRef={educationRef} columns={data.columns} />
        <PracticeAct sectionRef={practiceRef} />
        <RootsAct sectionRef={rootsRef} otherDoctor={data.otherDoctor} />
      </main>
    </div>
  )
}
