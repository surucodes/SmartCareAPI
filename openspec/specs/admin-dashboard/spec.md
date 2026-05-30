### Requirement: Admin dashboard loads today's appointments after silently processing expired ones

On mount, the dashboard SHALL call `appointmentsService.processExpired()` once as a silent background operation. Any error SHALL be swallowed (logged to console only) and SHALL NOT block the UI. Only after this call resolves or rejects SHALL the dashboard fetch today's appointments and all doctors. A 60-second polling interval SHALL keep the appointment list live without manual refresh.

#### Scenario: Expired appointments are processed silently on first load
- **WHEN** an admin navigates to `/admin`
- **THEN** `POST /api/appointments/process-expired` SHALL be called exactly once
- **AND** no loading indicator or error message SHALL be shown for this call
- **AND** the appointment list SHALL be fetched after the call completes (success or failure)

#### Scenario: Dashboard polls for new appointments every 60 seconds
- **WHEN** the admin dashboard is open
- **THEN** today's appointments SHALL be re-fetched automatically every 60 seconds
- **AND** the UI SHALL update with any new or changed appointments without a page reload

---

### Requirement: Desktop layout shows a fixed sidebar, top bar, and two-column doctor schedule

At viewport width `md` (768px) and above, the dashboard SHALL render a fixed-width sidebar (220px), a sticky top bar, and a main content area showing two `DoctorColumn` components side by side.

#### Scenario: Sidebar is visible on desktop
- **WHEN** an admin views the dashboard at `md` or wider
- **THEN** the sidebar SHALL be visible with: the Spandana Hospital logo, "Admin Dashboard" label, the staff email, navigation items (Today's Schedule, All Appointments, Testimonials, Settings), an "+ Add Appointment" button, and a Logout link

#### Scenario: Two-column schedule shows both doctors
- **WHEN** the admin is on the "Today's Schedule" view on desktop
- **THEN** both doctors' appointment columns SHALL be visible side by side

#### Scenario: Top bar shows today's date and search input
- **WHEN** the admin views the top bar on desktop
- **THEN** today's full date (e.g. "Saturday, 24 May 2026") SHALL appear on the left
- **AND** a search input SHALL appear in the center
- **AND** a "Mark expired as No-Show" button SHALL appear on the right

---

### Requirement: Mobile layout shows a tab bar for doctor switching and a FAB for search

At viewport widths below `md`, the sidebar and desktop top bar SHALL be hidden. A mobile top bar (hamburger + date + search icon) and a tab bar with one tab per doctor SHALL appear instead.

#### Scenario: Mobile shows one doctor's appointments at a time
- **WHEN** an admin views the dashboard on a mobile viewport
- **THEN** only one doctor's appointments SHALL be visible at a time
- **AND** tapping the other doctor's tab SHALL switch to that doctor's appointments

#### Scenario: FAB opens search overlay
- **WHEN** an admin taps the floating action button on mobile
- **THEN** the search overlay SHALL open

#### Scenario: Hamburger opens a bottom sheet navigation on mobile
- **WHEN** an admin taps the hamburger icon on mobile
- **THEN** a bottom sheet SHALL open with the same navigation items as the desktop sidebar

---

### Requirement: AppointmentCard shows status-coloured left border and contextual action buttons

Each appointment SHALL render as a card with a 4px left border whose colour indicates status. The card SHALL show the patient name, slot time, consultation type, status badge, patient type, queue position (if > 1), phone, and follow-up indicator. Action buttons SHALL vary by status as specified.

#### Scenario: Pending appointment card shows Confirm, Check In, Cancel
- **WHEN** an appointment has status `Pending` and `checkedInAt` is null
- **THEN** the card SHALL have an amber left border
- **AND** SHALL show "Confirm", "Check In", and "Cancel" buttons

#### Scenario: Confirmed (not checked in) card shows Check In as primary, plus Complete and Cancel
- **WHEN** an appointment has status `Confirmed` and `checkedInAt` is null
- **THEN** the card SHALL have a teal left border
- **AND** the primary button SHALL be "Check In"
- **AND** secondary buttons SHALL be "Complete" and "Cancel"

#### Scenario: Confirmed and checked-in card shows Complete as primary, plus No Show and Cancel
- **WHEN** an appointment has status `Confirmed` and `checkedInAt` is not null
- **THEN** the card SHALL have a teal left border with a "Checked In" pill visible
- **AND** the primary button SHALL be "Complete"
- **AND** secondary buttons SHALL be "No Show" and "Cancel"

#### Scenario: Completed, Cancelled, NoShow cards are read-only
- **WHEN** an appointment has status `Completed`, `Cancelled`, or `NoShow`
- **THEN** the card SHALL show no action buttons
- **AND** SHALL have reduced opacity (0.7)
- **AND** SHALL show a relevant timestamp (completedAt or cancelledAt)

---

### Requirement: Appointment detail panel opens on desktop when a card is clicked

On desktop, clicking an appointment card SHALL open a detail panel fixed to the right side of the screen (380px wide). The panel SHALL show full patient details, doctor info (looked up from the already-fetched doctors array — no additional API call), notes (read-only), check-in time, and action buttons matching the card's logic.

#### Scenario: Panel shows correct doctor name without extra API call
- **WHEN** an appointment detail panel is open
- **THEN** the doctor name SHALL be retrieved from the already-fetched `doctors` array by matching `appointment.doctorId`
- **AND** no additional `GET /api/doctors/:id` request SHALL be made

#### Scenario: Panel shows referral source in human-readable form
- **WHEN** the detail panel renders
- **THEN** `Self` SHALL display as "Self / Internet", `DoctorReferral` as "Doctor Referral", `HospitalReferral` as "Hospital Referral", `Other` as "Other"

#### Scenario: Panel shows appointment ID in display format
- **WHEN** the detail panel renders
- **THEN** the appointment ID SHALL be displayed as "SH-[last 8 characters uppercase]"

#### Scenario: Notes section only appears when notes are non-empty
- **WHEN** `appointment.notes` is an empty string
- **THEN** the notes section SHALL NOT be rendered in the detail panel

---

### Requirement: Cancel always requires a reason via CancelWithReasonForm

Clicking "Cancel" on any appointment card or detail panel SHALL NOT immediately cancel the appointment. It SHALL open `CancelWithReasonForm`. The form SHALL require a minimum of 5 characters before the confirm button is enabled. Only submitting the form SHALL call the cancel mutation.

#### Scenario: Cancel button opens the reason form, not an immediate cancellation
- **WHEN** an admin clicks "Cancel" on an appointment
- **THEN** `CancelWithReasonForm` SHALL open
- **AND** the appointment SHALL NOT be cancelled immediately

#### Scenario: Confirm cancellation is disabled until 5 characters are entered
- **WHEN** `CancelWithReasonForm` is open and the reason textarea has fewer than 5 characters
- **THEN** the "Confirm Cancellation" button SHALL be disabled

#### Scenario: Successful cancellation closes the form and refetches
- **WHEN** the admin submits a valid reason and the backend responds with success
- **THEN** the form SHALL close
- **AND** the appointment list SHALL be refetched

---

### Requirement: Appointment actions show email side-effect notes and trigger refetch on success

After confirm, cancel, or complete actions succeed, a brief informational note SHALL appear in the detail panel indicating that an email will be sent to the patient. On any action success, the detail panel SHALL close and the appointment list SHALL refetch.

#### Scenario: Post-confirm email note is shown
- **WHEN** an admin confirms an appointment
- **AND** the request succeeds
- **THEN** a brief note "Confirmation email will be sent to patient." SHALL appear in the panel
- **AND** the panel SHALL then close and the list SHALL refetch

#### Scenario: Action errors appear inline in the panel
- **WHEN** an appointment action fails
- **THEN** a red error banner SHALL appear at the top of the detail panel with the backend error message
- **AND** the banner SHALL be dismissible

---

### Requirement: Walk-in booking modal allows staff to book an appointment at the desk

The "+ Add Appointment" button in the sidebar SHALL open a modal for booking walk-in appointments. The modal SHALL use `appointmentType: "OPD"` and `referralSource: "Self"` always. Staff can select doctor, consultation type, date, time slot (free text "HH:MM"), and fill in patient details.

#### Scenario: Walk-in booking sets correct static fields
- **WHEN** an admin submits a walk-in booking form
- **THEN** `appointmentsService.create()` SHALL be called with `appointmentType: "OPD"` and `referralSource: "Self"`

#### Scenario: Successful walk-in booking closes modal and refetches
- **WHEN** the walk-in booking succeeds
- **THEN** the modal SHALL close
- **AND** a brief success banner SHALL show "Appointment booked for [patient name]"
- **AND** the appointment list SHALL refetch

---

### Requirement: Search filters today's in-memory appointments without an API call

The search overlay (desktop: dropdown; mobile: full-screen) SHALL filter the already-fetched today's appointments by `patientName` and `patientPhone`. The filter SHALL be case-insensitive and SHALL strip spaces from phone numbers before matching. No API call SHALL be made during search.

#### Scenario: Search finds appointment by partial patient name
- **WHEN** an admin types a partial name that matches one or more appointments
- **THEN** matching results SHALL appear immediately with no network request

#### Scenario: Search shows empty state for no matches
- **WHEN** the search query matches no appointments
- **THEN** the message "No appointments found for '[query]'" SHALL appear

---

### Requirement: Testimonials view shows pending testimonials with approve and dismiss actions

The Testimonials nav item SHALL switch the main content area to a testimonials view. Pending testimonials (unapproved) SHALL be fetched via `GET /api/testimonials?includePending=true`. Approving a testimonial SHALL call the approve API and optimistically remove it from the list. Dismissing SHALL remove it only from the local session list — no API call.

#### Scenario: Approve calls the API and removes the testimonial from the list
- **WHEN** an admin clicks "Approve" on a testimonial
- **THEN** `PATCH /api/testimonials/:id/approve` SHALL be called
- **AND** the testimonial SHALL be removed from the displayed list optimistically

#### Scenario: Dismiss removes the testimonial from the session list only
- **WHEN** an admin clicks "Dismiss" on a testimonial
- **THEN** NO API call SHALL be made
- **AND** the testimonial SHALL be removed from the displayed list for the current session only
- **AND** the testimonial SHALL reappear if the page is refreshed

#### Scenario: Empty state shown when no testimonials are pending
- **WHEN** all pending testimonials have been approved or dismissed
- **THEN** the message "No testimonials pending approval" SHALL appear

---

### Requirement: RescheduleForm requires valid date, time, and reason before submitting

The reschedule form (accessible from the detail panel action area — not prominently positioned) SHALL require a future date (minimum tomorrow in IST), a time matching `HH:MM` format, and a reason of at least 5 characters. The form SHALL use `getTodayIST()` to compute the minimum date.

#### Scenario: Reschedule button is disabled until all fields are valid
- **WHEN** any of date, time, or reason fields are empty or invalid in the reschedule form
- **THEN** the "Reschedule" button SHALL be disabled

#### Scenario: Successful reschedule shows confirmation and refetches
- **WHEN** the reschedule request succeeds
- **THEN** the message "Appointment rescheduled. Emails sent to patient." SHALL appear
- **AND** the detail panel SHALL close
- **AND** the appointment list SHALL refetch

---

### Requirement: "Mark expired as No-Show" button processes expired appointments on demand

The top bar SHALL include a "Mark expired as No-Show" text button. Clicking it SHALL call `appointmentsService.processExpired()` and show a dismissible result banner below the top bar.

#### Scenario: Successful processing shows count banner
- **WHEN** the admin clicks "Mark expired as No-Show" and the backend returns `{ processed: n }`
- **THEN** a banner SHALL show "[n] appointments marked as No-Show" if `n > 0`, or "No expired appointments found" if `n === 0`
- **AND** the appointment list SHALL refetch after processing
