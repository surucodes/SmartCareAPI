## 1. Service extension

- [x] 1.1 In `SmartCareUI/src/services/testimonials.service.ts`, add `getAll: (includePending: boolean) => api.get<Testimonial[]>('/api/testimonials', { params: { includePending } }).then(r => r.data)` as a new method. Do not remove or change `getApproved`.

## 2. `useAdminAppointments` hook

- [x] 2.1 Create `SmartCareUI/src/hooks/useAdminAppointments.ts`. Add `processExpiredDone: boolean` state (initially false). In a `useEffect` with empty deps, call `appointmentsService.processExpired()` then set `processExpiredDone(true)` in both `.then()` and `.catch()` (swallow error with `console.error`).
- [x] 2.2 Add `useQuery` for doctors: `queryKey: ['admin-doctors']`, `queryFn: doctorsService.getAll`, `staleTime: Infinity` (doctors don't change during a session).
- [x] 2.3 Add `useQuery` for appointments: `queryKey: ['admin-appointments-today']`, `queryFn: () => appointmentsService.getAll(false)`, `enabled: processExpiredDone`, `refetchInterval: 60000`, `staleTime: 0`.
- [x] 2.4 Derive `appointmentsByDoctorId: Record<string, Appointment[]>` by grouping the appointments array using `doctor.id` keys from the doctors array. Initialize each key to an empty array so columns always render.
- [x] 2.5 Expose `{ doctors, appointmentsByDoctorId, isLoading, isError, refetch }` where `isLoading` is true when either query is loading and `refetch` calls the appointments query's `refetch`.

## 3. `useAppointmentActions` hook

- [x] 3.1 Create `SmartCareUI/src/hooks/useAppointmentActions.ts`. Accept `refetch: () => void` as a parameter. Import `appointmentsService`.
- [x] 3.2 Implement `confirm(id)` → `useMutation` calling `appointmentsService.updateStatus(id, { status: 'Confirmed' })`. `onSuccess`: call `refetch()`. `onError`: surface error string.
- [x] 3.3 Implement `complete(id)` → same pattern with `status: 'Completed'`.
- [x] 3.4 Implement `markNoShow(id)` → same pattern with `status: 'NoShow'`.
- [x] 3.5 Implement `cancel(id, reason)` → `useMutation` calling `appointmentsService.updateStatus(id, { status: 'Cancelled', cancelledBy: 'Admin', cancellationReason: reason })`. `onSuccess`: call `refetch()`.
- [x] 3.6 Implement `checkIn(id)` → `useMutation` calling `appointmentsService.checkIn(id)`. `onSuccess`: call `refetch()`.
- [x] 3.7 Implement `reschedule(id, dto)` → `useMutation` calling `appointmentsService.reschedule(id, dto)`. `onSuccess`: call `refetch()`.
- [x] 3.8 Each mutation exposes `isPending` and `error` (string | null). Helper `toActionError(err: unknown): string | null` — extract `err?.response?.data?.error` or fall back to generic message.
- [x] 3.9 Expose all six action functions plus their `isPending`/`error` pairs. No `any` — use `isAxiosError` from `axios` for type narrowing in the error helper.

## 4. `useTestimonialsAdmin` hook

- [x] 4.1 Create `SmartCareUI/src/hooks/useTestimonialsAdmin.ts`. `useQuery` with `queryKey: ['admin-testimonials']`, `queryFn: () => testimonialsService.getAll(true)`.
- [x] 4.2 Maintain `dismissed: Set<string>` in `useState`. `dismiss(id)`: add to set, log `console.warn('Dismiss is client-side only — testimonial will reappear on refresh')`.
- [x] 4.3 `approve(id)`: optimistically filter the testimonial from the query data via `queryClient.setQueryData`, then call `testimonialsService.approve(id)`.
- [x] 4.4 Derive `pendingTestimonials`: filter query data by `!t.isApproved && !dismissed.has(t.id)`, sorted newest first by `t.date`.
- [x] 4.5 Expose `{ pendingTestimonials, pendingCount, isLoading, isError, approve, dismiss }`.

## 5. `AdminSidebar` component

- [x] 5.1 Create `SmartCareUI/src/pages/admin/components/AdminSidebar.tsx`. Props: `selectedNav`, `onNavChange(nav)`, `onAddAppointment()`. Fixed left, `w-[220px]`, full height, white bg, `border-r border-gray-100`, `flex flex-col`.
- [x] 5.2 Top section: Logo.png (h-8), "Spandana Hospital" in `font-bold text-brand-dark text-sm`, "Admin Dashboard" in `text-xs text-gray-400`, staff email from `useAuth().user?.email` in `text-xs text-gray-400 mt-1`.
- [x] 5.3 Nav items (4): "Today's Schedule" (calendar SVG), "All Appointments" (list SVG), "Testimonials" (quote SVG), "Settings" (gear SVG). Active item: `bg-teal-50 text-teal-800 border-l-2 border-teal-600`. Inactive: `text-gray-500 hover:bg-gray-50`.
- [x] 5.4 "Testimonials" nav item shows a count badge (amber) if `pendingCount > 0`. Accept `pendingCount: number` prop.
- [x] 5.5 Bottom: "+ Add Appointment" button (teal filled, full width, `min-h-[44px]`) calling `onAddAppointment()`. Logout button (red text, with SVG icon) calling `useAuth().logout()` then `navigate('/login', { replace: true })`.

## 6. `AdminTopBar` component

- [x] 6.1 Create `SmartCareUI/src/pages/admin/components/AdminTopBar.tsx`. Props: `onSearchFocus`, `onMarkExpired`, `processedCount: number | null`, `onDismissBanner`. Hidden on mobile (`hidden md:flex`). `h-14 bg-white border-b border-gray-100 sticky top-0 z-40`.
- [x] 6.2 Left: today's date as `"${getDayName(getTodayIST())}, ${formatDisplayDate(getTodayIST())}"` (e.g. "Saturday, 24 May 2026").
- [x] 6.3 Center: `<input>` rounded-full, gray bg, search SVG icon, placeholder "Search by patient name or phone...", `onFocus` calls `onSearchFocus`.
- [x] 6.4 Right: "Mark expired as No-Show" text button (clock SVG, small gray text). `onClick` calls `onMarkExpired`.
- [x] 6.5 If `processedCount` is not null: show dismissible banner directly below the top bar. `processedCount > 0`: "[n] appointments marked as No-Show". `processedCount === 0`: "No expired appointments found". Dismiss button calls `onDismissBanner`.

## 7. `DoctorColumn` component

- [x] 7.1 Create `SmartCareUI/src/pages/admin/components/DoctorColumn.tsx`. Props: `doctor: Doctor`, `appointments: Appointment[]`, `onCardClick(appointment: Appointment)`, `onAction` callbacks passed down to cards, `isLoading: boolean`.
- [x] 7.2 Column header (sticky): doctor photo (`doctor.photoUrl`) in 48px circle with initials fallback. Doctor name bold. Specialty in `text-xs font-semibold tracking-widest text-brand-gold uppercase`. Count badge: `bg-teal-800 text-white rounded-full px-2 text-sm font-bold`.
- [x] 7.3 Loading state: 3 skeleton cards — `animate-pulse bg-gray-100 rounded-xl h-28`.
- [x] 7.4 Empty state: calendar icon SVG + "No appointments today" in `text-sm text-gray-400 text-center py-8`.
- [x] 7.5 Appointments sorted by `slot` string ascending before render. Map over sorted array and render `<AppointmentCard>` for each.

## 8. `AppointmentCard` component

- [x] 8.1 Create `SmartCareUI/src/pages/admin/components/AppointmentCard.tsx`. Props: `appointment: Appointment`, `onClick()`, `onConfirm`, `onComplete`, `onMarkNoShow`, `onCancel`, `onCheckIn`. Each action prop is `() => void`.
- [x] 8.2 Card container: `bg-white rounded-xl border border-gray-100 border-l-4 cursor-pointer hover:shadow-md transition-all`. Left border color by status: Pending `border-l-amber-400`, Confirmed `border-l-teal-600`, Completed/Cancelled/NoShow `border-l-gray-300`. Reduced opacity (`opacity-70`) for Completed/Cancelled/NoShow.
- [x] 8.3 "Checked In" pill: visible only when `status === 'Confirmed' && checkedInAt !== null`. Render as a small `bg-teal-100 text-teal-800 rounded-full px-2 py-0.5 text-[10px] font-semibold` pill top-right of card.
- [x] 8.4 Row 1: `formatDisplayTime(appointment.slot)` bold + `appointment.consultationTypeName` small gray + status badge right. Status badge colours: Pending amber, Confirmed teal, Completed gray, Cancelled/NoShow gray.
- [x] 8.5 Row 2: `appointment.patientName` bold + patientType badge (`New`/`Returning` gray outlined pill) + queue position pill if `queuePosition > 1` (amber "Q#[n]").
- [x] 8.6 Row 3: `appointment.patientPhone` gray small + " • Follow-up" italic small if `appointment.isFollowUp`.
- [x] 8.7 Action buttons by status (match spec exactly — see `AppointmentCard` section in user spec). Primary button: teal filled `bg-teal-600 text-white`. Secondary outlined: `border border-gray-200 text-gray-700`. Cancel: `border border-red-300 text-red-600`. All buttons `min-h-[44px] text-sm font-medium rounded-lg`.
- [x] 8.8 Cancel button calls `onCancel` (which opens reason form) — NEVER calls cancel mutation directly.
- [x] 8.9 Entire card body (above buttons) is clickable via `onClick`. Buttons use `e.stopPropagation()` to prevent card click when a button is clicked.
- [x] 8.10 For Completed/Cancelled/NoShow: show timestamp. Completed: `formatTimestamp(appointment.checkedInAt ?? appointment.createdAt)` — use `createdAt` as fallback if backend doesn't return a separate completedAt. Cancelled: `formatTimestamp(appointment.cancelledAt!)`. These display in gray small text at the bottom.

## 9. `AppointmentDetailPanel` component

- [x] 9.1 Create `SmartCareUI/src/pages/admin/components/AppointmentDetailPanel.tsx`. Props: `appointment: Appointment | null`, `doctors: Doctor[]`, `onClose()`, `actions` (from `useAppointmentActions`), `onCancel(id)` (opens reason form at page level).
- [x] 9.2 When `appointment` is null: render nothing (return null).
- [x] 9.3 Fixed right panel: `fixed right-0 top-0 h-full w-[380px] bg-white border-l border-gray-100 shadow-xl z-50 flex flex-col overflow-y-auto`. Semi-transparent backdrop: `fixed inset-0 bg-black/20 z-40` rendered behind panel, clicking backdrop calls `onClose`.
- [x] 9.4 Panel header: status badge, `appointment.patientName` in `text-2xl font-bold`, appointment ID as "SH-[last8.toUpperCase()]" in `text-sm text-gray-400`, close button (X SVG, `min-h-[44px] min-w-[44px]`).
- [x] 9.5 Info grid (2-col): Date (`formatDisplayDate`), Time (`formatDisplayTime`), Doctor (look up from `doctors.find(d => d.id === appointment.doctorId)?.name`), Consultation type, Patient name, Phone, Email, Patient type, Referral (human-readable mapping), Follow-up, Queue position (only if > 1).
- [x] 9.6 Notes section: only render if `appointment.notes` is truthy. Label "PATIENT NOTES" in `text-xs font-semibold tracking-widest text-brand-gold`. Notes in a `bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 italic border border-gray-100`.
- [x] 9.7 Check-in section: only render if `appointment.checkedInAt` is not null. "Checked in at [formatTimestamp(checkedInAt)]" in teal small.
- [x] 9.8 Action section (bottom): same logic as card buttons but larger. Cancel → `onCancel(appointment.id)`. Reschedule → sets local `showReschedule` state to render `RescheduleForm` inline.
- [x] 9.9 Email side-effect note: amber small text shown for 3 seconds after confirm/cancel/complete actions. Use `useState<string | null>` for the note text + `useEffect` to clear it after 3000ms.
- [x] 9.10 Error banner: red bg, dismissible, shown when any action `error` is non-null. `role="alert"`.

## 10. `CancelWithReasonForm` component

- [x] 10.1 Create `SmartCareUI/src/pages/admin/components/CancelWithReasonForm.tsx`. Props: `onSubmit(reason: string): void`, `onKeep(): void`, `isPending: boolean`, `error: string | null`.
- [x] 10.2 Textarea "Reason for cancellation", `min-h-[80px]`, `placeholder="Please provide a reason..."`, max 200 chars. Show character counter `[n]/200` right-aligned below.
- [x] 10.3 "Keep Appointment" ghost button (gray outlined). "Confirm Cancellation" red filled button. Confirm disabled when textarea length < 5 or `isPending`. Show spinner in Confirm when `isPending`.
- [x] 10.4 If `error` is non-null: show `bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm` above buttons.

## 11. `RescheduleForm` component

- [x] 11.1 Create `SmartCareUI/src/pages/admin/components/RescheduleForm.tsx`. Props: `onSubmit(dto: RescheduleDto): void`, `onCancel(): void`, `isPending: boolean`, `error: string | null`, `successMessage: string | null`.
- [x] 11.2 Three fields: New Date (`type="date"`, `min={tomorrow}` where `tomorrow` is computed from `getTodayIST()` + 1 day using `date-fns` `addDays`), New Time (text, placeholder "HH:MM (e.g. 14:30)", pattern validation `/^\d{2}:\d{2}$/`), Reason (textarea, min 5 chars). All `min-h-[44px]`.
- [x] 11.3 "Reschedule" teal filled button disabled until all fields valid. "Cancel" ghost button. Inline error and success messages.

## 12. `WalkInBookingModal` component

- [x] 12.1 Create `SmartCareUI/src/pages/admin/components/WalkInBookingModal.tsx`. Props: `doctors: Doctor[]`, `onClose()`, `onSuccess(patientName: string): void`. Uses `useMutation` internally calling `appointmentsService.create()`.
- [x] 12.2 Full-screen overlay backdrop + centered modal card (`max-w-lg w-full bg-white rounded-2xl shadow-xl p-6`). Close button top-right.
- [x] 12.3 Heading "Walk-in Appointment" serif, subtext "Book an appointment for a patient at the desk."
- [x] 12.4 Doctor selector: two radio-style cards (`doctors.map`), clicking selects that doctor. Each card: doctor name + specialty.
- [x] 12.5 Consultation type pills: fetched per selected doctor via `doctorsService.getConsultationTypes(doctorId)` using `useQuery`. Pills render as `<button>` with teal active state.
- [x] 12.6 Fields: Date (`type="date"`, min today), Time slot (text "HH:MM"), Patient Name, Phone (`type="tel"`), Email (`type="email"`), Patient type toggle (New/Returning), Notes (textarea optional). All `min-h-[44px] text-base`.
- [x] 12.7 Use RHF + Zod for validation. Schema: doctor required, date required (≥ today), time `/^\d{2}:\d{2}$/`, name min 2, phone 10 digits, email valid.
- [x] 12.8 Submit calls `appointmentsService.create({ ...formValues, appointmentType: 'OPD', referralSource: 'Self', isFollowUp: false })`. On success: `onSuccess(patientName)` + `onClose()`. On error: show error inline.

## 13. `SearchOverlay` component

- [x] 13.1 Create `SmartCareUI/src/pages/admin/components/SearchOverlay.tsx`. Props: `appointments: Appointment[]`, `doctors: Doctor[]`, `onClose()`, `onSelectAppointment(appointment: Appointment): void`. Desktop: dropdown panel below search bar. Mobile: full-screen overlay.
- [x] 13.2 Input autofocused on open. Filter logic: `appointment.patientName.toLowerCase().includes(q.toLowerCase()) || appointment.patientPhone.replace(/\s/g, '').includes(q.replace(/\s/g, ''))`. No API call.
- [x] 13.3 Results: each row shows patient name + phone + `formatDisplayTime(slot)` + status badge + doctor name (looked up from `doctors` array). Clicking a row calls `onSelectAppointment(appointment)` + `onClose()`.
- [x] 13.4 Empty state: "No appointments found for '[query]'" when query is non-empty. Idle state: "Search by patient name or phone number" when query is empty.
- [x] 13.5 Close on click-outside (desktop) or X button (mobile). `z-50`.

## 14. `TestimonialsView` component

- [x] 14.1 Create `SmartCareUI/src/pages/admin/components/TestimonialsView.tsx`. Props: none — uses `useTestimonialsAdmin()` internally.
- [x] 14.2 Heading "Pending Testimonials", subtext. Count badge `[n] Pending` amber if `pendingCount > 0`.
- [x] 14.3 Loading state: 3 skeleton rows. Error state: "Failed to load testimonials. Try again." with retry button (calls `queryClient.invalidateQueries`).
- [x] 14.4 Testimonial card: patient name bold + star rating (render filled/empty stars as inline SVG based on `t.rating` out of 5) + `formatDistanceToNow(parseISO(t.date), { addSuffix: true })` from `date-fns`. Full quote text italic gray.
- [x] 14.5 "Approve" teal filled small button: calls `approve(t.id)`. Loading state per row via a `pendingApproveId: string | null` state. "Dismiss" gray outlined small button: calls `dismiss(t.id)`.
- [x] 14.6 Empty state: checkmark SVG + "No testimonials pending approval".

## 15. `MobileTabBar` component

- [x] 15.1 Create `SmartCareUI/src/pages/admin/components/MobileTabBar.tsx`. Props: `doctors: Doctor[]`, `appointmentsByDoctorId: Record<string, Appointment[]>`, `activeTabDoctorId: string`, `onTabChange(doctorId: string)`. Visible only below `md`.
- [x] 15.2 Render one tab per doctor. Tab label: `Dr. [lastName] ([count])`. Active: `border-b-2 border-teal-600 text-brand-dark font-semibold`. Inactive: `text-gray-500`.
- [x] 15.3 Mobile top bar (separate section in the same component): `bg-white sticky top-0 z-40 h-14 flex items-center justify-between px-4`. Left: hamburger SVG button `onHamburgerClick`. Center: short date `"${getDayName(getTodayIST()).slice(0,3)}, ${formatDisplayDate(getTodayIST())}"`. Right: search SVG button `onSearchClick`.
- [x] 15.4 Accept `onHamburgerClick` and `onSearchClick` props.

## 16. `AdminDashboardPage` — page orchestration

- [x] 16.1 Replace stub in `SmartCareUI/src/pages/admin/AdminDashboardPage.tsx`. Import all hooks and components.
- [x] 16.2 State: `selectedNav: 'schedule' | 'all' | 'testimonials' | 'settings'`, `selectedAppointmentId: string | null`, `showWalkInModal: boolean`, `showSearch: boolean`, `cancellingId: string | null`, `showMobileNav: boolean`, `activeTabDoctorId: string`, `processedCount: number | null`.
- [x] 16.3 Data: `const { doctors, appointmentsByDoctorId, isLoading, isError, refetch } = useAdminAppointments()`. `const actions = useAppointmentActions(refetch)`.
- [x] 16.4 Layout: `<div className="flex h-screen overflow-hidden bg-warm-50">`. `AdminSidebar` hidden on mobile (`hidden md:flex`). Main: `flex-1 flex flex-col min-w-0`.
- [x] 16.5 Mobile top bar + `MobileTabBar` visible on mobile only (`md:hidden`).
- [x] 16.6 `AdminTopBar` visible on desktop only (`hidden md:flex`).
- [x] 16.7 "Today's Schedule" content: desktop → `<div className="grid grid-cols-2 gap-6 p-6">` with one `DoctorColumn` per doctor. Mobile → single `DoctorColumn` for `activeTabDoctorId`.
- [x] 16.8 "All Appointments" content: simple `<table>` stub showing `appointmentsService.getAll(true)` results — columns: Date, Time, Patient, Doctor, Status. This is a basic stub, not a full feature.
- [x] 16.9 `AppointmentDetailPanel` rendered at page level (not inside a column). When `selectedAppointmentId` is set, find the appointment object from `appointmentsByDoctorId` values. Pass `onCancel={(id) => setCancellingId(id)}`.
- [x] 16.10 `CancelWithReasonForm` rendered inside the detail panel when `cancellingId` is set (and on mobile as a bottom sheet overlay). On submit: call `actions.cancel(cancellingId, reason)` then `setCancellingId(null)`.
- [x] 16.11 `SearchOverlay` rendered at page level when `showSearch` is true. On select appointment: set `selectedAppointmentId`, close search.
- [x] 16.12 `WalkInBookingModal` rendered at page level when `showWalkInModal` is true. On success: set success banner message + refetch.
- [x] 16.13 Mobile bottom sheet navigation: when `showMobileNav` is true, render a fixed bottom sheet with sidebar nav items + Add Appointment + Logout. Close on backdrop click.
- [x] 16.14 Mobile bottom sheet for appointment detail: when `selectedAppointmentId` is set on mobile, render the detail content as a bottom sheet (slide up from bottom, backdrop, close on backdrop click).
- [x] 16.15 FAB (mobile only): `fixed bottom-6 right-6 w-14 h-14 bg-teal-800 text-white rounded-full shadow-lg`. Search SVG icon. Hidden when `selectedAppointmentId !== null`. `onClick` → `setShowSearch(true)`.
- [x] 16.16 Error state: if `isError`, show a full-screen message "Failed to load dashboard data. Please refresh."

## 17. Verification

- [x] 17.1 Run `npm run build` in `SmartCareUI/` and confirm zero TypeScript errors and zero new warnings. Paste the full build output.
- [x] 17.2 List every file created or modified.
- [x] 17.3 Confirm in code: `processExpired` fires in `useEffect` on mount, `enabled: processExpiredDone` gates the appointments query.
- [x] 17.4 Confirm in code: `refetchInterval: 60000` on the appointments query.
- [x] 17.5 Confirm in code: Cancel button on AppointmentCard calls `onCancel` (not the mutation directly).
- [x] 17.6 Confirm in code: Dismiss on TestimonialsView calls `dismiss(id)` with no API call.
- [x] 17.7 Confirm in code: WalkIn submit hardcodes `appointmentType: 'OPD'` and `referralSource: 'Self'`.
- [x] 17.8 Confirm in code: SearchOverlay filters in-memory — no `api` import or service call inside SearchOverlay.
- [x] 17.9 Confirm in code: `AppointmentDetailPanel` uses `doctors.find(d => d.id === appointment.doctorId)` — no `doctorsService.getById` call.
- [x] 17.10 Confirm in code: axios interceptor attaches JWT automatically — no manual `Authorization` header anywhere in admin hooks/components.
