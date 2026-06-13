import { useEffect, type RefObject } from 'react'

/**
 * Scroll engine for the "A Life in Practice" doctor profile.
 *
 * A faithful port of the design handoff's `app.js`: one transform-only
 * `update()` runs every scroll frame and writes transforms / opacity / CSS
 * custom-properties directly onto the chapter elements. Pin progress is derived
 * from document-absolute section tops (rect.top + scrollY) so it stays correct
 * regardless of any layout above the page. Lenis (when enabled) supplies the
 * eased scroll position; a rAF safety loop covers its momentum frames.
 *
 * All DOM access is scoped to `rootRef.current`, so nothing leaks to the rest
 * of the app and the engine tears down cleanly on unmount / route change.
 */
export function useLifeEngine(
  rootRef: RefObject<HTMLElement | null>,
  reduceMotion: boolean,
  profileId: string,
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const ss = (t: number) => {
      t = clamp(t)
      return t * t * (3 - 2 * t)
    }
    const norm = (x: number, a: number, b: number) => clamp((x - a) / (b - a))
    const m = reduceMotion ? 0 : 1

    const q = <T extends Element = HTMLElement>(sel: string) =>
      root.querySelector(sel) as T | null
    const qa = <T extends Element = HTMLElement>(sel: string) =>
      Array.from(root.querySelectorAll(sel)) as T[]

    /* ---------- film grain (generated once) ---------- */
    const grainEl = q('#grain')
    if (grainEl) {
      const c = document.createElement('canvas')
      c.width = c.height = 120
      const ctx = c.getContext('2d')
      if (ctx) {
        const img = ctx.createImageData(120, 120)
        for (let i = 0; i < img.data.length; i += 4) {
          const v = (Math.random() * 255) | 0
          img.data[i] = img.data[i + 1] = img.data[i + 2] = v
          img.data[i + 3] = 255
        }
        ctx.putImageData(img, 0, 0)
        grainEl.style.setProperty('--grain-url', `url(${c.toDataURL()})`)
      }
    }

    /* ---------- elements ---------- */
    const bgJourney = q('#bgJourney')
    const lifeline = q('#lifeline')
    const lifeFill = q('#lifelineFill')

    const heroSec = q('#chHero')
    const heroPhoto = q('#heroPhoto')
    const heroTop = q('#heroTop')
    const heroCopy = q('#heroCopy')
    const heroTitleLns = qa('#heroTitle .ln > span')
    const scrollCue = q('#scrollCue')

    const originSec = q('#chOrigins')
    const originPlate = q('#originPlate')
    const originImg = q('#originImg')
    const originCaption = q('#originCaption')
    const ghostYear = q('#ghostYear')

    const eduSec = q('#chEdu')
    const eduHead = q('#eduHead')
    const reel = q('#reel')
    const reelDots = qa('#reelDots i')

    const practiceSec = q('#chPractice')
    const marriageGhost = q('#marriageGhost')
    const journeyEl = practiceSec?.querySelector('.journey') as HTMLElement | null
    const jLine = q<SVGSVGElement>('#journeyLine')
    const jTrack = q<SVGPathElement>('#journeyTrack')
    const jProg = q<SVGPathElement>('#journeyProg')
    const jHead = q<SVGCircleElement>('#journeyHead')
    const jMilestones = practiceSec
      ? (Array.from(practiceSec.querySelectorAll('.milestone')) as HTMLElement[])
      : []
    let jData: {
      total: number
      fracs: number[]
      sampleY: number[]
      sampleLen: number[]
    } | null = null

    const rootsFrame = q('#rootsFrame')

    const ticks = qa('[data-tick]')

    /* document-absolute top of a node (stable across scroll). */
    const docTop = (node: HTMLElement) =>
      node.getBoundingClientRect().top + window.scrollY

    /* ---------- journey line (place → place → place) ---------- */
    const offsetWithin = (node: HTMLElement, anc: HTMLElement) => {
      let x = 0,
        y = 0
      let n: HTMLElement | null = node
      while (n && n !== anc) {
        x += n.offsetLeft
        y += n.offsetTop
        n = n.offsetParent as HTMLElement | null
      }
      return { x, y }
    }
    const smoothPath = (p: { x: number; y: number }[]) => {
      if (p.length < 2) return ''
      let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] || p[i],
          p1 = p[i],
          p2 = p[i + 1],
          p3 = p[i + 2] || p[i + 1]
        const c1x = p1.x + (p2.x - p0.x) / 6,
          c1y = p1.y + (p2.y - p0.y) / 6
        const c2x = p2.x - (p3.x - p1.x) / 6,
          c2y = p2.y - (p3.y - p1.y) / 6
        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
      }
      return d
    }
    const buildJourneyLine = () => {
      if (!journeyEl || !jProg || !jTrack || !jLine) return
      const W = journeyEl.clientWidth,
        H = journeyEl.clientHeight
      if (!W || !H) return
      const nodes = jMilestones
        .map((mEl) => mEl.querySelector('.milestone__node') as HTMLElement | null)
        .filter(Boolean) as HTMLElement[]
      const cx = nodes.map((n) => {
        const o = offsetWithin(n, journeyEl)
        return { x: o.x + n.offsetWidth / 2, y: o.y + n.offsetHeight / 2 }
      })
      if (cx.length < 2) return
      const sway = Math.min(96, W * 0.13)
      const first = cx[0],
        last = cx[cx.length - 1]
      const wp = [{ x: first.x, y: Math.max(6, first.y - 64) }]
      for (let i = 0; i < cx.length; i++) {
        wp.push(cx[i])
        if (i < cx.length - 1) {
          wp.push({
            x: (cx[i].x + cx[i + 1].x) / 2 + sway * (i % 2 === 0 ? 1 : -1),
            y: (cx[i].y + cx[i + 1].y) / 2,
          })
        }
      }
      wp.push({ x: last.x, y: Math.min(H - 6, last.y + 64) })

      const d = smoothPath(wp)
      jLine.setAttribute('viewBox', `0 0 ${W} ${H}`)
      jTrack.setAttribute('d', d)
      jProg.setAttribute('d', d)
      const total = jProg.getTotalLength()
      jProg.style.strokeDasharray = String(total)
      jProg.style.strokeDashoffset = String(total)
      // Sample the path once into a (length, y) table. The path descends
      // monotonically in y, so this lets us look up the draw length for any
      // target y — which keeps the travelling head locked to the scroll
      // position rather than to raw path length (the serpentine sways make
      // those two diverge, which is what felt out of sync).
      const N = 300
      const sampleY: number[] = new Array(N + 1)
      const sampleLen: number[] = new Array(N + 1)
      for (let i = 0; i <= N; i++) {
        const l = (total * i) / N
        const pt = jProg.getPointAtLength(l)
        sampleLen[i] = l
        sampleY[i] = pt.y
      }
      const fracs = cx.map((p) => {
        let best = 0,
          bd = 1e9
        for (let i = 0; i <= N; i++) {
          const pt = jProg.getPointAtLength(sampleLen[i])
          const dd = Math.abs(pt.y - p.y) + Math.abs(pt.x - p.x) * 0.15
          if (dd < bd) {
            bd = dd
            best = sampleLen[i]
          }
        }
        return best / total
      })
      jData = { total, fracs, sampleY, sampleLen }
    }

    /* Draw length whose point sits at journey-local `y` (monotone lookup). */
    const yToLen = (y: number) => {
      if (!jData) return 0
      const { sampleY, sampleLen } = jData
      const n = sampleY.length
      if (y <= sampleY[0]) return sampleLen[0]
      if (y >= sampleY[n - 1]) return sampleLen[n - 1]
      let lo = 0,
        hi = n - 1
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1
        if (sampleY[mid] < y) lo = mid
        else hi = mid
      }
      const span = sampleY[hi] - sampleY[lo] || 1
      const t = (y - sampleY[lo]) / span
      return sampleLen[lo] + (sampleLen[hi] - sampleLen[lo]) * t
    }

    /* ---------- background colour journey ---------- */
    const sceneEls = qa('.scene')
    const sceneBg = sceneEls.map(
      (s) => s.getAttribute('data-bg') || '#0c0b09',
    )
    const hexToRgb = (h: string) => {
      const n = parseInt(h.slice(1), 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }
    const rgbCache = sceneBg.map(hexToRgb)

    const updateBg = () => {
      if (!bgJourney || sceneEls.length === 0) return
      const mid = window.scrollY + window.innerHeight * 0.5
      let idx = 0
      const tops = sceneEls.map(docTop)
      for (let i = 0; i < sceneEls.length; i++) {
        if (mid >= tops[i]) idx = i
      }
      const nextIdx = Math.min(idx + 1, sceneEls.length - 1)
      const start = tops[idx]
      const end = tops[idx] + sceneEls[idx].offsetHeight
      const t = ss(norm(mid, lerp(start, end, 0.82), end))
      const a = rgbCache[idx]
      const b = rgbCache[nextIdx]
      const col = a.map((v, i) => Math.round(lerp(v, b[i], t)))
      bgJourney.style.backgroundColor = `rgb(${col[0]},${col[1]},${col[2]})`
      const onCream = (col[0] + col[1] + col[2]) / 3 > 140
      lifeline?.classList.toggle('on-cream', onCream)
    }

    /* ---------- per-frame update ---------- */
    const update = () => {
      const y = window.scrollY
      const vh = window.innerHeight

      const docH = document.documentElement.scrollHeight - vh
      const p = clamp(docH > 0 ? y / docH : 0)
      lifeFill?.style.setProperty('--progress', p.toFixed(4))

      let activeIdx = 0
      ticks.forEach((t, i) => {
        const at = parseFloat(t.getAttribute('data-tick') || '0')
        if (p >= at - 0.04) activeIdx = i
      })
      ticks.forEach((t, i) => t.classList.toggle('active', i === activeIdx))

      /* ---- HERO ---- */
      if (heroSec && heroPhoto && heroCopy && heroTop && scrollCue) {
        const top = docTop(heroSec)
        const range = heroSec.offsetHeight - vh
        const t = clamp(range > 0 ? (y - top) / range : 0)
        heroPhoto.style.transform = `scale(${1 + 0.14 * t * m}) translateY(${-3 * t * m}vh)`
        heroPhoto.style.opacity = (1 - 0.18 * t).toFixed(3)
        const fade = ss(norm(t, 0.34, 0.72))
        heroTitleLns.forEach((ln, i) => {
          ln.style.transform = `translateY(${-(20 + i * 26) * t * m}px)`
        })
        heroCopy.style.opacity = (1 - fade).toFixed(3)
        heroCopy.style.transform = `translateY(${-40 * fade * m}px)`
        heroTop.style.opacity = (1 - ss(norm(t, 0.0, 0.3))).toFixed(3)
        scrollCue.style.opacity = (1 - ss(norm(t, 0.0, 0.18))).toFixed(3)
      }

      /* ---- ORIGINS ---- */
      if (originSec && originPlate && originImg && originCaption && ghostYear) {
        const top = docTop(originSec)
        const range = originSec.offsetHeight - vh
        const t = clamp(range > 0 ? (y - top) / range : 0)
        const reveal = ss(norm(t, 0.02, 0.4))
        const plateAlpha = Math.min(reveal, 1 - ss(norm(t, 0.76, 0.97)))
        originPlate.style.opacity = plateAlpha.toFixed(3)
        originImg.style.transform = `scale(${1.08 + 0.12 * t * m})`
        originPlate.style.transform = `translateY(${lerp(40, -30, ss(t)) * m}px)`
        ghostYear.style.transform = `translateY(${lerp(60, -90, t) * m}px)`
        ghostYear.style.opacity = (0.5 + 0.5 * reveal).toFixed(3)
        const cIn = ss(norm(t, 0.28, 0.5))
        const cOut = ss(norm(t, 0.82, 1))
        originCaption.style.opacity = (cIn * (1 - cOut)).toFixed(3)
        originCaption.style.transform = `translateY(${lerp(30, 0, cIn) + 40 * cOut * m}px)`
      }

      /* ---- EDUCATION horizontal reel ---- */
      if (eduSec && reel && eduHead) {
        const top = docTop(eduSec)
        const range = eduSec.offsetHeight - vh
        const t = clamp(range > 0 ? (y - top) / range : 0)
        const drive = ss(norm(t, 0.06, 0.94))
        const max = reel.scrollWidth - window.innerWidth
        reel.style.transform = `translate3d(${-Math.max(0, max) * drive}px,0,0)`
        eduHead.style.opacity = (1 - 0.65 * ss(norm(t, 0.05, 0.2))).toFixed(3)
        reel.querySelectorAll('.reel__card').forEach((card) => {
          const r = (card as HTMLElement).getBoundingClientRect()
          const center = (r.left + r.width / 2) / window.innerWidth
          const off = center - 0.5
          const cimg = card.querySelector('.reel__img img') as HTMLElement | null
          if (cimg) cimg.style.transform = `scale(1.12) translateX(${off * -28 * m}px)`
        })
        const seg = clamp(
          Math.round(drive * (reelDots.length - 1)),
          0,
          reelDots.length - 1,
        )
        reelDots.forEach((d, i) => d.classList.toggle('on', i === seg))
      }

      /* ---- PRACTICE ghost parallax + travelling line ---- */
      if (practiceSec && marriageGhost) {
        const r = practiceSec.getBoundingClientRect()
        const t = clamp((vh - r.top) / (vh + r.height))
        marriageGhost.style.transform = `translate(-50%,-50%) translateY(${lerp(60, -60, t) * m}px)`

        if (jData && journeyEl && jProg && jHead) {
          const jr = journeyEl.getBoundingClientRect()
          // Lock the draw to where the viewport centre crosses the journey:
          // target the path point at that y, so the gold head rides exactly
          // with the scroll and each node lights as it reaches centre.
          const prog = reduceMotion
            ? 1
            : clamp(yToLen(clamp(vh * 0.5 - jr.top, 0, jr.height)) / jData.total)
          const drawn = jData.total * prog
          jProg.style.strokeDashoffset = (jData.total - drawn).toFixed(1)
          if (prog > 0.002 && prog < 0.998) {
            const pt = jProg.getPointAtLength(drawn)
            jHead.setAttribute('cx', pt.x.toFixed(1))
            jHead.setAttribute('cy', pt.y.toFixed(1))
            jHead.style.opacity = '1'
          } else {
            jHead.style.opacity = '0'
          }
          jData.fracs.forEach((f, i) => {
            jMilestones[i]?.classList.toggle('reached', prog >= f - 0.004)
          })
        }
      }
    }

    /* ---------- reveal-once IntersectionObserver ---------- */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            if (e.target === rootsFrame) {
              rootsFrame?.style.setProperty('--rclip', '0%')
              rootsFrame?.style.setProperty('--rscale', '1')
            }
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.32 },
    )
    qa('.milestone, .rise, #rootsFrame').forEach((n) => io.observe(n))

    /* ---------- main loop ---------- */
    const tick = () => {
      update()
      updateBg()
    }

    let scheduled = false
    const onScroll = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
      })
      tick()
    }

    const onResize = () => {
      buildJourneyLine()
      tick()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    // Continuous rAF safety loop — covers Lenis momentum frames where native
    // scroll events are sparse.
    let lastY = -1
    let rafId = 0
    const raf = () => {
      if (window.scrollY !== lastY) {
        lastY = window.scrollY
        tick()
      }
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Initial paint (and again once fonts settle, which shifts the journey path).
    buildJourneyLine()
    tick()
    let cancelled = false
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (cancelled) return
        buildJourneyLine()
        tick()
      })
    }

    return () => {
      cancelled = true
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafId)
      io.disconnect()
    }
    // lenisRef is a stable ref object; profileId re-runs the engine per doctor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, profileId])
}
