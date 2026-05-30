## Why

The admin dashboard shipped in `admin-dashboard` covers the operational basics but has nine identified gaps: staff have no way to reach `/login` from the public site without typing the URL; uniform teal buttons make it hard to distinguish Confirm vs Check-In vs Complete at a glance; the button state machine is wrong (notably, Check In can show after a patient is already checked in, producing a confusing 409); appointments can only be viewed for today, blocking day-ahead confirmation; the whole page scrolls instead of just the schedule area; the All Appointments table shows raw `ObjectId` fragments instead of doctor names; and check-in timestamps render as raw UTC. These are not new features — they are correctness and polish fixes that block daily use of the dashboard.

## What Changes

- **Public Header**: add a subtle "Staff Login" link to the right of the desktop nav (before "Book Now") and append it to the mobile drawer beneath a divider.
- **Button colour system**: introduce a per-action colour palette across `AppointmentCard` and `AppointmentDetailPanel` — Confirm teal, Check In amber, Complete dark green, No Show gray outlined, Cancel red outlined.
- **Button state machine**: rewrite the visibility rules for action buttons. Status × `checkedInAt` is the single source of truth; Check In is never shown once `checkedInAt` is set.
- **Suppress the 409 "already checked in" toast**: removing the Check-In button when `checkedInAt` is set means this error is now unreachable in normal flow; if it ever fires (race), silently refetch instead of surfacing the error.
- **Date navigation in top bar**: a `[← prev] [date label] [next →]` control next to the search bar selects which day's appointments to display. The label is clickable to reset to today. Selection state lives in the page and is passed down to the schedule view; the date filter is applied client-side from the existing `appointmentsService.getAll()` result. Mobile top bar replaces its short-date display with the same compact control.
- **Scroll behaviour**: lock the sidebar and top bar; only the schedule canvas scrolls.
- **All Appointments table**: replace the "Doctor ID" column with "Doctor" and render `doctor.name` (looked up from the already-fetched doctors array). Unmatched IDs render as "Unknown Doctor" in gray.
- **Timestamp formatting**: every UTC timestamp in the admin UI passes through `formatTimestamp()` from `date.utils.ts` to render in IST.
- **Selected-card highlight**: when the detail panel is open, the corresponding card gets a 2px teal border on all four sides and a `teal-50` background tint; reverts on close.

## Capabilities

### New Capabilities
<!-- None — all changes refine existing capabilities. -->

### Modified Capabilities
- `admin-dashboard`: button colour system, button visibility state machine, date navigation, scroll lock, doctor-name resolution in All Appointments, IST timestamp formatting, and selected-card highlight.
- `homepage-navigation`: header gains a "Staff Login" entry (desktop nav + mobile drawer).

## Impact

- **Code**: `SmartCareUI/src/components/layout/Header.tsx`; `SmartCareUI/src/pages/admin/AdminDashboardPage.tsx`; `SmartCareUI/src/pages/admin/components/AppointmentCard.tsx`; `SmartCareUI/src/pages/admin/components/AppointmentDetailPanel.tsx`; `SmartCareUI/src/pages/admin/components/AdminTopBar.tsx`; `SmartCareUI/src/pages/admin/components/MobileTabBar.tsx`; `SmartCareUI/src/hooks/useAppointmentActions.ts` (silent 409 swallow); `SmartCareUI/src/hooks/useAdminAppointments.ts` (broaden fetch to support past dates); `SmartCareUI/tailwind.config.js` (add Complete dark-green token if not already addressable via existing palette).
- **Routing**: no change.
- **APIs**: no change — uses the existing `appointmentsService.getAll(includePast)`.
- **Dependencies**: none.
- **Backwards compatibility**: All changes are visual or behavioural refinements of an unreleased feature; no migration needed.
