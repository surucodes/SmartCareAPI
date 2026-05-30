## Context

The admin dashboard is the most complex page in the project. It involves:
- Two parallel async data sources (doctors + today's appointments) that must be combined
- A background mutation (`process-expired`) that fires silently on mount
- 60-second polling via `refetchInterval`
- Six distinct appointment actions (confirm, complete, no-show, cancel, check-in, reschedule), each as a `useMutation`
- A second async source (testimonials) with local dismiss state
- Three overlay surfaces (detail panel, search overlay, walk-in modal) that must coexist with the main layout
- Fully responsive: sidebar + two-column schedule on desktop; tab-based single-column + FAB on mobile

**Stitch designs used as visual reference only** — they use Material Symbols icons, placeholder hospital/doctor names, and custom Tailwind color tokens. All three must be corrected:
- Icons → inline SVGs (no external icon library in project)
- Hospital name → "Spandana Hospital"; doctors → "Dr. Prasanna N.M" (Orthopaedics) and "Dr. Lakshmi Hegde" (Gynaecology); no "IN PROGRESS" status
- Stitch tokens → project Tailwind tokens (mapped in Decision 1 below)

Existing infrastructure used as-is:
- `appointmentsService` (all methods), `doctorsService`, `testimonialsService` (+ new `getAll`)
- `useAuth()` → user email for sidebar; `logout()` for logout button
- `formatDisplayDate`, `formatDisplayTime`, `formatTimestamp`, `getTodayIST`, `getDayName` from `date.utils`

## Goals / Non-Goals

**Goals:**
- Fully operational schedule view — doctors' appointments for today, sorted by slot, with all action buttons wired
- Appointment detail panel (desktop) and bottom sheet (mobile) showing full patient info
- Walk-in booking modal calling `appointmentsService.create()`
- Global search across today's in-memory appointments
- Testimonials moderation view with approve (API) and dismiss (client-side only)
- Silent `process-expired` on mount, 60-second polling
- All TypeScript strict — no `any`

**Non-Goals:**
- Multi-day schedule or date navigation — today only
- Patient history panel — notes are read-only
- Patient ID, gender, age in detail panel
- Persistent dismiss for testimonials (session-only is acceptable)
- `/unauthorized` route (pre-existing gap, out of scope)

## Decisions

### Decision 1 — Stitch color token → project Tailwind mapping

The Stitch HTML uses a custom token system. The project Tailwind config has different names. Canonical mapping:

| Stitch token | Project equivalent | Hex |
|---|---|---|
| `primary` (dark forest green) | `brand-dark` | `#132b1a` |
| `primary-container` (mid dark green) | `teal-800` | `#085041` |
| `primary-fixed` (pale green) | `teal-100` | `#9FE1CB` |
| `on-primary-fixed` | `teal-900` | `#04342C` |
| `on-primary-container` | `teal-400` | `#1D9E75` |
| `secondary` (amber/gold) | `brand-gold` | `#C9A227` |
| `secondary-container` | `amber-300` | approx |
| `secondary-fixed` | `amber-100` | approx |
| `surface` / `background` | `warm-50` | `#FAFAF8` |
| `surface-container-low` | `warm-100` | `#F5F4F0` |
| `surface-container-high` | `warm-200` | `#EEECEA` |
| `outline-variant` | `gray-100` | `#F0F0F0` |
| `text-primary` / `on-surface` | `[#111111]` | direct hex |
| `text-muted` | `gray-400` | |
| `text-secondary` | `gray-500` | |
| `error` | `red-700` | |
| `error-container` | `red-100` | |
| `surface-inverse` / `brand-dark` | `brand-dark` | `#132b1a` |

All inline hex or Tailwind class names in implementation — never reference Stitch token names.

### Decision 2 — Three hooks, one refetch chain

`useAdminAppointments` owns both `useQuery` calls (doctors + appointments) and exposes `refetch()`. `useAppointmentActions` receives `refetch` as a prop so every mutation closes the feedback loop. `useTestimonialsAdmin` is independent. This avoids a global store and keeps data flow explicit.

```
AdminDashboardPage
  ↓ useAdminAppointments() → { doctors, appointmentsByDoctorId, isLoading, refetch }
  ↓ useAppointmentActions(refetch) → { confirm, complete, markNoShow, cancel, checkIn, reschedule }
  ↓ useTestimonialsAdmin() → { pendingTestimonials, approve, dismiss }
```

**Alternative considered:** Single `useQuery` with a combined fetcher. Rejected — doctors and appointments have different cache keys and different polling needs; keeping them separate makes invalidation clean.

### Decision 3 — process-expired fires as a fire-and-forget effect, not a mutation

`process-expired` is a background cleanup — its result is informational only. It is called via `useEffect` with an empty dependency array (runs once on mount). Any error is swallowed with `console.error`. The fetch of today's appointments is initiated *after* this call resolves (or rejects), so the list reflects freshly-expired appointments. Concretely: the `useQuery` for appointments has `enabled: processExpiredDone` where `processExpiredDone` is a `useState` boolean flipped in the effect.

**Alternative considered:** Call `processExpired` as part of the `queryFn`. Rejected — it would refire on every 60-second refetch; it should only run once on mount.

### Decision 4 — AppointmentDetailPanel is rendered at page level, not inside DoctorColumn

The panel slides in from the right and overlaps the main content. If rendered inside a `DoctorColumn`, it would be clipped by the column's overflow container. Page-level rendering with `position: fixed` avoids all overflow/clip issues. Selected appointment ID is state lifted to `AdminDashboardPage`.

### Decision 5 — Cancel always flows through CancelWithReasonForm

The cancel button on both `AppointmentCard` and `AppointmentDetailPanel` does not call the mutation directly. It sets a `cancellingId` state that causes `CancelWithReasonForm` to render (inline in panel on desktop, bottom sheet on mobile). The form is the only callsite for `cancel(id, reason)`. This ensures the constraint "cancel always requires a reason" is enforced structurally, not by convention.

### Decision 6 — Search is in-memory, not debounced API

All today's appointments are already fetched. Search filters `patientName` and `patientPhone` client-side on the already-loaded array. No debounce needed — the array is small (< ~50 items). No API call on keystroke.

### Decision 7 — testimonialsService.getAll is a new method, not a change to existing methods

`getApproved()` is used by the public home page and must not change. The admin variant — `getAll(includePending: boolean)` — passes `?includePending=true` as a query param. The Axios interceptor already attaches the Bearer token, so the admin-only endpoint works automatically.

### Decision 8 — Mobile bottom sheet for detail panel

On mobile, tapping an `AppointmentCard` opens the detail content inside a bottom sheet (fixed bottom panel that slides up, with a dark backdrop). This is the same content as the desktop panel but without the fixed right-side positioning. The bottom sheet is managed by `selectedAppointmentId` state at the page level, same as the desktop panel.

### Decision 9 — WalkInBookingModal doctor selection

The walk-in form shows the two doctors fetched by `useAdminAppointments` as simple radio cards (name + specialty). No additional doctor fetch is needed.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `process-expired` blocks appointment fetch on slow backends | The `enabled: processExpiredDone` gate means appointments only load after `processExpired` resolves/rejects. Effect has no timeout — acceptable for an internal tool on a reliable network. |
| 60s polling causes jarring re-renders if user is mid-interaction | TanStack Query's background refetch does not reset UI state. `selectedAppointmentId` is component state — it persists across refetches. |
| Stitch uses `IN PROGRESS` status — our API doesn't have it | Replace with "Confirmed + Checked In" (status: Confirmed, checkedInAt != null). No API change needed. |
| testimonialsService lacks `getAll(includePending)` | Add the method in the implementation. One-line addition, no breaking change. |
| `formatDistanceToNow` from `date-fns` — already installed (used by `date-fns-tz`) | No new dependency. |
| Mobile bottom sheet z-index conflicts with FAB | FAB is `z-50`; bottom sheet is `z-50` with a backdrop; FAB hides when bottom sheet is open (`selectedAppointmentId != null`). |

## Migration Plan

1. Extend `testimonialsService` — add `getAll(includePending)`.
2. Create 3 hooks in `src/hooks/`.
3. Create 11 components in `src/pages/admin/components/`.
4. Replace `AdminDashboardPage` stub.
5. Run `npm run build` — confirm zero TypeScript errors.
6. Manual smoke test.

Rollback: revert the commit. No state to migrate.

## Open Questions

No open questions — all ambiguities resolved in the spec via user-provided constraints and Stitch design reference.
