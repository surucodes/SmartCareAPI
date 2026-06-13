# Handoff: "A Life in Practice" — Doctor Profile Scrollytelling Page

## Overview
A full-screen, scroll-driven biographical narrative for a single doctor (Dr. Prasanna N.M, an orthopaedic surgeon). It reads top-to-bottom as a five-chapter "documentary": a pinned cinematic hero, a faded-edge archival photo reveal, a horizontally-scrolling education "film reel", a warm-paper practice timeline with a travelling line, and a closing dedication. A fixed left "lifeline" rail tracks reading progress with jump-to-chapter ticks. The aesthetic is monochrome documentary (deep ink + bone/cream) with a single gold accent.

This is built as a **single-doctor template** — content is fully data-driven (`data.js`), so the same engine can render other doctor profiles.

## About the Design Files
The files in this bundle are **design references created in HTML/CSS/vanilla JS** — a working prototype showing the intended look, motion, and scroll behaviour. They are **not** meant to be dropped into production as-is.

Your task is to **recreate this design in the target codebase's environment** (React, Vue, Svelte, Astro, etc.), using its established component patterns, styling system, and animation libraries. If no environment exists yet, pick the most appropriate stack for a content-driven, animation-heavy marketing/profile page (e.g. Next.js or Astro + a scroll library). The HTML/CSS here is a faithful spec you can read values from directly.

## Fidelity
**High-fidelity (hifi).** Final colours, typography, spacing, motion curves, and copy are all settled. Recreate the UI faithfully — match the exact tokens listed below. The one thing you have freedom on is *how* you wire the scroll engine (see "Interactions & Behavior") as long as the resulting motion matches.

---

## Tech & Dependencies (as prototyped)
- **Smooth scroll**: [Lenis](https://github.com/darkroomengineering/lenis) `1.1.13` (`duration: 1.15`, easing `t => Math.min(1, 1.001 - 2**(-10*t))`, `wheelMultiplier: 0.9`, `touchMultiplier: 1.4`). All animation is driven off scroll position, not Lenis-specific APIs, so any smooth-scroll lib (or native) works.
- **Animation technique**: no animation library. A single `update()` function runs every scroll frame and writes **transform / opacity / CSS-custom-property** values directly. Cheap, transform-only, GPU-friendly. You may reimplement with Framer Motion / GSAP ScrollTrigger / `useScroll` — the math in `app.js` is the source of truth.
- **Fonts**: Google Fonts — Bodoni Moda (display), Cormorant Garamond (body), IBM Plex Mono (labels/eyebrows).
- **Tweaks panel** (`tweaks-app.jsx` / `tweaks-panel.jsx`): a React dev-time control panel for swapping typeset/accent/motion. **This is a prototyping affordance, not part of the product** — you can ignore/strip it. It documents which values are intended to be themeable (font pairing, accent hue, motion intensity, grain on/off, warm-paper toggle).

---

## Design Tokens

### Colours
| Token | Value | Use |
|---|---|---|
| `--ink` | `#0c0b09` | primary dark background |
| `--ink-2` | `#131110` | — |
| `--ink-3` | `#1b1815` | — |
| `--cream` | `#efe9dd` | warm-paper interlude bg (Chapter IV) |
| `--cream-2` | `#e7e0d1` | — |
| `--cream-ink` | `#211d17` | text on cream |
| `--bone` | `#ece6da` | primary text on dark |
| `--bone-60` | `rgba(236,230,218,0.6)` | secondary text on dark |
| `--bone-40` | `rgba(236,230,218,0.4)` | tertiary text/labels on dark |
| `--bone-22` | `rgba(236,230,218,0.22)` | hairlines on dark |
| `--bone-12` | `rgba(236,230,218,0.12)` | faint borders on dark |
| `--umber` | `rgba(33,29,23,0.92)` | text on cream |
| `--umber-60` | `rgba(33,29,23,0.55)` | secondary on cream |
| `--umber-35` | `rgba(33,29,23,0.32)` | tertiary on cream |
| `--umber-15` | `rgba(33,29,23,0.13)` | hairlines on cream |
| `--gold` | `#c6a357` | **the only accent** — eyebrows, ticks, rules, current node |
| `--gold-hi` | `#e3c684` | lighter accent (italic emphasis words, year numerals) |
| `--gold-dim` | `rgba(198,163,87,0.4)` | accent glows/shadows |

Themeable accents offered in the prototype: `#c6a357` (gold), `#b08d57`, `#9c9a8e`, `#a8612f`. `--gold-hi` and `--gold-dim` are derived from the accent (lighten ≈ +38/+34/+24 RGB; dim = accent @ 0.4 alpha).

### Typography
| Family | Var | Role |
|---|---|---|
| Bodoni Moda, serif | `--font-display` | headlines, big numerals, place names |
| Cormorant Garamond, serif | `--font-body` | body copy, italic emphasis |
| IBM Plex Mono, monospace | `--font-mono` | eyebrows, captions, year ticks, footer |

Type rules:
- Display weight **500** (600 for ghost numerals), `line-height: 0.92`, `letter-spacing: -0.01em`.
- Eyebrows: mono, `clamp(10px,0.78vw,12px)`, `letter-spacing: 0.42em`, uppercase, gold.
- Italic emphasis words use `<em>` styled `font-style: italic; font-weight: 400; color: var(--gold-hi)`.
- Body copy: Cormorant, `clamp(16px,1.4vw,21px)`, `line-height ≈ 1.5–1.55`, `max-width ≈ 34–40ch`.

### Spacing / Layout
- Left rail offset: `--rail-x: clamp(20px, 4.2vw, 64px)` (→ `16px` on mobile).
- Section content insets use `clamp()` heavily — copy values per-component from `styles.css`.

### Motion
- `--motion` (0–1.6, default 1): global multiplier applied to every parallax/translate amount. `0` ≈ static for reduced-motion.
- `prefers-reduced-motion: reduce` → Lenis disabled, motion multiplier 0, cue animation off.
- Standard easing in CSS reveals: `cubic-bezier(0.22, 1, 0.36, 1)`. JS uses a `smoothstep` (`t*t*(3-2t)`) for nearly every progress remap.

### Texture
- **Film grain**: a 120×120 random-noise canvas generated at runtime, tiled at `180px`, `opacity: 0.05`, `mix-blend-mode: overlay`, fixed full-viewport. Toggleable.
- **Background colour journey**: a fixed `<div>` behind everything whose `background-color` cross-fades between each section's `data-bg` as the viewport mid-line crosses section boundaries (blend only in the last 18% toward the next section).

---

## Screens / Views
This is a single continuous page. "Screens" below = the five scroll chapters, in order. Each `<section class="scene">` carries `data-screen-label` and `data-bg`.

### Fixed: The Lifeline (left rail)
- **Purpose**: reading progress + chapter jump nav.
- **Layout**: `position: fixed`, `left: var(--rail-x)`, full height, `width: 1px`, `z-index: 40`. A 1px track inset `12vh` top/bottom; a gold gradient fill scaled by `--progress` (0–1) via `transform: scaleY()` from the top; absolutely-positioned tick buttons.
- **Ticks**: built from `PROFILE.ticks` (`{ at: 0..1, year, label }`). Each = a 7px dot + a year/label meta block that's hidden (`opacity:0, translateX(-6px)`) until hover or `.active`. Active dot turns gold, scales 1.25, gets a `0 0 0 4px rgba(198,163,87,0.16)` ring. Clicking scrolls to `scrollHeight * at`.
- **Tone flip**: on the cream chapter the rail adds `.on-cream` and switches dot/track/text to umber tones.
- Hidden entirely below 860px.

### Chapter I — The Doctor (hero) · `data-bg: #0c0b09`
- **Purpose**: cinematic intro — name, title, standfirst.
- **Layout**: section is `height: 320vh`; inner `.c-hero__pin` is `position: sticky; top:0; height:100vh; overflow:hidden`. Full-bleed portrait fills the pin.
- **Components**:
  - **Portrait** (`assets/portrait.png`): `object-fit: cover; object-position: 50% 32%`. Over the pin's scroll it slowly zooms (`scale 1 → 1.14`), drifts up (`-3vh`), and dims (`opacity 1 → 0.82`).
  - **Vignette**: layered radial + linear gradient darkening top and bottom (see `.c-hero__vignette`).
  - **Top name-mini**: centered, mono, `11px`, `letter-spacing 0.42em`, `--bone-60`. Fades out over first 30% of pin.
  - **Copy block** (bottom-left, inset `rail-x + clamp(28px,6vw,120px)`): a pretitle row (hairline rule + gold eyebrow "Orthopaedic Surgeon · Sagara, Karnataka"), then `H1` "Four / Decades of / *Healing.*" at `clamp(56px,11.5vw,188px)`, `#fff`, with each line wrapped in `.ln > span` for masked reveal; then standfirst at `clamp(17px,1.5vw,23px)`, `rgba(255,255,255,0.78)`, `max-width 40ch`.
  - **Title lines** parallax up by `-(20 + i*26)px * t` each; copy block fades/translates out between `t` 0.34→0.72.
  - **Scroll cue** (bottom-right): vertical mono "Begin" + a 56px line with a gold segment animating down (`cueRun` keyframes, 2.4s loop). Fades out almost immediately on scroll.

### Chapter II — The Origins (faded-edge photo plate) · `data-bg: #0c0b09`
> **This is the chapter most recently iterated on — implement its image treatment exactly as described.**
- **Purpose**: reveal the village birthplace photo with a soft, archival feel.
- **Layout**: section `height: 300vh`; `.c-origins__pin` sticky full-viewport, `display:grid; place-items:center`.
- **The plate** (`.plate`): centered rectangle, `width: clamp(320px, 56vw, 780px)`, **`aspect-ratio: 4 / 3`**, `max-height: 72vh`.
  - **Faded edges (key detail)**: the image edges fade to transparent on all four sides via a **CSS gradient mask** on `.plate__frame` — NOT a border, NOT a vignette, NOT `border-radius`. Two intersected linear gradients:
    ```css
    -webkit-mask-image:
      linear-gradient(to right,  transparent 0%, black 13%, black 87%, transparent 100%),
      linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%);
    -webkit-mask-composite: destination-in;            /* WebKit/Blink */
    mask-image:
      linear-gradient(to right,  transparent 0%, black 13%, black 87%, transparent 100%),
      linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%);
    mask-composite: intersect;                          /* standard */
    ```
    These faded edges must be **present from the very first frame of the reveal** — they are a static property of the frame, never clipped or animated in.
  - **Reveal animation**: the plate **fades in** on section entry, **holds** fully opaque through the middle, then **fades out** on exit — driven by **`opacity` on the plate**, NOT a clip-path. (An earlier version used an expanding `clip-path: inset(...)`; that was removed because it produced hard edges during the reveal. Do not reintroduce it.)
    - In `app.js`: `t` = pin progress 0–1. `reveal = smoothstep(norm(t, 0.02, 0.40))`; `plateAlpha = min(reveal, 1 - smoothstep(norm(t, 0.76, 0.97)))`; `plate.style.opacity = plateAlpha`. Net effect: 0 → 1 by t≈0.40, hold, 1 → 0 by t≈0.97.
  - **Ken-burns**: the `<img>` itself scales `1.08 → 1.20` across the pin (`scale(1.08 + 0.12*t)`), `object-position: 50% 42%`, base `transform: scale(1.08)`.
  - **Inner gradient** (`.plate__frame::after`): `linear-gradient(to top, rgba(8,7,6,0.58), transparent 56%)` for bottom grounding.
  - The plate also gently rises (`translateY 40px → -30px`).
- **Ghost year** "1969" (`.ghost-year`): huge outlined display numerals top-right, `clamp(80px,18vw,280px)`, `color: transparent; -webkit-text-stroke: 1px var(--bone-22)`. Drifts opposite (`60 → -90px`), opacity `0.5 → 1` with reveal.
- **Caption** (bottom-left): mono index "Ch. 01 — The Origins" (gold), `H2` "Nisarani, / *Karnataka.*" `clamp(34px,5.4vw,86px)` white, body copy. Fades in `t` 0.28→0.50, out 0.82→1.0.

### Chapter III — The Making (horizontal film reel) · `data-bg: #0c0b09`
- **Purpose**: three education milestones as a horizontally-scrolling reel driven by vertical scroll.
- **Layout**: section `height: 420vh`; `.c-edu__pin` sticky full-viewport. `.reel` is a `display:flex` row, `gap: clamp(36px,5vw,96px)`, translated left by `-(scrollWidth - innerWidth) * drive` where `drive = smoothstep(norm(t, 0.06, 0.94))`.
- **Components**:
  - **Marker** (top-left): eyebrow "Ch. 02"; fades down to 0.35 once the reel takes over.
  - **Intro card** (`width clamp(300px,36vw,520px)`): eyebrow "The Making of a Surgeon", big "1984—1993" (`clamp(60px,8vw,132px)`, the "—" gold italic), body, mono cue "Three chapters →".
  - **3 photo cards** (`.reel__card`, one `.tall`): full-height image frame (`outline: 1px solid var(--bone-12)`, bottom gradient), top-left mono "N° 0X", bottom caption stack = gold year numeral (`clamp(40px,4.4vw,76px)`), name, italic degree. A short body paragraph + 26px gold rule sits below each card. Card images parallax horizontally inside their frames based on screen-centre offset.
  - Data per card in `PROFILE.education.cards` (no, img, year, name[], degree, body, optional `tall`).
  - **Reel dots** (bottom-center): 4 segments (`24px×2px`), active one gold, tracks `drive`.

### Chapter IV — The Practice (warm-paper interlude) · `data-bg: #efe9dd`
- **Purpose**: marriage moment + a three-stop career timeline. Tonal shift to cream paper.
- **Layout**: normal-flow section (not pinned), `background: var(--cream)`, `color: var(--cream-ink)`, generous vertical padding. Content in `.wrap` (`min(1100px, 90vw)`, centered).
- **Marriage block**: centered. Eyebrow "Hubli · 1995"; a giant ghost "1995" behind (`clamp(140px,30vw,460px)`, `--umber-15`, parallax `60 → -60px`); foreground line "Two doctors. / One family. / *The year that changed everything.*" (`clamp(30px,4.6vw,76px)`, italic emphasis `#6e5a32`); a 1px vertical rule below.
- **Journey timeline**: a 3-row grid of milestones, each `grid-template-columns: minmax(0,1fr) auto minmax(0,1fr)` (place name on one side, body text on the other, a centered node column between). Rows alternate which side the place name sits.
  - **Travelling line** (`<svg class="journey__line">`): a smooth serpentine Catmull-Rom path computed in JS through the three node centres (bowed `±min(96, W*0.13)` alternately). Drawn via `stroke-dasharray`/`dashoffset` as you scroll; a gold head circle (`r 4.5`) rides the draw point. Each node "reaches" (turns gold, current one gets a `0 0 0 5px rgba(198,163,87,0.2)` ring) when the draw passes its fractional length. **The path is recomputed on resize** (`buildJourneyLine()`), so it must run after layout.
  - **Milestones** rise in (`opacity 0 / translateY 40px → in`) via IntersectionObserver at threshold 0.32. Data in `PROFILE.practice.journey.nodes` (years, place, body, optional `tag`, `current`).
  - **Node**: 12px circle, umber border on cream; reached = gold fill.
  - **Current milestone tag**: pill, mono `10px`, `letter-spacing 0.22em`, uppercase, `#6e5a32`, `1px solid rgba(110,90,50,0.35)`, `border-radius 100px`.
  - Mobile (≤860px): grid collapses to single column, node column floats left, place names left-aligned.
- Themeable: a "Warm paper interlude" toggle swaps bg between `var(--cream)` and `#dfe0dd`.

### Chapter V — The Roots (closing dedication) · `data-bg: #0c0b09`
- **Purpose**: emotional close + onward navigation.
- **Layout**: normal-flow dark section, centered content `min(1000px, 90vw)`.
- **Components**:
  - **Family photo frame** (`.roots__frame`): `outline: 1px solid var(--bone-12)`; reveals via `clip-path: inset(var(--rclip,14%) 0 ...)` animating to `0%` and image `scale(var(--rscale,1.12)) → 1` (transitions `1.4s` / `2.4s`, `cubic-bezier(0.22,1,0.36,1)`), triggered once by IntersectionObserver. Top gradient overlay. Overlaid headline "For the ones / who made it / *possible.*" italic display, centered, bottom.
  - **Sub** (`.roots__sub`, `.rise`): italic, `clamp(17px,1.5vw,23px)`, `--bone-60`, max 42ch — "To the families of Nisarani — your sacrifices built all of this."
  - **Links** (`.rise`): primary italic display link "Continue to Dr. Lakshmi Hegde →" with an animated 34→56px gold underline-lead and arrow shift on hover; secondary mono uppercase "Return to all doctors". Targets from `PROFILE.roots.otherDoctor.href`.
  - **Footer mark**: mono `10px`, `letter-spacing 0.4em`, uppercase, `--bone-22` — "Spandana Hospital · Sagara, Karnataka".

---

## Interactions & Behavior (summary)
- **Scroll is the only input** for storytelling. One `update()` reads `window.scrollY` each frame and sets transforms/opacity/custom-props. A `requestAnimationFrame` safety loop covers smooth-scroll momentum frames; a `scroll` listener covers the rest. Recompute the journey SVG path on resize and after fonts load.
- **Pinned sections** (I, II, III) are made by a tall section + a `position: sticky` inner at `top:0; height:100vh`; progress `t = (scrollY - section.offsetTop) / (section.offsetHeight - innerHeight)`, clamped 0–1.
- **Lifeline ticks**: click → smooth-scroll to `scrollHeight * at`. Active state by progress.
- **Reveals** (milestones, roots, .rise elements): one-shot via IntersectionObserver (threshold 0.32), add `.in`, then `unobserve`.
- **Hover states**: tick meta reveal; primary link underline-grow + arrow shift + colour to `#fff`; secondary link to gold.
- **Reduced motion**: disable Lenis, set motion multiplier 0 (sections settle to their resolved end-states), stop the cue/grain animations. Ensure all content is visible without scroll-driven opacity locking it hidden.

## State / Data
- No app state beyond scroll. All copy and imagery come from a single `PROFILE` object (`data.js`) — treat this as the content schema/props for a `<DoctorProfile>` component. Keys: `hero`, `origins`, `education.cards[]`, `practice.marriage`, `practice.journey.nodes[]`, `roots`, `ticks[]`. `<em>…</em>` markup inside string fields denotes the gold-italic emphasis word(s).
- Themeable knobs (optional to expose): font pairing, accent hex (gold-hi/dim derived), motion intensity (0–1.6), grain on/off, warm-paper interlude colour.

## Assets
In `assets/` (replace with the codebase's real photography; these are the prototype placeholders for this doctor):
- `portrait.png` — hero portrait (focal point upper-centre, `object-position 50% 32%`).
- `village.jpg` — Chapter II birthplace photo (focal `50% 42%`).
- `college-national.png`, `college-bellary.png`, `college-kmc.png` — Chapter III education cards.
- `grandparents.png` — Chapter V family photo.

## Files in this bundle
- `A Life in Practice.html` — page markup / section structure.
- `styles.css` — all styles & tokens (**source of truth for every measurement**).
- `app.js` — scroll engine: pin math, parallax, reel translate, journey SVG path, bg cross-fade, lifeline, grain.
- `data.js` — `PROFILE` content model (the content schema).
- `tweaks-app.jsx`, `tweaks-panel.jsx` — dev-time theming panel; **not product code**, included only to document themeable values.
- `assets/` — placeholder imagery.
