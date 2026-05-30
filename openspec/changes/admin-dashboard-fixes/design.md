## Context

`admin-dashboard` is a single archived OpenSpec change that produced the admin shell. The current code:
- `AppointmentCard` and `AppointmentDetailPanel` both compute action buttons inline; the rules diverge slightly (the panel was written first, the card later).
- `useAdminAppointments` hardcodes `appointmentsService.getAll(false)` — today + future, no past.
- `AdminTopBar` has no date control.
- `AppointmentDetailPanel`'s error banner surfaces whatever the most-recent action error is, including 409 from `checkIn`.
- The dashboard's outer container is `h-screen overflow-hidden`, but several nested children miss the `overflow-hidden` they need to keep the schedule canvas the only scroll surface.
- `AllAppointmentsView` (a stub inside `AdminDashboardPage.tsx`) renders `doctorId.slice(-6)` directly.
- Some timestamps render in the UI without IST formatting (the check-in section in the detail panel was the worst offender, but spot-check covers cancellation/createdAt too).
- The card has no visual change when selected.

The `staff-authentication` capability already exists from `login-page-and-auth-flow`; this change simply adds a navigation entry-point to it from the public site.

## Goals / Non-Goals

**Goals:**
- Single source-of-truth function for button visibility shared by card and panel.
- Distinguishable per-action button colours, consistent in both surfaces.
- Day-ahead and day-back schedule view via top-bar arrows.
- Sidebar and top bar lock; only the schedule canvas scrolls.
- All UTC timestamps formatted via `formatTimestamp()` (IST).
- Selected-card highlight tied to `selectedAppointmentId`.
- `Staff Login` reachable from the public header.

**Non-Goals:**
- Multi-day range view (week, month) — single-day selection only.
- Real-time updates beyond the existing 60s polling — no WebSocket.
- Audit log of staff actions — out of scope.
- Persisting selected date across reloads — session state only, defaults to today.
- New backend endpoints — uses existing `appointmentsService.getAll(includePast)`.

## Decisions

### Decision 1 — Single `getActionButtons(appointment)` helper, used by both card and panel

The button visibility rules drift between `AppointmentCard` and `AppointmentDetailPanel` today. Replace with a single pure helper in a shared module:

```ts
// src/pages/admin/components/appointment-actions.ts
export type ActionId = 'confirm' | 'checkIn' | 'complete' | 'noShow' | 'cancel'
export function getActionButtons(a: Appointment): ActionId[] { ... }
```

The card and panel both call this helper and render the returned IDs. They differ only in button size and layout, not in *which* buttons appear. This makes Fix 3 a one-place change and prevents future drift.

**Alternative considered:** Inline duplication with a comment "keep in sync". Rejected — already drifted once.

### Decision 2 — Per-action colour palette as Tailwind classes, no config changes

The existing `tailwind.config.js` covers the teal palette already. For amber and dark green I'll use Tailwind's built-in `amber-700` (`#B45309`, close to spec's `#B8860B`) and `emerald-800` (`#065F46` exact) — both shipped in default Tailwind. No config change needed.

Mapping the spec to classes:

| Action | Idle | Hover |
|---|---|---|
| Confirm  | `bg-teal-600 text-white`     | `hover:bg-teal-800` |
| Check In | `bg-amber-600 text-white`    | `hover:bg-amber-800` |
| Complete | `bg-emerald-800 text-white`  | `hover:bg-emerald-900` |
| No Show  | `border border-gray-300 text-gray-700 bg-white` | `hover:bg-gray-50` |
| Cancel   | `border border-red-300 text-red-600 bg-white`   | `hover:bg-red-50` |

**Note on amber:** spec lists `#B8860B` (dark goldenrod). Tailwind `amber-600` is `#D97706`, `amber-700` is `#B45309`. `amber-700` is closer to spec — I'll use it. This is a one-line decision and I'll flag it in the implementation summary.

### Decision 3 — Button visibility state machine

Encoded in `getActionButtons` as a single switch on `status`:

| status      | checkedInAt    | buttons (in order)              |
|---           |---             |---                              |
| Pending     | null           | Confirm, Check In, Cancel       |
| Pending     | not null       | Confirm, Complete, Cancel       |
| Confirmed   | null           | Check In, No Show, Cancel       |
| Confirmed   | not null       | Complete, No Show, Cancel       |
| Completed   | (any)          | (none — read only)              |
| Cancelled   | (any)          | (none — read only)              |
| NoShow      | (any)          | (none — read only)              |

The first item in the array is the visual "primary" (full-width or larger emphasis in the panel; first slot in the card row).

### Decision 4 — Silent 409 on Check In, inline error for everything else

`useAppointmentActions.checkIn` already exposes an `error` string. Update the surfacing logic in `AppointmentDetailPanel` so the error banner skips Check-In's `error` whenever the failure is a 409. The hook returns the error as a string today, so I'll widen its return shape to include the HTTP status, or check `error?.includes('already')` — preferable to add a status field.

Concrete: change `useAppointmentActions` to return `{ isPending, error: { message, status } | null }` for each mutation; `AppointmentDetailPanel` filters out `checkInState.error?.status === 409` from its combined error display, and triggers `refetch()` in `onError` for that case.

**Alternative considered:** Catch the 409 in the hook and resolve as success. Rejected — it would falsely report Check In as succeeded; better to refetch + suppress UI noise.

### Decision 5 — Date selection state lives in the page, filter is client-side

`useAdminAppointments` is broadened to accept a `selectedDate: string` argument:
- If `selectedDate < getTodayIST()` → call `getAll(true)` (include past)
- Otherwise → call `getAll(false)` (today + future)
- After fetch, filter `appointments.filter(a => a.date === selectedDate)` and group by doctor.

The query key becomes `['admin-appointments', selectedDate]` so day-switching invalidates correctly. 60s polling continues for *the currently selected day*. When the user changes the day, the new key picks up the new fetch.

**Alternative considered:** Switch to a server-side date filter. The backend `GET /api/appointments` doesn't currently expose a `date` query param, and adding one is out of scope. Client-side filter from `getAll` is acceptable given the small daily volume.

### Decision 6 — Scroll lock by explicit overflow at every level

The fix is mechanical: every container in the desktop tree gets explicit `overflow-hidden` and the schedule canvas is the only `overflow-y-auto`. Concretely:

- `<div class="flex h-screen overflow-hidden">` (page outer — already correct)
- `<aside>` (sidebar) — `h-full overflow-y-auto` (allows internal scroll if needed, but doesn't bleed)
- `<main class="flex-1 flex flex-col min-w-0 overflow-hidden">` — add `overflow-hidden`
- `<AdminTopBar>` — already `sticky` but inside an `overflow-hidden` main, it becomes a flex item with `shrink-0`; convert from `sticky` to a flex-item with `shrink-0` to keep behaviour predictable
- Schedule canvas wrapper — `flex-1 overflow-y-auto`

Detail panel: stays `fixed right-0 top-0 h-full` with its own internal `overflow-y-auto`.

### Decision 7 — IST timestamps everywhere

Audit and replace any direct ISO/UTC string rendering with `formatTimestamp(iso)`:
- `AppointmentDetailPanel`: check-in line, cancelled-at line, created-at "Booked at" line (new).
- `AppointmentCard`: completed/cancelled bottom-note timestamps (already use `formatTimestamp` — verify).
- `AllAppointmentsView` (in `AdminDashboardPage.tsx`): if any UTC strings show up, route them through `formatTimestamp`.

### Decision 8 — Selected-card highlight

The card already accepts a `selected: boolean` prop in principle but isn't wired. Concretely:
- Add `selected: boolean` prop to `AppointmentCard`.
- Apply additional classes when `selected`: `ring-2 ring-teal-600 bg-teal-50`. Keep the existing left border.
- `DoctorColumn` passes `selected={appointment.id === selectedAppointmentId}` — it needs a new `selectedAppointmentId` prop.
- `AdminDashboardPage` passes `selectedAppointmentId` down through `DoctorColumn`.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Adding `selectedDate` to `useAdminAppointments` is a breaking signature change for its single caller. | Caller is updated in the same change; no external consumers exist. |
| `appointmentsService.getAll(true)` could return a very large list for established hospitals. | At the current data volume this is acceptable. Server-side date filtering can ship later as a separate change. |
| Tailwind built-in `amber-700` is darker than spec's `#B8860B`. | One-line deviation, flagged in summary. If product objects, swap to inline `style={{ backgroundColor: '#B8860B' }}`. |
| Suppressing the 409 entirely could mask a real bug. | The hook logs the 409 to `console.error` and triggers `refetch()` — the data reconciles silently. Developers still see the 409 in DevTools network panel. |
| Date navigator label parsing must handle locale safely. | Uses existing `formatDisplayDate` + `getDayName` from `date.utils.ts` — already locale-stable. |
| Selected-card highlight conflicts with the existing left-status-border. | Both apply simultaneously — ring goes outside the border. Visually layered correctly per Tailwind's box-shadow ordering. |

## Migration Plan

1. Add `appointment-actions.ts` shared helper module.
2. Add `selected` prop to `AppointmentCard`; wire through `DoctorColumn` and `AdminDashboardPage`.
3. Refactor button rendering in `AppointmentCard` and `AppointmentDetailPanel` to use the shared helper + new colour palette.
4. Update `useAppointmentActions` error shape to include status; `AppointmentDetailPanel` suppresses 409 from Check In and triggers a silent refetch.
5. Add `selectedDate` parameter to `useAdminAppointments`; broaden fetch logic per Decision 5.
6. Add date-navigator UI to `AdminTopBar` and `MobileTabBar`; lift `selectedDate` to `AdminDashboardPage`.
7. Apply scroll-lock layout adjustments.
8. Fix `AllAppointmentsView` to render doctor names from the doctors array.
9. Audit and replace any UTC string rendering with `formatTimestamp`.
10. Add `Staff Login` link to public `Header.tsx` desktop nav and mobile drawer.
11. `npm run build` — verify zero TS errors.

Rollback: revert the commit. No data migration.

## Open Questions

No open questions.
