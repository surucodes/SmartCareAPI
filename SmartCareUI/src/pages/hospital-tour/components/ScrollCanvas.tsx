import { useCallback, useEffect, useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useMotionTemplate,
  useTransform,
} from 'motion/react'
import { TOTAL_FRAMES } from '../hooks/useFrameSequence'
import { CinematicOverlays } from './CinematicOverlays'
import { CardDeck } from './CardDeck'
import { Starfield } from './Starfield'
import { TourIntroOverlay } from './TourIntroOverlay'
import outsideHospital from '@/assets/images/HospitalAssets/OutsideHosiptal.png'

interface ScrollCanvasProps {
  frames: HTMLImageElement[]
  /** Called (throttled to frame boundaries) whenever the active frame changes. */
  onFrameChange: (frameIndex: number) => void
}

const LAST_INDEX = TOTAL_FRAMES - 1

/** Centre-cropped "cover" draw — fills the canvas, no black bars. */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | undefined
) {
  if (!img) return
  const { canvas } = ctx
  const scale = Math.max(
    canvas.width / img.naturalWidth,
    canvas.height / img.naturalHeight
  )
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  const x = (canvas.width - w) / 2
  const y = (canvas.height - h) / 2
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, x, y, w, h)
}

export function ScrollCanvas({ frames, onFrameChange }: ScrollCanvasProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastFrameRef = useRef(-1)
  // Local frame index drives the intro overlay that lives inside the sticky
  // container; the rising card deck reads the scroll progress directly.
  const [currentFrame, setCurrentFrame] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // The background opens razor-sharp, then dissolves into atmosphere as the
  // walkthrough proceeds — stays clear through the first frames, then blurs.
  const blurPx = useTransform(scrollYProgress, [0, 0.12, 0.62], [0, 0, 4.5])
  const backgroundFilter = useMotionTemplate`blur(${blurPx}px) saturate(1.15) contrast(1.06) brightness(0.9)`

  // The high-res exterior still that greets the visitor, crossfading into the
  // frame sequence a few frames in.
  const showStartup = currentFrame < 10

  const progressToIndex = (latest: number) =>
    Math.max(0, Math.min(LAST_INDEX, Math.floor(latest * TOTAL_FRAMES)))

  // Imperative redraw — never routed through React state.
  const renderIndex = useCallback(
    (index: number) => {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) drawFrame(ctx, frames[index])
    },
    [frames]
  )

  // Size the canvas backing store to the device pixel ratio for sharp output,
  // then repaint the current frame. Re-runs on resize.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      renderIndex(progressToIndex(scrollYProgress.get()))
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [renderIndex, scrollYProgress])

  // Paint the first frame as soon as frames are ready (before any scroll).
  useEffect(() => {
    renderIndex(progressToIndex(scrollYProgress.get()))
  }, [renderIndex, scrollYProgress])

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const index = progressToIndex(latest)
    renderIndex(index)
    if (index !== lastFrameRef.current) {
      lastFrameRef.current = index
      setCurrentFrame(index)
      onFrameChange(index)
    }
  })

  return (
    <section
      ref={sectionRef}
      aria-label="Hospital virtual tour"
      className="relative w-full"
      style={{ height: '600vh' }}
    >
      <div className="sticky top-0 h-[50vh] w-full overflow-hidden md:h-screen">
        {/* Background group — canvas + startup still — sharpens at the top and
            progressively blurs as you scroll. The slight scale hides the
            blurred edges and adds a constant subtle push-in. */}
        <motion.div
          className="absolute inset-0"
          style={{ filter: backgroundFilter, transform: 'scale(1.06)' }}
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Cinematic walkthrough of Spandana Hospital entrance"
            className="absolute inset-0 h-full w-full"
          />
          {/* Razor-sharp exterior still, crossfading into the sequence. */}
          <motion.img
            src={outsideHospital}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 1 }}
            animate={{ opacity: showStartup ? 1 : 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Drifting starfield + nebula — additive glow above the blurred
            backdrop, behind the cards and cinematic chrome. */}
        <Starfield className="pointer-events-none absolute inset-0 z-[2] block h-full w-full" />

        {/* Atmospheric grade / grain / vignette / letterbox. */}
        <CinematicOverlays />

        {/* Rising department deck — cards lift into focus one at a time as the
            scroll progresses. Desktop only; mobile uses the page's static list. */}
        <CardDeck progress={scrollYProgress} />
        <TourIntroOverlay currentFrame={currentFrame} />
        {/* Bottom fade into the post-tour section. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>
    </section>
  )
}
