## 1. Shared button helper

- [x] 1.1 Create `SmartCareUI/src/pages/admin/components/appointment-actions.ts`. Export `type ActionId = 'confirm' | 'checkIn' | 'complete' | 'noShow' | 'cancel'` and a pure function `getActionButtons(a: Appointment): ActionId[]` implementing the state machine from the spec (Pending/null → confirm/checkIn/cancel; Pending/checkedIn → confirm/complete/cancel; Confirmed/null → checkIn/noShow/cancel; Confirmed/checkedIn → complete/noShow/cancel; Completed/Cancelled/NoShow → empty array). Also export a `BUTTON_PALETTE` map from `ActionId` to `{ idle: string; hover: string; label: string }` Tailwind classes.

## 2. Update `useAppointmentActions` to expose HTTP status

- [x] 2.1 In `SmartCareUI/src/hooks/useAppointmentActions.ts`, change `toActionError` to return `{ message: string; status: number | null }` (or `null` when no error). Use `isAxiosError(err)` to read `err.response?.status`.
- [x] 2.2 Update each mutation's exposed state shape from `{ isPending: boolean; error: string | null }` to `{ isPending: boolean; error: { message: string; status: number | null } | null }`. Update the `AppointmentActions` interface accordingly.
- [x] 2.3 No `any`. All call sites that read `.error` will be updated in their own steps below.

## 3. `AppointmentCard` button refactor

- [x] 3.1 In `SmartCareUI/src/pages/admin/components/AppointmentCard.tsx`, replace the inline status-switch button rendering with a single map over `getActionButtons(appointment)`. Render each `ActionId` to a button using the `BUTTON_PALETTE` classes.
- [x] 3.2 Render the first ID in the array as visually primary (full width row 1); the remaining IDs share row 2 with `flex-1`. All buttons keep `min-h-[44px] text-sm font-medium rounded-lg`. `e.stopPropagation()` on each button's onClick.
- [x] 3.3 Add a new `selected?: boolean` prop. When `selected`, add `ring-2 ring-teal-600 bg-teal-50` to the card container's classes (keep the existing status left border). Do not change the dimmed-opacity rule for read-only states.

## 4. `DoctorColumn` selected-card plumbing

- [x] 4.1 In `SmartCareUI/src/pages/admin/components/DoctorColumn.tsx`, add `selectedAppointmentId: string | null` to the props interface. Pass `selected={appt.id === selectedAppointmentId}` to each `AppointmentCard`.

## 5. `AppointmentDetailPanel` button + error refactor

- [x] 5.1 In `SmartCareUI/src/pages/admin/components/AppointmentDetailPanel.tsx`, replace the inline status-switch button rendering with the same `getActionButtons(appointment)` map. Render the primary (first) button as a full-width prominent button; render the remaining buttons in a row with `flex-1`. Use the same `BUTTON_PALETTE` classes from step 1 — buttons in the panel use `min-h-[44px]` and slightly larger horizontal padding than the card.
- [x] 5.2 Combined error handling: read `actions.confirmState.error`, `actions.completeState.error`, `actions.noShowState.error`, `actions.checkInState.error`. Replace the current "first non-null wins" logic with: if `checkInState.error?.status === 409`, ignore it (do not render). For any other non-null error, render `error.message` in the red banner.
- [x] 5.3 In the same component, add a `useEffect` that watches `actions.checkInState.error`: if the latest error has `status === 409`, call a `refetch` callback passed in via props. Add `onSilentRefetch: () => void` to the props and wire it in `AdminDashboardPage` to `refetch` from `useAdminAppointments`.

## 6. Date selection in `useAdminAppointments`

- [x] 6.1 In `SmartCareUI/src/hooks/useAdminAppointments.ts`, change the signature to accept `selectedDate: string` (yyyy-MM-dd). Compute `includePast = selectedDate < getTodayIST()`. Change the appointments query key to `['admin-appointments', selectedDate]`. Set `queryFn: () => appointmentsService.getAll(includePast)`. Keep `enabled: processExpiredDone` and `refetchInterval: 60000`.
- [x] 6.2 After fetching, filter the returned array to `a.date === selectedDate` before grouping by doctor. Group as before. The grouped record keys are still doctor IDs initialized to empty arrays.

## 7. `AdminTopBar` date navigator (desktop)

- [x] 7.1 In `SmartCareUI/src/pages/admin/components/AdminTopBar.tsx`, add props: `selectedDate: string`, `onPrevDay()`, `onNextDay()`, `onResetToToday()`.
- [x] 7.2 Render the date navigator immediately left of the search input (the current date display in the left slot is replaced by it). Layout: `[← prev] [date label button] [next →]`. Arrows are 44×44 icon buttons. The date label is a `<button>` showing `${getDayName(selectedDate)}, ${formatDisplayDate(selectedDate)}` — clicking it calls `onResetToToday()`. The arrows call `onPrevDay` / `onNextDay`.
- [x] 7.3 Add a small "Today" pill next to the label if `selectedDate !== getTodayIST()` to make the reset affordance discoverable.

## 8. `MobileTabBar` date navigator (mobile)

- [x] 8.1 In `SmartCareUI/src/pages/admin/components/MobileTabBar.tsx`, replace the short-date text in the mobile top bar with the same compact navigator: `[←] [short label] [→]`. Accept the same `selectedDate`, `onPrevDay`, `onNextDay`, `onResetToToday` props.

## 9. `AdminDashboardPage` wiring

- [x] 9.1 In `SmartCareUI/src/pages/admin/AdminDashboardPage.tsx`, add `selectedDate: string` state initialised to `getTodayIST()`. Add handlers `goPrev()`, `goNext()`, `resetToday()` that use `date-fns` `addDays` to compute the next yyyy-MM-dd string. Pass `selectedDate` into `useAdminAppointments(selectedDate)`.
- [x] 9.2 Pass `selectedDate` + the three handlers down to `AdminTopBar` and `MobileTabBar`. Pass `selectedAppointmentId` down to `DoctorColumn`.
- [x] 9.3 Pass `onSilentRefetch={refetch}` to `AppointmentDetailPanel` on both desktop and mobile renders.

## 10. Scroll lock layout

- [x] 10.1 In `AdminDashboardPage.tsx`, ensure the outer div is `flex h-screen overflow-hidden`. The `<main>` element becomes `flex-1 flex flex-col min-w-0 overflow-hidden`. Add an inner `<div className="flex-1 overflow-y-auto">` wrapping the schedule grid. Make sure the top bar + walk-in banner sit outside the scroll container as flex items with `shrink-0`.
- [x] 10.2 In `AdminTopBar.tsx`, drop the `sticky top-0` — the parent now uses `overflow-hidden` so `sticky` is unnecessary. Keep `h-14 shrink-0`.
- [x] 10.3 In the All Appointments view stub and Testimonials view, wrap their content in an `overflow-y-auto` container so they don't bleed past the scroll boundary.

## 11. All Appointments table — doctor name lookup

- [x] 11.1 In `AdminDashboardPage.tsx`, refactor `AllAppointmentsView` to accept `doctors: Doctor[]` as a prop. Rename the column header from "Doctor ID" to "Doctor". Replace the cell content with `doctors.find(d => d.id === a.doctorId)?.name ?? <span className="text-gray-400 italic">Unknown Doctor</span>`.
- [x] 11.2 In the page render, pass `doctors` from `useAdminAppointments` into `<AllAppointmentsView doctors={doctors} />`.

## 12. IST timestamp audit

- [x] 12.1 In `AppointmentDetailPanel.tsx`, confirm the check-in line uses `formatTimestamp(appointment.checkedInAt!)`. Audit and fix any other UTC-string render: `cancelledAt`, `createdAt`. Add a small "Booked at [formatTimestamp(createdAt)]" line in the panel's footer area (gray text, `text-xs`).
- [x] 12.2 In `AppointmentCard.tsx`, verify the bottom-note `formatTimestamp(...)` is used for completed/cancelled timestamps. For the "Completed" branch where there is no `completedAt`, render only "Completed" as the label — no timestamp (per spec note).
- [x] 12.3 Grep the admin folder for any remaining `.toISOString` / `Date(`-style direct renders. There should be none.

## 13. `Header.tsx` — Staff Login link

- [x] 13.1 In `SmartCareUI/src/components/layout/Header.tsx`, in the desktop nav row (the `hidden md:flex` block), render a `<Link to="/login">Staff Login</Link>` immediately before the "Book Now" CTA wrapper. Style: `text-sm text-gray-500 hover:text-brand-dark transition-colors`. No icon, no background, no border. Keep the existing `min-h-[44px]` discipline by giving it the same vertical alignment as the other nav items.
- [x] 13.2 In the mobile drawer's nav block (inside the `mobileOpen && (...)` JSX), add an extra divider (`<div className="border-t border-gray-100 my-2" />`) below the last NAV_LINKS item and above the "Book Now" CTA. Beneath the divider but above the "Book Now" CTA, render `<Link to="/login" onClick={() => setMobileOpen(false)} className="...">Staff Login</Link>` styled the same as drawer links.

## 14. Verification

- [x] 14.1 Run `npm run build` in `SmartCareUI/` and paste the full output. Confirm zero TypeScript errors and zero new warnings.
- [x] 14.2 List every file modified or created.
- [x] 14.3 Confirm in code: `getActionButtons` is the only function determining button visibility (grep for `status === 'Pending'` and `status === 'Confirmed'` outside the helper — none should appear in card/panel for the purpose of choosing buttons).
- [x] 14.4 Confirm in code: `AppointmentDetailPanel` filters `checkInState.error?.status === 409` out of its banner display.
- [x] 14.5 Confirm in code: `useAdminAppointments` accepts `selectedDate` and uses it in both the query key and the filter.
- [x] 14.6 Confirm in code: `AdminTopBar` renders the date navigator and its arrows wire to `onPrevDay`/`onNextDay`.
- [x] 14.7 Confirm in code: `AdminSidebar` is no longer inside an `overflow-y-auto` ancestor that scrolls with the schedule (sidebar's own internal scroll is OK).
- [x] 14.8 Confirm in code: `AllAppointmentsView` cells render `doctor.name` via lookup; column header reads "DOCTOR" (uppercase to match other headers).
- [x] 14.9 Confirm in code: `formatTimestamp()` is the only function rendering timestamps in admin components. No raw ISO strings.
- [x] 14.10 Confirm in code: `Header.tsx` desktop nav includes a "Staff Login" link before "Book Now"; mobile drawer includes it after a divider.
