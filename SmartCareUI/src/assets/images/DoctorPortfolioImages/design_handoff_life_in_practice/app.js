/* ============================================================
   A Life in Practice — scroll engine
   Lenis smooth-scroll + rAF-driven, transform-only animation.
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  // smoothstep
  const ss = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  // map x in [a,b] -> [0,1]
  const norm = (x, a, b) => clamp((x - a) / (b - a));

  /* ---------- generate film grain once ---------- */
  (function grain() {
    const c = document.createElement("canvas");
    c.width = c.height = 120;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(120, 120);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    document.getElementById("grain").style.setProperty("--grain-url", `url(${c.toDataURL()})`);
  })();

  /* ---------- Lenis ---------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    window.__lenis = lenis;
  }

  /* ---------- elements ---------- */
  const el = (id) => document.getElementById(id);
  const bgJourney = el("bgJourney");
  const lifeFill = el("lifelineFill");

  const heroSec = el("chHero");
  const heroPhoto = el("heroPhoto");
  const heroTop = el("heroTop");
  const heroCopy = el("heroCopy");
  const heroTitleLns = document.querySelectorAll("#heroTitle .ln > span");
  const scrollCue = el("scrollCue");

  const originSec = el("chOrigins");
  const originPlate = el("originPlate");
  const originImg = el("originImg");
  const originCaption = el("originCaption");
  const ghostYear = el("ghostYear");

  const eduSec = el("chEdu");
  const eduHead = el("eduHead");
  const reel = el("reel");
  const reelDots = document.querySelectorAll("#reelDots i");

  const practiceSec = el("chPractice");
  const marriageGhost = el("marriageGhost");
  const journeyEl = practiceSec.querySelector(".journey");
  const jTrack = el("journeyTrack");
  const jProg = el("journeyProg");
  const jHead = el("journeyHead");
  const jMilestones = [...practiceSec.querySelectorAll(".milestone")];
  let jData = null;

  const rootsFrame = el("rootsFrame");

  /* ---------- lifeline ticks ---------- */
  (function buildTicks() {
    const ticks = (window.PROFILE && window.PROFILE.ticks) || [];
    const host = el("lifelineTicks");
    ticks.forEach((t) => {
      const b = document.createElement("button");
      b.className = "tick";
      b.style.top = (t.at * 100) + "%";
      b.innerHTML =
        `<span class="tick__dot"></span>` +
        `<span class="tick__meta"><span class="tick__year">${t.year}</span>` +
        `<span class="tick__label">${t.label}</span></span>`;
      b.addEventListener("click", () => {
        const target = document.documentElement.scrollHeight * t.at;
        if (lenis) lenis.scrollTo(target, { duration: 1.6 });
        else window.scrollTo({ top: target, behavior: "smooth" });
      });
      host.appendChild(b);
      t._node = b;
    });
    window.__TICKS = ticks;
  })();

  /* ---------- journey line (Kerala → Bhatkal → Sagara) ---------- */
  // layout position relative to an ancestor (ignores entrance transforms)
  function offsetWithin(node, anc) {
    let x = 0, y = 0, n = node;
    while (n && n !== anc) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y };
  }
  // Catmull-Rom → cubic-bezier smooth path through points
  function smoothPath(p) {
    if (p.length < 2) return "";
    let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p[i + 1];
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }
  function buildJourneyLine() {
    if (!journeyEl || !jProg) return;
    const W = journeyEl.clientWidth, H = journeyEl.clientHeight;
    if (!W || !H) return;
    const nodes = jMilestones.map((m) => m.querySelector(".milestone__node"));
    const cx = nodes.map((n) => {
      const o = offsetWithin(n, journeyEl);
      return { x: o.x + n.offsetWidth / 2, y: o.y + n.offsetHeight / 2 };
    });
    if (cx.length < 2) return;
    // serpentine: bow the line out to alternating sides between the nodes
    const sway = Math.min(96, W * 0.13);
    const first = cx[0], last = cx[cx.length - 1];
    const wp = [{ x: first.x, y: Math.max(6, first.y - 64) }];
    for (let i = 0; i < cx.length; i++) {
      wp.push(cx[i]);
      if (i < cx.length - 1) {
        wp.push({
          x: (cx[i].x + cx[i + 1].x) / 2 + sway * (i % 2 === 0 ? 1 : -1),
          y: (cx[i].y + cx[i + 1].y) / 2,
        });
      }
    }
    wp.push({ x: last.x, y: Math.min(H - 6, last.y + 64) });

    const d = smoothPath(wp);
    el("journeyLine").setAttribute("viewBox", `0 0 ${W} ${H}`);
    jTrack.setAttribute("d", d);
    jProg.setAttribute("d", d);
    const total = jProg.getTotalLength();
    jProg.style.strokeDasharray = total;
    jProg.style.strokeDashoffset = total;
    // fraction of total length at which the line reaches each node
    const fracs = cx.map((p) => {
      let best = 0, bd = 1e9;
      const N = 280;
      for (let i = 0; i <= N; i++) {
        const l = (total * i) / N;
        const pt = jProg.getPointAtLength(l);
        const dd = Math.abs(pt.y - p.y) + Math.abs(pt.x - p.x) * 0.15;
        if (dd < bd) { bd = dd; best = l; }
      }
      return best / total;
    });
    jData = { total, fracs };
  }

  /* ---------- background colour journey ---------- */
  const sections = [...document.querySelectorAll(".scene")].map((s) => ({
    node: s,
    bg: s.getAttribute("data-bg") || "#0c0b09",
  }));

  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgbCache = sections.map((s) => hexToRgb(s.bg));

  function updateBg() {
    // find which two sections the viewport midline straddles
    const mid = window.scrollY + window.innerHeight * 0.5;
    let idx = 0;
    for (let i = 0; i < sections.length; i++) {
      const r = sections[i].node;
      if (mid >= r.offsetTop) idx = i;
    }
    const cur = sections[idx];
    const nxt = sections[Math.min(idx + 1, sections.length - 1)];
    const start = cur.node.offsetTop;
    const end = cur.node.offsetTop + cur.node.offsetHeight;
    // blend only in the last 18% toward the next section for a crossfade
    const t = ss(norm(mid, lerp(start, end, 0.82), end));
    const a = rgbCache[idx];
    const b = rgbCache[Math.min(idx + 1, sections.length - 1)];
    const c = a.map((v, i) => Math.round(lerp(v, b[i], t)));
    bgJourney.style.backgroundColor = `rgb(${c[0]},${c[1]},${c[2]})`;

    // lifeline tone flips on cream
    const onCream = (c[0] + c[1] + c[2]) / 3 > 140;
    el("lifeline").classList.toggle("on-cream", onCream);
  }

  /* ---------- per-frame update ---------- */
  const M = reduceMotion ? 0 : 1; // motion multiplier base (also scaled by tweak)
  function motion() {
    return reduceMotion ? 0 : (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--motion")) || 1);
  }

  function rectTop(node) { return node.getBoundingClientRect().top + window.scrollY; }

  function update() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const m = motion();

    /* progress (whole doc) */
    const docH = document.documentElement.scrollHeight - vh;
    const p = clamp(y / docH);
    lifeFill.style.setProperty("--progress", p.toFixed(4));

    /* active tick */
    const ticks = window.__TICKS || [];
    let activeIdx = 0;
    ticks.forEach((t, i) => { if (p >= t.at - 0.04) activeIdx = i; });
    ticks.forEach((t, i) => t._node.classList.toggle("active", i === activeIdx));

    /* ---- HERO ---- (pin range = section height - vh) */
    {
      const top = heroSec.offsetTop;
      const range = heroSec.offsetHeight - vh;
      const t = clamp((y - top) / range); // 0..1 across the pin
      // portrait slow zoom + slight darken-drift
      heroPhoto.style.transform = `scale(${1 + 0.14 * t * m}) translateY(${ -3 * t * m }vh)`;
      heroPhoto.style.opacity = (1 - 0.18 * t).toFixed(3);
      // title lines parallax up & fade out in second half
      const fade = ss(norm(t, 0.34, 0.72));
      heroTitleLns.forEach((ln, i) => {
        ln.style.transform = `translateY(${ -(20 + i * 26) * t * m }px)`;
      });
      heroCopy.style.opacity = (1 - fade).toFixed(3);
      heroCopy.style.transform = `translateY(${ -40 * fade * m }px)`;
      heroTop.style.opacity = (1 - ss(norm(t, 0.0, 0.3))).toFixed(3);
      scrollCue.style.opacity = (1 - ss(norm(t, 0.0, 0.18))).toFixed(3);
    }

    /* ---- ORIGINS ---- aperture reveal + parallax */
    {
      const top = originSec.offsetTop;
      const range = originSec.offsetHeight - vh;
      const t = clamp((y - top) / range);
      // reveal opens 0->1 in first 38%, holds, then plate drifts
      // fade in with section entry, hold, fade out at exit
      const reveal = ss(norm(t, 0.02, 0.40));
      const plateAlpha = Math.min(reveal, 1 - ss(norm(t, 0.76, 0.97)));
      originPlate.style.opacity = plateAlpha.toFixed(3);
      // ken-burns on the image
      originImg.style.transform = `scale(${1.08 + 0.12 * t * m})`;
      // plate gentle rise as it locks
      originPlate.style.transform = `translateY(${ lerp(40, -30, ss(t)) * m }px)`;
      // ghost year drifts opposite
      ghostYear.style.transform = `translateY(${ lerp(60, -90, t) * m }px)`;
      ghostYear.style.opacity = (0.5 + 0.5 * reveal).toFixed(3);
      // caption fades in after reveal, out at the end
      const cIn = ss(norm(t, 0.28, 0.5));
      const cOut = ss(norm(t, 0.82, 1));
      originCaption.style.opacity = (cIn * (1 - cOut)).toFixed(3);
      originCaption.style.transform = `translateY(${ lerp(30, 0, cIn) + 40 * cOut * m }px)`;
    }

    /* ---- EDUCATION horizontal reel ---- */
    {
      const top = eduSec.offsetTop;
      const range = eduSec.offsetHeight - vh;
      const t = clamp((y - top) / range);
      // ease in & out so the reel doesn't start/stop hard
      const drive = ss(norm(t, 0.06, 0.94));
      const max = reel.scrollWidth - window.innerWidth;
      reel.style.transform = `translate3d(${ -max * drive }px,0,0)`;
      // head fades as reel takes over, returns near the very end? keep visible-ish
      eduHead.style.opacity = (1 - 0.65 * ss(norm(t, 0.05, 0.2))).toFixed(3);
      // parallax each card image inside its frame
      reel.querySelectorAll(".reel__card").forEach((card) => {
        const r = card.getBoundingClientRect();
        const center = (r.left + r.width / 2) / window.innerWidth; // 0..1
        const off = (center - 0.5);
        const img = card.querySelector(".reel__img img");
        if (img) img.style.transform = `scale(1.12) translateX(${ off * -28 * m }px)`;
      });
      // dots
      const seg = clamp(Math.round(drive * (reelDots.length - 1)), 0, reelDots.length - 1);
      reelDots.forEach((d, i) => d.classList.toggle("on", i === seg));
    }

    /* ---- PRACTICE ghost parallax + travelling line ---- */
    {
      const r = practiceSec.getBoundingClientRect();
      const t = clamp((vh - r.top) / (vh + r.height));
      marriageGhost.style.transform = `translate(-50%,-50%) translateY(${ lerp(60, -60, t) * m }px)`;

      if (jData) {
        const jr = journeyEl.getBoundingClientRect();
        const prog = reduceMotion ? 1 : clamp((vh * 0.80 - jr.top) / (jr.height * 0.82));
        const drawn = jData.total * prog;
        jProg.style.strokeDashoffset = (jData.total - drawn).toFixed(1);
        if (prog > 0.002 && prog < 0.998) {
          const pt = jProg.getPointAtLength(drawn);
          jHead.setAttribute("cx", pt.x.toFixed(1));
          jHead.setAttribute("cy", pt.y.toFixed(1));
          jHead.style.opacity = "1";
        } else {
          jHead.style.opacity = "0";
        }
        jData.fracs.forEach((f, i) => {
          if (jMilestones[i]) jMilestones[i].classList.toggle("reached", prog >= f - 0.004);
        });
      }
    }
  }

  /* ---------- IntersectionObservers (reveal once) ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        if (e.target.id === "rootsFrame") {
          rootsFrame.style.setProperty("--rclip", "0%");
          rootsFrame.style.setProperty("--rscale", "1");
        }
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.32 });

  document.querySelectorAll(".milestone, .rise, #rootsFrame").forEach((n) => io.observe(n));

  /* ---------- main loop ----------
     update() runs synchronously on every scroll event (robust even when
     rAF is throttled), plus a rAF loop for momentum frames when visible. */
  function tick() { update(); updateBg(); }

  let scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; });
    tick();
  }

  if (lenis) lenis.on("scroll", onScroll);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { buildJourneyLine(); tick(); });

  // continuous rAF safety loop (covers Lenis momentum where native scroll is sparse)
  let lastY = -1;
  function raf() {
    if (window.scrollY !== lastY) { lastY = window.scrollY; tick(); }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // initial paint
  buildJourneyLine();
  tick();
  window.addEventListener("load", () => { buildJourneyLine(); tick(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { buildJourneyLine(); tick(); });
  }
})();
