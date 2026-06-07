## Context

`/doctor` is a `ProtectedRoute requiredRole="Doctor"` (see `src/router/ProtectedRoute.tsx` and `src/router/index.tsx`) that currently renders a stub. The supporting infrastructure for the doctor portal is already in place:

- `AuthContext.useAuth()` exposes the logged-in user with `email`, `role`, `token`.
- `appointmentsService.getByDoctor(doctorId, includePast)` already scopes appointments per-doctor on the backend.
- `appointmentsService.updateStatus`, `cancel`, `reschedule`, `processExpired` are wired.
- `doctorsService.getAll()` returns both doctor records.

One complication shapes the design:

- **The JWT does not include `doctorId`** (inspected `SmartCare.API/Controllers/AuthController.cs`: claims are `sub`, `email`, `role`, `jti` only). The `Doctor` model has no `email` field, so the frontend cannot derive `doctorId` from `user.email` and the doctor list alone.

A Stitch visual reference is available at `SmartCareUI/StitchComponentCode/DoctorView/` (`Desktop.html`, `mobile.html`, `Reschedule.html`). The reference informs layout and styling; the spec's behavioural corrections override it where they conflict.

The action set on each card is strictly smaller than the admin dashboard's: doctors do not check-in patients, do not mark no-show, and do not create walk-ins. A shared action-button helper similar to admin's `appointment-actions.ts` is the cleanest pattern, but with a doctor-only state machine.

## Goals / Non-Goals

**Goals:**
- A doctor logs in, sees their own appointments for today, and can confirm / complete / cancel-with-reason / reschedule each one.
- Date navigation via a sticky week strip with appointment-presence dots.
- Filter pills (All / Confirmed / Pending / Cancelled) to slice the day's appointments.
- "All" view shows active appointments first, then a "PAST & CLOSED" section beneath a divider with reduced-opacity cards.
- 60-second polling on the date-scoped query, with silent `processExpired()` on mount.
- Strict role-scoped data: no other doctor's appointments ever reach the client for this user.

**Non-Goals:**
- Backend changes to the JWT or login response (out of scope; flagged in proposal).
- Patient-history view, multi-day calendar grid, week/month export — out of scope.
- A doctor analytics dashboard — separate change.
- Persistent doctor-selection beyond the current session — sessionStorage by design (resets on logout / new login).
- Inline editing of patient notes — read-only.

## Decisions

### Decision 1 — Doctor-identity resolution via sessionStorage selector

Because the JWT does not carry `doctorId`, the page determines which doctor record belongs to the logged-in user with this fallback chain:

1. Read `sessionStorage.getItem('smartcare:doctorId:' + tokenHash)` where `tokenHash` is a short hash of `user.token` (or just `user.email` — same uniqueness per session). If present, use it.
2. Otherwise, fetch all doctors via `doctorsService.getAll()`. If exactly one doctor exists, auto-select it.
3. Otherwise (≥ 2 doctors, no prior selection), render a one-time **doctor selector** screen: a card per doctor with photo + name + specialty. The doctor taps their card; the selection is written to sessionStorage and the page renders.

**Why sessionStorage and not localStorage?** Session-scoped is safer — selection resets on tab close or logout, so a shared device doesn't carry the wrong doctor's identity into the next session.

**Alternative considered:** Add `doctorId` to the JWT (backend change). Rejected for this PR — out of scope. Tracked in proposal as out-of-scope follow-up.

### Decision 2 — Shared doctor-action helper

Create `src/pages/doctor/components/doctor-actions.ts` exporting:

```ts
export type DoctorActionId = 'confirm' | 'complete' | 'cancel' | 'reschedule'
export function getDoctorActions(a: Appointment): {
  primary: DoctorActionId[]   // shown as buttons
  hasReschedule: boolean      // shown as subtle text link below buttons
}
```

State machine (single source of truth for the doctor card):

| status      | checkedInAt   | primary buttons              | reschedule link |
|---           |---            |---                           |---              |
| Pending     | null          | confirm, cancel              | yes             |
| Pending     | not null      | confirm, complete, cancel    | yes             |
| Confirmed   | null          | cancel                       | yes             |
| Confirmed   | not null      | complete, cancel             | yes             |
| Completed   | (any)         | —                            | no              |
| Cancelled   | (any)         | —                            | no              |
| NoShow      | (any)         | —                            | no              |

Reschedule is intentionally an underlined text link, not a primary button — it's a back-office action, not a happy-path one.

**Why a separate helper from admin's `appointment-actions.ts`?** The state machines are *different* (doctors don't get Check In or No Show), and combining them with a `role` parameter would require runtime branching where a type-level distinction is clearer. Two helpers, two namespaces.

### Decision 3 — Doctor button palette mirrors admin's where actions overlap

Confirm = teal-filled, Complete = emerald-800, Cancel = red-outlined. These are the same Tailwind classes used by `BUTTON_PALETTE` in the admin's `appointment-actions.ts`. No Check In or No Show classes needed.

To avoid duplication, the doctor helper imports `BUTTON_PALETTE` from the admin module and references only the subset it uses (`confirm`, `complete`, `cancel`). Importing from a sibling under `src/pages/admin/` from a doctor page is a minor coupling but acceptable — both views are staff-only and share design tokens. If we want stricter separation later, the palette moves to `src/utils/` and both pages import from there.

### Decision 4 — Single `useDoctorSchedule` hook owns date, filter, week-strip, and data

This hook is the analogue of admin's `useAdminAppointments` plus the page-level date/filter state lifted in. It returns:

- `appointments` — the date-filtered, status-filtered, sorted array for the cards
- `allAppointments` — unfiltered raw fetch (used to derive week-strip dots)
- `daysWithAppointments: Set<string>` — derived from `allAppointments` for fast O(1) dot lookup
- `selectedDate`, `selectedFilter`, `currentWeekStart` and their setters
- `doctor` — the resolved doctor record
- `refetch`, `isLoading`, `isError`

**Two parallel queries:**

- `['doctor-day', doctorId, selectedDate]` → `getByDoctor(doctorId, includePast)` where `includePast = selectedDate < today`. Filtered to `a.date === selectedDate`. 60s refetch.
- `['doctor-month', doctorId, monthYearKey]` → `getByDoctor(doctorId, true)` for week-strip dots. Refetched once per month visible; staleTime longer (5 min).

The month query backs the dot indicator. Polling on the day query keeps the visible day fresh.

**Why two queries?** The dot indicator needs broader data than the visible day, but doesn't need 60-second freshness. Splitting prevents unnecessary refetches of the full per-doctor list when the day changes.

### Decision 5 — Filter logic is in the hook, not the component

The hook applies the filter rule:

- `upcoming` → Pending + Confirmed
- `confirmed` → Confirmed only
- `pending` → Pending only
- `cancelled` → Cancelled + NoShow
- `all` → Pending + Confirmed first, then Completed + Cancelled + NoShow (sentinel item between groups, or two arrays exposed: `activeAppointments`, `pastAppointments`).

The "All" case returns two arrays so the page can render the `PAST & CLOSED` divider between them. Specific-status filters return one array.

### Decision 6 — Mobile layout: no bottom tab bar

Spec is explicit: "No bottom tab bar anywhere in doctor view. This is a staff tool, not a patient app." Mobile gets a sticky top bar + hamburger that opens a bottom-sheet nav with the sidebar items.

### Decision 7 — Inline forms, never modals

`DoctorCancelForm` and `DoctorRescheduleForm` expand inline below the card content (same card, vertical-flow within the card's footer). At most one is open per card — opening one closes the other via card-local state.

This matches the admin pattern but is more constrained (mobile and desktop both render inline; no `mobile` prop is needed).

### Decision 8 — `processExpired` on mount, silent failure

Fire-and-forget `useEffect` calls `appointmentsService.processExpired()` once. Errors caught and logged to console. The day query is gated `enabled: processExpiredDone` so freshly-expired appointments are reflected in the first paint, same pattern as the admin dashboard.

### Decision 9 — Patient avatars are initials only

The backend exposes no patient photo URL (verified — `Appointment.types.ts` has none). The card renders a 2-letter initial circle (gray bg, teal text) computed from `patientName`. Helper: take the first letter of the first word + the first letter of the last word; if single word, take the first two letters.

### Decision 10 — Reschedule time is a free text HH:MM input

Spec is explicit: no time picker. Plain `<input type="text" inputMode="numeric" placeholder="e.g. 14:30">` with regex validation `/^\d{2}:\d{2}$/`. Sent verbatim as `slot` to the backend, which validates against the doctor's schedule. Confirmed against `mobile.html` and `Reschedule.html` — Stitch uses the same plain text input.

### Decision 11 — Card layout: two columns on desktop, stacked on mobile

The Stitch desktop card lays out two columns separated by a vertical divider:

- **Left column** (`min-w-[120px] md:border-r border-outline-variant md:pr-6`): slot time bold + queue pill `Q#N` directly beneath.
- **Right column** (`flex-1`): status pill row, patient avatar + name row, notes block (indented to align with name, not avatar), then the dashed-border action strip with buttons + reschedule link.

On mobile (`mobile.html`), the columns collapse: the left "column" becomes a horizontal top strip (time on the left, status pill / Q# on the right) separated by a horizontal `border-b` from the patient details below.

Implementation:

```
<div className="flex flex-col md:flex-row gap-6">
  <div className="flex flex-row md:flex-col items-center md:items-start
                  justify-between md:justify-start min-w-[120px]
                  md:border-r border-outline-100 md:pr-6
                  border-b md:border-b-0 pb-4 md:pb-0">
    {/* time + Q# pill */}
  </div>
  <div className="flex-1">
    {/* status pill row, patient row, notes, actions */}
  </div>
</div>
```

This is the only structural detail Stitch contributes that the original spec didn't pin down. The behavioural spec (button visibility, IST timestamps, etc.) remains the authority.

### Decision 12 — Stitch-to-project token mapping

Stitch uses Material 3 design tokens that don't exist in our Tailwind config. The mapping for visible doctor-view styles:

| Stitch token              | Project equivalent          | Hex           |
|---                        |---                          |---            |
| `primary` (dark green)    | `brand-dark` / `teal-800`   | `#132b1a` / `#085041` |
| `on-primary`              | white                       | `#FFFFFF`     |
| `primary-fixed` (status pill bg) | `teal-100`           | `#9FE1CB`     |
| `on-primary-fixed-variant` (status pill text) | `teal-800`  | `#085041`     |
| `secondary` (amber accent) | `brand-gold`               | `#C9A227`     |
| `secondary-fixed-dim` (checked-in pill bg) | `amber-200` | approx       |
| `on-secondary-fixed-variant` (checked-in pill text) | `amber-900` | approx |
| `surface-container-lowest` (card bg) | `white`           | `#FFFFFF`     |
| `surface-container-low` (sidebar nav hover bg) | `gray-50` | `#F9FAFB`   |
| `surface-container-high` (Q# pill bg) | `warm-200`       | `#EEECEA`     |
| `outline-variant` (borders) | `gray-100`                | `#F0F0F0`     |
| `on-surface-variant` (muted text) | `gray-500`          | —             |
| `text-muted` / `text-text-muted` | `gray-400`           | —             |
| `error` (cancel text) | `red-600`                       | —             |
| `error-container` (cancel hover bg) | `red-50`           | —             |

No new Tailwind config entries are required — all targets are in the default palette or already defined in `tailwind.config.js`.

### Decision 13 — Status pill with leading dot indicator

Stitch renders the status pill with a small circle dot at the leading edge ("● Confirmed"). This is a more legible variant of the admin's plain text pill. Implementation:

```jsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                 text-[11px] font-semibold tracking-wide
                 bg-teal-100 text-teal-800">
  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" aria-hidden="true" />
  Confirmed
</span>
```

The "Checked In" pill (separate from status) renders with a small check-circle SVG instead of a dot, in the amber palette.

### Decision 14 — Stitch's "No Show" button is omitted

Stitch shows a "No Show" button next to "Complete" on Confirmed-checked-in cards. Per the written spec, doctors do not mark no-show; that is an admin/front-desk responsibility. The implementation omits the button. This is the single deliberate behavioural deviation from Stitch and is documented in the proposal under "Visual Reference".

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Doctor selector is a manual one-time step on first login per browser session. | Acceptable for a 2-doctor clinic. Backend JWT change is the clean fix and tracked as out-of-scope. |
| sessionStorage entry leaks if doctor logs out without clearing it. | Clear `smartcare:doctorId:*` keys in `AuthContext.logout()`. Add this to the implementation. |
| Two parallel queries (`doctor-day` + `doctor-month`) double the network footprint vs admin's single. | One is heavily-cached (5-min stale); only the visible day polls. Net traffic is similar to admin. |
| If `doctorsService.getAll()` ever returns more than 2 doctors, the selector still works but becomes a longer list. | Acceptable — the selector renders all doctors as cards in a grid. |
| Coupling: doctor module imports `BUTTON_PALETTE` from admin module. | Documented in Decision 3. If decoupling is desired later, move palette to `src/utils/`. |
| `processExpired` runs at every doctor session start — small write traffic. | Same pattern as admin, accepted there. |
| `getByDoctor(doctorId, true)` for the month query returns all-time appointments for that doctor. For a long-lived clinic this could grow large. | Acceptable at current scale. Server-side date-range filter is a future change if the list grows past several hundred entries. |

## Migration Plan

1. Create `src/pages/doctor/components/doctor-actions.ts` (helper + state machine).
2. Create `src/hooks/useDoctorSchedule.ts` and `src/hooks/useDoctorAppointmentActions.ts`.
3. Create 7 components in `src/pages/doctor/components/`.
4. Implement the doctor selector inside `DoctorSchedulePage.tsx` (small inline component, not a separate file).
5. Replace `DoctorSchedulePage.tsx` stub with the full page.
6. Optional: add sessionStorage cleanup to `AuthContext.logout()` for `smartcare:doctorId:*` keys.
7. `npm run build` — verify zero TS errors.

Rollback: revert the commit. No data migration; sessionStorage entries are session-scoped.

## Open Questions

No open questions. The doctor-identity resolution choice (sessionStorage selector) is documented as a known trade-off pending the backend JWT change.
