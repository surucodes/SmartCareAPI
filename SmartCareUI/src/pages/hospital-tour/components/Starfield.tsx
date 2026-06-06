import { useEffect, useRef } from 'react'

interface StarfieldProps {
  /** Number of stars. Higher = denser sky. */
  density?: number
  /** Hex accent the star halo + nebula are tinted with. */
  accent?: string
  /** Draw the three slow-drifting nebula blobs behind the stars. */
  nebula?: boolean
  className?: string
}

interface Star {
  x: number // 0–1 of width
  y: number // 0–1 of height
  r: number // base radius (px) — larger = nearer
  sp: number // upward drift speed (nearer drifts faster → parallax)
  dx: number // slight horizontal drift
  tw: number // twinkle phase
  tws: number // twinkle speed
  a: number // base alpha
}

const hexToRgb = (hex: string): [number, number, number] => {
  const m = hex.replace('#', '')
  const full =
    m.length === 3
      ? m
          .split('')
          .map((c) => c + c)
          .join('')
      : m
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * A drifting starfield rendered to a `<canvas>`. Small twinkling stars float
 * slowly upward with parallax layering (nearer stars are larger and move
 * faster). Each star is a radial gradient — white core fading through an
 * accent-tinted halo — composited with `globalCompositeOperation: 'lighter'`
 * for an additive glow. Optional slow nebula blobs sit behind, also additive.
 *
 * Pure imperative animation in a single rAF loop; never touches React state.
 * Live props are mirrored to a ref so the loop reads the latest without
 * restarting.
 */
export function Starfield({
  density = 150,
  accent = '#36d6c3',
  nebula = true,
  className,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cfgRef = useRef({ density, accent, nebula })
  cfgRef.current = { density, accent, nebula }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0
    let h = 0
    let raf = 0
    let t = 0
    let lastCount = -1
    let stars: Star[] = []

    const seed = (count: number) => {
      stars = []
      for (let i = 0; i < count; i++) {
        const layer = Math.random() // 0 = far … 1 = near (parallax + size)
        stars.push({
          x: Math.random(),
          y: Math.random(),
          r: 0.3 + layer * 1.6,
          sp: 0.004 + layer * 0.016,
          dx: (Math.random() - 0.5) * 0.004,
          tw: Math.random() * Math.PI * 2,
          tws: 0.6 + Math.random() * 1.8,
          a: 0.35 + Math.random() * 0.5,
        })
      }
    }

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      const { density: dens, accent: acc, nebula: neb } = cfgRef.current
      t += 0.016

      const count = Math.round(dens)
      if (count !== lastCount) {
        seed(count)
        lastCount = count
      }
      const [ar, ag, ab] = hexToRgb(acc)

      ctx.clearRect(0, 0, w, h)

      // Slow-drifting nebula blobs (additive, low alpha).
      if (neb) {
        ctx.globalCompositeOperation = 'lighter'
        const blobs = [
          { bx: 0.28, by: 0.62, rr: 0.55, col: [ar, ag, ab], al: 0.16, dr: 0.05 },
          { bx: 0.74, by: 0.32, rr: 0.5, col: [233, 92, 138], al: 0.1, dr: -0.04 },
          { bx: 0.5, by: 0.85, rr: 0.6, col: [ar, ag, ab], al: 0.08, dr: 0.03 },
        ]
        blobs.forEach((b, i) => {
          const cx = (b.bx + Math.sin(t * 0.05 + i) * 0.03 + b.dr * Math.sin(t * 0.02)) * w
          const cy = (b.by + Math.cos(t * 0.04 + i) * 0.03) * h
          const rad = b.rr * Math.min(w, h)
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
          g.addColorStop(0, `rgba(${b.col[0]},${b.col[1]},${b.col[2]},${b.al})`)
          g.addColorStop(1, `rgba(${b.col[0]},${b.col[1]},${b.col[2]},0)`)
          ctx.fillStyle = g
          ctx.fillRect(0, 0, w, h)
        })
      }

      // Stars — additive radial-gradient glow, drifting upward + twinkling.
      ctx.globalCompositeOperation = 'lighter'
      for (const s of stars) {
        s.y -= s.sp * 0.01
        s.x += s.dx * 0.01
        if (s.y < -0.02) {
          s.y = 1.02
          s.x = Math.random()
        }
        if (s.x < -0.02) s.x = 1.02
        else if (s.x > 1.02) s.x = -0.02

        const tw = 0.55 + 0.45 * Math.sin(t * s.tws + s.tw)
        const px = s.x * w
        const py = s.y * h
        const alpha = s.a * tw

        const grd = ctx.createRadialGradient(px, py, 0, px, py, s.r * 3)
        grd.addColorStop(0, `rgba(255,255,255,${alpha})`)
        grd.addColorStop(0.4, `rgba(${ar},${ag},${ab},${alpha * 0.5})`)
        grd.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(px, py, s.r * 3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'

      raf = requestAnimationFrame(draw)
    }

    resize()
    seed(Math.round(cfgRef.current.density))
    lastCount = Math.round(cfgRef.current.density)
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={className} />
}
