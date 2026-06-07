## Why

`/admin` is a `ProtectedRoute` that redirects unauthenticated staff to `/login` — which is now implemented — but the destination itself (`AdminDashboardPage`) is still a stub. Authenticated admins land on a blank div. The admin dashboard is the primary operational tool for the hospital's front-desk and management staff: it shows today's appointment schedule per doctor, lets staff confirm, check in, complete, cancel, or mark no-show on any appointment, and surfaces pending testimonials for moderation.

## What Changes

- Replace the `AdminDashboardPage` stub with a fully operational dashboard.
- **3 new hooks**: `useAdminAppointments`, `useAppointmentActions`, `useTestimonialsAdmin`.
- **12 new components** across `src/pages/admin/components/`: `AdminSidebar`, `AdminTopBar`, `DoctorColumn`, `AppointmentCard`, `AppointmentDetailPanel`, `RescheduleForm`, `CancelWithReasonForm`, `WalkInBookingModal`, `SearchOverlay`, `TestimonialsView`, `MobileTabBar`.
- **1 service extension**: `testimonialsService` gains a `getAll(includePending: boolean)` method to fetch unapproved testimonials for admin moderation.
- `date.utils.ts` already has `getDayName()` — no change needed there.

## Capabilities

### New Capabilities
- `admin-dashboard`: Defines the operational admin dashboard — schedule view, appointment actions, testimonial moderation, walk-in booking, and search.

### Modified Capabilities
<!-- testimonialsService gains a new method but no existing requirement changes behaviour. -->

## Impact

- **Code**: `src/pages/admin/AdminDashboardPage.tsx` (replace stub); 11 new component files in `src/pages/admin/components/`; 3 new hook files in `src/hooks/`; `src/services/testimonials.service.ts` (add `getAll` method).
- **Routing**: No changes — `/admin` already registered and protected.
- **APIs**: All endpoints already implemented (`GET /api/appointments`, `GET /api/doctors`, `PATCH /api/appointments/:id/status`, `PATCH /api/appointments/:id/checkin`, `POST /api/appointments/:id/reschedule`, `POST /api/appointments/process-expired`, `GET /api/testimonials?includePending=true`, `PATCH /api/testimonials/:id/approve`).
- **Dependencies**: No new packages. Uses TanStack Query v5, React Hook Form + Zod, `date-fns` `formatDistanceToNow`.
- **Backwards compatibility**: Stub `AdminDashboardPage` had no users. Replacing it is non-breaking.
