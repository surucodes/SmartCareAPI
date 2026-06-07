## Why

`/doctor` is a `ProtectedRoute` that redirects authenticated `Doctor` users to a stub page (`<div>DoctorSchedulePage — not yet implemented</div>`). Doctors who log in have no usable surface — they can see their schedule via the admin dashboard only by accident (the admin route is role-gated), so today they cannot do their job in the SmartCare UI at all. The doctor portal is the missing third pillar of the staff experience alongside the public booking flow and the admin dashboard.

The portal is a focused, single-doctor view: only the logged-in doctor's appointments, only the actions a doctor needs (confirm, complete, cancel-with-reason, reschedule), and none of the admin-only actions (check-in, mark no-show, walk-in booking).

## What Changes

- Replace the `DoctorSchedulePage` stub with a full portal.
- **2 new hooks** in `src/hooks/`: `useDoctorSchedule`, `useDoctorAppointmentActions`.
- **8 new components** in `src/pages/doctor/components/`: `DoctorSidebar`, `DoctorTopBar`, `WeekStrip`, `DoctorAppointmentCard`, `DoctorRescheduleForm`, `DoctorCancelForm`, `StatusFilterPills`, and a mobile bottom-sheet navigation embedded in the page.
- Doctor-identity resolution: since the JWT does not include `doctorId` and the `Doctor` model has no `email` field, a first-load **doctor selector** lets the logged-in user pick which doctor record is theirs. Selection persists in `sessionStorage` keyed to the JWT for the session.
- Doctor-scoped action state machine: a single helper drives which buttons appear on each card. No Check In, no No Show, no Walk-In Booking anywhere in the doctor view.
- Week-strip date navigator with appointment-presence dots, status filter pills (All / Confirmed / Pending / Cancelled), and a "PAST & CLOSED" divider section when "All" is active.

## Capabilities

### New Capabilities
- `doctor-portal`: defines the doctor-facing schedule view — layout, identity resolution, data scoping, state machine for doctor actions, filters, and inline forms.

### Modified Capabilities
<!-- None — admin-dashboard and staff-authentication are unchanged. -->

## Impact

- **Code**: `SmartCareUI/src/pages/doctor/DoctorSchedulePage.tsx` (replace stub); 8 new components in `SmartCareUI/src/pages/doctor/components/`; 2 new hooks in `SmartCareUI/src/hooks/`.
- **Routing**: no change — `/doctor` already registered with `ProtectedRoute requiredRole="Doctor"`.
- **APIs**: uses existing endpoints — `GET /api/doctors`, `GET /api/appointments/doctor/{doctorId}?includePast`, `POST /api/appointments/process-expired`, `PATCH /api/appointments/{id}/status`, `POST /api/appointments/{id}/reschedule`. No backend changes.
- **Dependencies**: none. Reuses TanStack Query v5, React Hook Form + Zod (forms in the cancel/reschedule subforms), and `date-fns` / `date-fns-tz`.
- **Backwards compatibility**: Stub `DoctorSchedulePage` had no users — replacing it is non-breaking.

## Out of Scope (Flagged)

- **Backend JWT change to include `doctorId`**: the cleaner long-term path is to add a `doctorId` claim and return it from `POST /api/auth/login`, so doctors don't need to select themselves on first login. That's a backend + login-page change of its own. This proposal ships the frontend-only sessionStorage fallback.

## Visual Reference

The Stitch designs at `SmartCareUI/StitchComponentCode/DoctorView/` (`Desktop.html`, `mobile.html`, `Reschedule.html`) are used as visual reference for layout and component styling. Two intentional deviations from Stitch are applied per the written spec:

- **Stitch shows a "No Show" button on Confirmed cards** — removed. Doctors never mark no-show; the admin dashboard owns that action.
- **Stitch renders Q#1 on the first card** — only rendered when `queuePosition > 1` per spec, so a queue of one doesn't display a pill.

All other visual cues (two-column card layout, leading-dot status pills, dashed action divider, italic gray notes block, two-letter initials avatars, plain text HH:MM time input) match the Stitch reference and are reflected in the design and tasks.
