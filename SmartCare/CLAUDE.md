# SmartCare — Claude Code Project Instructions

## Project Overview
Hospital appointment portal for Spandana Hospital, Bengaluru.
2 doctors: Dr. Prasanna N.M (Orthopaedics), Dr. Lakshmi Hegde (Gynaecology).
Real production system — not a demo.

## Tech Stack
- React 18 + TypeScript
- Vite (build tool)
- React Router v6 (routing)
- TanStack Query v5 (server state, caching, refetching)
- React Hook Form + Zod (forms + validation)
- Axios (HTTP client)
- Tailwind CSS v3 (styling)
- Stitch design system (source of truth for colors, spacing, typography)

## Backend API
Base URL (dev): http://localhost:5000
Base URL (prod): set via VITE_API_BASE_URL in .env
Auth: JWT Bearer token, stored in memory via React context — never localStorage
Full API reference: read /CONTEXT.md before touching any data-fetching code.
All API response types must match /CONTEXT.md exactly — no guessing field names.

## Project Structure
src/
  assets/          → images, icons, fonts
  components/      → shared reusable components
  pages/           → one folder per route
  hooks/           → custom React hooks (useAuth, useAppointments etc)
  services/        → Axios API call functions, one file per domain
  types/           → TypeScript interfaces matching backend models exactly
  utils/           → pure helper functions
  router/          → React Router config

StitchComponentCode/  → raw Stitch exports, reference only, never import directly

## Stitch Design Reference
Raw Stitch code lives in /StitchComponentCode.
Use it for visual reference: colors, spacing, component structure, copy.
Do NOT copy-paste Stitch output directly into src/.
Always rewrite cleanly in production TypeScript with proper types, hooks, and error handling.
Final implementation must match the design asset image exactly.

## Plan Mode
Make plans extremely concise. Sacrifice grammar for concision.
End every plan with a numbered list of unresolved questions, if any exist.
No unresolved questions = state "No open questions."

---

## Production Code Standards — enforce every single time

### TypeScript
- No `any`. Ever. Type everything explicitly.
- All API response shapes defined as interfaces in src/types/
- All interfaces match backend model field names exactly
- Zod schemas for all form validation and API response parsing

### Component architecture
- One component per file
- Props interface defined above every component, never inline
- No logic in JSX — extract to hooks or utils
- Components under 150 lines. If longer, split.
- Named exports only. No default exports except pages.

### Data fetching
- All API calls go through src/services/ — never fetch() or axios directly in components
- TanStack Query for all server state — no useState for remote data
- Loading states handled explicitly — never render stale/undefined data
- Error states handled explicitly — user always sees a message, never a blank screen
- Optimistic updates where it improves UX (status changes, check-in)

### Forms
- React Hook Form for all forms — no controlled useState inputs
- Zod schema validates before submission, never on the API response alone
- Submission button disabled during pending state
- Field-level error messages shown inline, not as alerts

### Error handling
- Every async operation wrapped in try/catch or query error boundary
- API errors surfaced to user in human language, not raw error objects
- Network failure shows retry option, not a broken screen
- 401 responses clear auth state and redirect to login silently

### Performance
- No premature optimisation — but no obvious mistakes either
- Images: always specify width and height, use loading="lazy" for below-fold
- No inline functions in JSX that recreate on every render
- useCallback and useMemo only when there is a measured reason

### Accessibility
- Every interactive element reachable by keyboard
- All images have meaningful alt text (or alt="" if decorative)
- Form inputs always have associated labels — no placeholder-only labels
- Color is never the only indicator of state — always pair with text or icon
- Touch targets minimum 44x44px — this is mobile-first

---

## Mobile-First Standards — enforce on every component

### The rule
Write mobile styles first. Desktop is an enhancement via Tailwind breakpoint prefixes.
`sm:` `md:` `lg:` are additions, never overrides of a desktop-first base.

### Layout
- Default layout: single column, full width
- Horizontal layouts only at md: and above unless explicitly designed for mobile side-by-side
- No fixed pixel widths on containers — use w-full, max-w-*, percentage
- Padding: px-4 mobile, px-6 sm, px-8 lg — never less than px-4 on mobile
- Never use overflow-x on body — if content overflows horizontally, the component is wrong

### Typography
- Base font size minimum 16px (text-base) — never smaller for body text
- Line height minimum 1.5 for paragraph text
- Headings scale: text-2xl mobile → text-4xl lg for hero, proportionally for others
- Never truncate critical information with text-ellipsis on mobile

### Touch targets
- Minimum 44x44px for all buttons and interactive elements
- min-h-[44px] min-w-[44px] on anything tappable
- Adequate spacing between adjacent tap targets — minimum 8px gap
- No hover-only interactions — touch devices have no hover state

### Navigation
- Mobile: bottom nav or hamburger menu — never assume sidebar fits
- Desktop: top nav or sidebar depending on surface (public vs dashboard)
- Active states clearly visible without hover

### Forms on mobile
- Full-width inputs on mobile — never side-by-side fields unless specifically designed
- Input font-size minimum 16px — below this Safari auto-zooms on focus (breaks layout)
- Appropriate keyboard type via inputMode: "tel" for phone, "email" for email, "numeric" for numbers
- Submit button full-width on mobile, fixed width on desktop

### Images
- Always use aspect-ratio to prevent layout shift before image loads
- Hero images: object-cover, constrained height on mobile (don't let portrait photos dominate)
- Doctor photos: aspect-square with object-cover and rounded-full for circular crops

### Spacing rhythm
- Use Tailwind spacing scale consistently — no arbitrary values unless design requires
- Section vertical padding: py-12 mobile, py-20 lg
- Card padding: p-4 mobile, p-6 lg

### Testing mindset
Before marking any component done, mentally check:
  Does it work at 375px width (iPhone SE)?
  Are all tap targets reachable with a thumb?
  Does it work without hover states?
  Does text remain readable without zooming?
  Does the layout survive long Indian names and addresses?

---

## Design Tokens (from Stitch)
Primary teal:     #0F6E56  (buttons, links, active states)
Secondary teal:   #1D9E75  (hover states)
Accent:           warm off-white backgrounds
Text primary:     near-black
Text secondary:   muted grey
Border radius:    8px cards, 999px pills, 4px inputs
Font:             system sans-serif stack or project-specified font from Stitch

When in doubt about a color or spacing value, check StitchComponentCode first.

---

## Surfaces and Auth
Public (no auth):     homepage, booking flow, patient lookup, patient cancel
Admin (Admin JWT):    all appointments, confirm/cancel/reschedule, check-in, testimonials
Doctor (Doctor JWT):  own schedule only, mark complete/no-show

JWT stored in memory via React context. On page refresh, redirect to login.
Never store JWT in localStorage or sessionStorage.

---

## Read before every session
1. This file
2. /CONTEXT.md (backend API reference)
3. The relevant StitchComponentCode file for the component being built
4. The design asset image for that screen