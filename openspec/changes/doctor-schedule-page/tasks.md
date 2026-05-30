## 1. Shared doctor-action helper

- [x] 1.1 Create `SmartCareUI/src/pages/doctor/components/doctor-actions.ts`. Export `type DoctorActionId = 'confirm' | 'complete' | 'cancel'` and a pure function `getDoctorActions(a: Appointment): { primary: DoctorActionId[]; hasReschedule: boolean }`. Encode the state machine from the spec: Pending+null → [confirm, cancel] + reschedule; Pending+checkedIn → [confirm, complete, cancel] + reschedule; Confirmed+null → [cancel] + reschedule; Confirmed+checkedIn → [complete, cancel] + reschedule; Completed/Cancelled/NoShow → [] + no reschedule.
- [x] 1.2 In the same file, export a `DOCTOR_BUTTON_PALETTE: Record<DoctorActionId, { classes: string; label: string }>` with: confirm `bg-teal-600 text-white hover:bg-teal-800`; complete `bg-emerald-800 text-white hover:bg-emerald-900`; cancel `border border-red-300 text-red-600 bg-white hover:bg-red-50`. All buttons use `min-h-[44px] text-sm font-semibold rounded-lg`.

## 2. `useDoctorSchedule` hook

- [x] 2.1 Create `SmartCareUI/src/hooks/useDoctorSchedule.ts`. Accept `doctorId: string | null` as parameter. Manage local state: `selectedDate: string` (init to `getTodayIST()`), `selectedFilter: 'all' | 'confirmed' | 'pending' | 'cancelled'` (init to `'all'`), `currentWeekStart: Date` (init to the Monday of today's IST week).
- [x] 2.2 Add `processExpiredDone: boolean` state. In a `useEffect` with empty deps, call `appointmentsService.processExpired()` and `.finally(() => setProcessExpiredDone(true))`. Swallow errors with `console.error`.
- [x] 2.3 Day query: `queryKey: ['doctor-day', doctorId, selectedDate]`, `queryFn: () => appointmentsService.getByDoctor(doctorId!, selectedDate < getTodayIST())`, `enabled: !!doctorId && processExpiredDone`, `refetchInterval: 60000`, `staleTime: 30000`.
- [x] 2.4 Month query (for week-strip dots): `queryKey: ['doctor-month', doctorId]`, `queryFn: () => appointmentsService.getByDoctor(doctorId!, true)`, `enabled: !!doctorId && processExpiredDone`, `staleTime: 5 * 60 * 1000`.
- [x] 2.5 Filter the day query result to `a.date === selectedDate`. Then apply status filter rules: `all` → split into `activeAppointments` (Pending + Confirmed) and `pastAppointments` (Completed + Cancelled + NoShow); `confirmed` → Confirmed only; `pending` → Pending only; `cancelled` → Cancelled + NoShow. Sort each group ascending by `slot`.
- [x] 2.6 Derive `daysWithAppointments: Set<string>` from the month query's data, using each appointment's `a.date`. Use `useMemo`.
- [x] 2.7 Expose `{ doctor: null, activeAppointments, pastAppointments, daysWithAppointments, isLoading, isError, selectedDate, setSelectedDate, selectedFilter, setSelectedFilter, currentWeekStart, setCurrentWeekStart, refetch }`. The `doctor` field is resolved elsewhere — the hook does not own doctor identity.

## 3. `useDoctorAppointmentActions` hook

- [x] 3.1 Create `SmartCareUI/src/hooks/useDoctorAppointmentActions.ts`. Accept `refetch: () => void`. Pattern follows admin's `useAppointmentActions` but with a strict subset.
- [x] 3.2 Implement four mutations: `confirm(id)` → `updateStatus(id, { status: 'Confirmed' })`; `complete(id)` → `updateStatus(id, { status: 'Completed' })`; `cancel(id, reason)` → `updateStatus(id, { status: 'Cancelled', cancelledBy: 'Doctor', cancellationReason: reason })`; `reschedule(id, dto)` → `appointmentsService.reschedule(id, dto)`. All call `refetch()` on success.
- [x] 3.3 Error helper: reuse `ActionError` type from admin's `useAppointmentActions` via direct import. Each mutation exposes `{ isPending, error: ActionError | null }`. No `any` — use `isAxiosError` for narrowing.
- [x] 3.4 Export `interface DoctorAppointmentActions` with the four action functions and four state pairs. Do NOT export checkIn or markNoShow.

## 4. Doctor selector (inline in page)

- [x] 4.1 In `DoctorSchedulePage.tsx`, define a small local component `DoctorSelector` that receives `doctors: Doctor[]` and `onSelect(doctorId: string)`. Layout: full-screen centred card; for each doctor renders a tappable card with photo (or initials fallback), name (serif bold), specialty (amber uppercase small). Card classes: `bg-white border border-gray-100 rounded-xl p-6 hover:border-teal-600 hover:shadow-md transition-colors min-h-[120px] cursor-pointer text-left`.
- [x] 4.2 The selector heading reads "Welcome — which doctor are you?" and explains briefly that this is a one-time setup per session.

## 5. `DoctorSidebar` component (desktop only)

- [x] 5.1 Create `SmartCareUI/src/pages/doctor/components/DoctorSidebar.tsx`. Props: `doctor: Doctor`, `selectedNav: 'schedule' | 'today' | 'settings'`, `onNavChange(nav)`, `todayCount: number`. Fixed width `w-[220px]`, `h-full`, white bg, `border-r border-gray-100`, hidden on mobile.
- [x] 5.2 Header: Logo.png (h-8) + "Spandana Hospital" bold teal + "Doctor Portal" gray small. Below: doctor photo (48px circle) or initials fallback + doctor name bold + specialty in `text-xs font-semibold tracking-widest text-brand-gold uppercase`.
- [x] 5.3 Nav items: "My Schedule" with calendar SVG + amber count badge when `todayCount > 0`; "Today" with calendar-today SVG; "Settings" with gear SVG. Active item styling matches admin: `bg-teal-50 text-teal-800 border-l-2 border-teal-600`.
- [x] 5.4 Bottom: "Logout" button (red text, with logout SVG) calling `useAuth().logout()` then `navigate('/login', { replace: true })`. No "+ Add Appointment" button.

## 6. `DoctorTopBar` component (desktop only)

- [x] 6.1 Create `SmartCareUI/src/pages/doctor/components/DoctorTopBar.tsx`. Props: `currentWeekStart: Date`, `onPrevWeek()`, `onNextWeek()`, `selectedDate: string`, `daysWithAppointments: Set<string>`, `onSelectDate(date)`, `onResetToToday()`. Hidden on mobile.
- [x] 6.2 Layout: `h-14 bg-white border-b border-gray-100 shrink-0 flex items-center px-6 gap-4`. Left: month + year label (e.g. "May 2026") with prev/next arrow buttons (44×44 icon buttons). Center: `WeekStrip` component. Right: "Today" pill button (teal outlined, rounded-full, small).

## 7. `WeekStrip` component

- [x] 7.1 Create `SmartCareUI/src/pages/doctor/components/WeekStrip.tsx`. Props: `currentWeekStart: Date`, `selectedDate: string`, `daysWithAppointments: Set<string>`, `onSelectDate(date)`. Compute 7 dates from `currentWeekStart` using `date-fns` `addDays`.
- [x] 7.2 Each cell renders: short day name uppercase (`format(d, 'EEE')`) + date number in a circle. The circle is teal-filled white-text when `formattedDate === selectedDate`. It is `bg-warm-100 text-brand-dark` when `formattedDate === getTodayIST() && !isSelected`. Otherwise plain. Min cell width `48px`, `min-h-[44px]` tap target.
- [x] 7.3 Below the number, render a `1.5×1.5` teal dot when `daysWithAppointments.has(formattedDate)`; otherwise reserve the space with an invisible element to keep cell height consistent.
- [x] 7.4 Desktop: 7 cells in a `flex flex-1 justify-between gap-2`. Mobile: same cells but in `overflow-x-auto snap-x snap-mandatory`, each cell `snap-start shrink-0 min-w-[48px]`. On mount, scroll today's cell into view via `scrollIntoView({ block: 'nearest', inline: 'center' })`.

## 8. `StatusFilterPills` component

- [x] 8.1 Create `SmartCareUI/src/pages/doctor/components/StatusFilterPills.tsx`. Props: `value: 'all' | 'confirmed' | 'pending' | 'cancelled'`, `onChange(value)`. Render four pills.
- [x] 8.2 Active pill: `bg-teal-600 text-white rounded-full px-4 min-h-[44px] font-semibold text-sm`. Inactive: `border border-gray-200 text-gray-600 bg-white rounded-full px-4 min-h-[44px] text-sm hover:bg-gray-50`.

## 9. `DoctorAppointmentCard` component

- [x] 9.1 Create `SmartCareUI/src/pages/doctor/components/DoctorAppointmentCard.tsx`. Props: `appointment: Appointment`, `actions: DoctorAppointmentActions`, `refetch(): void`. Card container: `bg-white rounded-xl border border-gray-100 p-6 shadow-[0_4px_12px_rgba(19,43,26,0.04)] hover:shadow-[0_8px_24px_rgba(19,43,26,0.08)] transition-shadow relative overflow-hidden max-w-2xl mx-auto`. Add `opacity-60` when status is Completed / Cancelled / NoShow.
- [x] 9.2 Subtle left status indicator bar (matching Stitch): `<div className="absolute left-0 top-0 bottom-0 w-1" />` with bg by status: Pending `bg-amber-500`, Confirmed `bg-teal-600`, Completed/NoShow `bg-gray-300`, Cancelled `bg-red-300`. `opacity-30` by default, `opacity-100` on card hover.
- [x] 9.3 Two-column inner layout: `<div className="flex flex-col md:flex-row gap-6">`. Left column container: `flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start min-w-[120px] md:border-r border-gray-100 md:pr-6 border-b md:border-b-0 pb-4 md:pb-0`. Right column: `flex-1 min-w-0`.
- [x] 9.4 Left column content: slot time as `<h3>` with `text-2xl font-bold text-brand-dark` showing `formatDisplayTime(appointment.slot)` (split AM/PM if practical, otherwise inline). Below the time (`md:mt-3`), a `Q#[n]` pill `bg-warm-200 text-gray-600 text-[11px] font-semibold px-2 py-0.5 rounded border border-gray-100` — rendered only when `queuePosition > 1`.
- [x] 9.5 Right column row 1 — status pill + consultation type. Status pill with leading dot: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold` with palette by status (Pending `bg-amber-100 text-amber-800` + dot `bg-amber-600`; Confirmed `bg-teal-100 text-teal-800` + dot `bg-teal-600`; etc.). Beside it, `appointment.consultationTypeName` rendered in `text-xs text-gray-500 uppercase tracking-wider`. If `appointment.checkedInAt !== null`, render an amber "Checked In" pill (with check-circle SVG, `bg-amber-200 text-amber-900`) right-aligned with `ml-auto`.
- [x] 9.6 Right column row 2 — patient identity. Inline-flex row: 2-letter initials avatar (32×32 circle, `bg-gray-100 text-teal-700 font-semibold text-sm`) computed by helper `getInitials(name)` (first letter of first word + first of last word; single-word → first two letters) + patient name bold `text-xl text-brand-dark`.
- [x] 9.7 Right column row 3 — meta line: `appointment.consultationTypeName ?? '—'` is already shown in the status row, so this line shows ` · Follow-up` italic if `isFollowUp` + ` · New Patient` / ` · Returning` gray small (`text-xs text-gray-500`). Indent with `pl-11` to align under the patient name (matches Stitch).
- [x] 9.8 Right column row 4 — notes block: visible only when `appointment.notes.trim() !== ''`. Container `bg-gray-50 rounded-lg p-3.5 border border-gray-100 flex items-start gap-3 ml-11 mt-3`. Leading prescription-icon SVG `text-gray-500`. Italic text `text-sm text-gray-600`. `max-h-16 overflow-hidden line-clamp-3`; local `showFullNotes: boolean` state toggles `line-clamp-3` off via a "Show more" / "Show less" text link below.
- [x] 9.9 Right column row 5 — patient phone in `text-xs text-gray-500 pl-11` (doctor may need to call). Optional.
- [x] 9.10 Dashed divider above action strip: `border-t border-dashed border-gray-200 mt-6 pt-4`. Action row uses `flex flex-wrap items-center gap-3` on desktop, `flex flex-col gap-2` on mobile (`sm:flex-row`).
- [x] 9.11 Action button rendering: call `getDoctorActions(appointment)`. Render `primary` buttons using `DOCTOR_BUTTON_PALETTE`. Each button `min-h-[44px] px-5 text-sm font-semibold rounded-md`. Cancel button uses `ml-auto` on desktop so it right-aligns away from the primary actions (matches Stitch). On mobile (`<sm`), Cancel is the last stacked item.
- [x] 9.12 Reschedule link rendering: when `hasReschedule` is true, render below or beside the buttons (desktop: `ml-2 flex items-center gap-1.5` next to Cancel; mobile: full-width centered underlined text link below all buttons). Label `Reschedule` with a small `event_repeat`-style inline SVG. Classes: `text-sm text-gray-500 hover:text-brand-dark transition-colors min-h-[44px] flex items-center`.
- [x] 9.13 Cancel button click: set local `formMode: 'cancel'` (collapsing reschedule form if open). Reschedule link click: set local `formMode: 'reschedule'`. Mutually exclusive — opening one closes the other. Inline forms render below the dashed divider when `formMode` is set, replacing the action button row.
- [x] 9.14 Read-only states (Completed/Cancelled/NoShow): show no action strip and no reschedule link. Below row 5 (without the dashed divider), for Cancelled, show `appointment.cancellationReason` if present in `text-xs text-gray-500 italic ml-11`; for Completed, show "Completed" badge in the status row; for NoShow, show "No Show" badge in the status row.

## 10. `DoctorCancelForm` component

- [x] 10.1 Create `SmartCareUI/src/pages/doctor/components/DoctorCancelForm.tsx`. Props: `onSubmit(reason)`, `onKeep()`, `isPending`, `error`.
- [x] 10.2 Amber warning box at top: "Cancelling will notify the patient by email."
- [x] 10.3 Textarea, `min-h-[80px]`, max 200 chars, character counter shown right-aligned below. Placeholder: "Please provide a reason for cancellation..."
- [x] 10.4 Buttons: "Keep Appointment" gray-ghost; "Confirm Cancellation" red filled. Confirm disabled until reason ≥ 5 chars or `isPending`. Spinner in Confirm while pending. Error string rendered above buttons in `bg-red-50` banner.

## 11. `DoctorRescheduleForm` component

- [x] 11.1 Create `SmartCareUI/src/pages/doctor/components/DoctorRescheduleForm.tsx`. Props: `onSubmit(dto: RescheduleDto)`, `onCancel()`, `isPending`, `error`, `successMessage` (passed down by the card for the post-success inline message).
- [x] 11.2 Three fields: New Date (`type="date"`, `min` is tomorrow's IST date computed via `addDays(parseISO(getTodayIST()), 1)`); New Time (`type="text" inputMode="numeric" placeholder="e.g. 14:30"`, validated against `/^\d{2}:\d{2}$/`); Reason (textarea, min 5, max 200, char counter).
- [x] 11.3 Info box: gray bg, info icon, text "You can only reschedule to your own available slots. The patient will receive an email notification."
- [x] 11.4 Buttons: "Cancel" gray-ghost; "Confirm Reschedule" teal filled (`bg-teal-600 hover:bg-teal-800 text-white`). Confirm disabled until all valid. Error in red banner above buttons. Success message renders in teal banner above buttons when set.

## 12. Mobile bottom-sheet navigation (inline in page)

- [x] 12.1 In `DoctorSchedulePage.tsx`, define a local `DoctorMobileNav` component that mirrors admin's `MobileNavSheet` but with the doctor's nav items only (My Schedule, Today, Settings, Logout). Triggered by mobile top bar hamburger. No "+ Add Appointment".

## 13. `DoctorSchedulePage` orchestration

- [x] 13.1 Replace the stub in `SmartCareUI/src/pages/doctor/DoctorSchedulePage.tsx`. Import the hooks, components, and `useAuth`. State: `doctorId: string | null`, `selectedNav: 'schedule' | 'today' | 'settings'`, `showMobileNav: boolean`.
- [x] 13.2 Doctor identity resolution on mount: read `sessionStorage.getItem('smartcare:doctorId:' + user?.email)`. If present, set `doctorId` from it. Otherwise, when `doctorsQuery.data` arrives: if exactly one doctor, auto-select; else, leave `doctorId` null so the selector renders.
- [x] 13.3 When `doctorId` is null: render `<DoctorSelector doctors={doctorsQuery.data ?? []} onSelect={(id) => { sessionStorage.setItem('smartcare:doctorId:' + user?.email, id); setDoctorId(id); }} />`. Return early — do not render the schedule UI yet.
- [x] 13.4 Once `doctorId` is set: call `useDoctorSchedule(doctorId)` and `useDoctorAppointmentActions(schedule.refetch)`. Resolve `doctor` from the doctors-list query via `find(d => d.id === doctorId)`.
- [x] 13.5 Compute `todayCount = activeAppointments.length` when `selectedDate === getTodayIST()` else compute from the month query: filter for today + (Pending or Confirmed). Pass as prop to `DoctorSidebar`.
- [x] 13.6 Layout (desktop): `<div className="flex h-screen overflow-hidden bg-warm-50">`. `<DoctorSidebar />` (hidden on mobile). Main: `flex-1 flex flex-col min-w-0 overflow-hidden`. `<DoctorTopBar />` (hidden on mobile, h-14, shrink-0). Mobile top bar inline (hidden on desktop) with hamburger + doctor name + Today pill. Scrollable canvas: `flex-1 overflow-y-auto px-4 py-6 md:py-6`. Inside canvas: date heading row (`<h2>` formatted via `formatDisplayDate(selectedDate)` + appointment count) → `<StatusFilterPills />` → cards.
- [x] 13.7 Cards rendering: when filter is `'all'`, render `activeAppointments` first, then if `pastAppointments.length > 0` render a `<div className="my-6 text-xs font-semibold tracking-widest text-gray-400 uppercase border-t border-gray-100 pt-4">Past & Closed</div>` divider, then `pastAppointments`. For other filters, render the single filtered array (which the hook exposes consistently — see task 2.5).
- [x] 13.8 Empty state: when the day has zero appointments after filtering, render a centred message: "No appointments for this day." Use a small calendar SVG above the text in `text-gray-300`.
- [x] 13.9 Loading state: when `schedule.isLoading`, render 3 skeleton cards.
- [x] 13.10 Error state: when `schedule.isError`, render a centred message "Failed to load your schedule. Please refresh."
- [x] 13.11 Mobile bottom-sheet nav rendered at page level when `showMobileNav` is true. Backdrop click closes.

## 14. AuthContext logout cleans up doctor selection

- [x] 14.1 In `SmartCareUI/src/context/AuthContext.tsx`, extend `logout` to iterate `sessionStorage` keys and remove any whose name starts with `smartcare:doctorId:`. Wrap in a try/catch to handle environments without `sessionStorage`. No other behaviour changes.

## 15. Verification

- [x] 15.1 Run `npm run build` in `SmartCareUI/` and paste the full output. Confirm zero TypeScript errors and zero new warnings.
- [x] 15.2 List every file modified or created.
- [x] 15.3 Confirm in code: no `'Check In'` button text appears in any file under `src/pages/doctor/`. (`grep -r "Check In" src/pages/doctor/` should return nothing in component code.)
- [x] 15.4 Confirm in code: no `'No Show'` button or call to `markNoShow` appears anywhere in the doctor portal.
- [x] 15.5 Confirm in code: `getDoctorActions` is the only function that determines button visibility on `DoctorAppointmentCard` (no inline `status === 'Pending'` button-choice logic in the card body).
- [x] 15.6 Confirm in code: `DoctorRescheduleForm` New Time field is `<input type="text">` (or omitted `type` defaulting to text), not `<input type="time">`.
- [x] 15.7 Confirm in code: `Cancel` button on the card sets local `formMode = 'cancel'`; the cancel mutation is called only from `DoctorCancelForm.onSubmit`.
- [x] 15.8 Confirm in code: the page calls `appointmentsService.getByDoctor(doctorId, ...)` and never `appointmentsService.getAll(...)`.
- [x] 15.9 Confirm in code: `processExpired()` is invoked from `useDoctorSchedule` inside `useEffect` with empty deps; the day query is gated `enabled: !!doctorId && processExpiredDone`.
- [x] 15.10 Confirm in code: `AuthContext.logout` removes `smartcare:doctorId:*` keys from `sessionStorage`.
