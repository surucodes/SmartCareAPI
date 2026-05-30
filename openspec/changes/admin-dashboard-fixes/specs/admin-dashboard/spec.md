## ADDED Requirements

### Requirement: Action button visibility follows a single state machine

The set of action buttons rendered on `AppointmentCard` and `AppointmentDetailPanel` SHALL be determined exclusively by a pure helper `getActionButtons(appointment)`. The helper SHALL return button identifiers in display order according to the table below. No other code path SHALL determine which buttons are visible.

| Status      | `checkedInAt`  | Buttons (in order)              |
|---           |---             |---                              |
| Pending     | null           | Confirm, Check In, Cancel       |
| Pending     | not null       | Confirm, Complete, Cancel       |
| Confirmed   | null           | Check In, No Show, Cancel       |
| Confirmed   | not null       | Complete, No Show, Cancel       |
| Completed   | (any)          | (none — read-only)              |
| Cancelled   | (any)          | (none — read-only)              |
| NoShow      | (any)          | (none — read-only)              |

#### Scenario: Check In button is never visible when checkedInAt is set
- **WHEN** an appointment has `checkedInAt !== null`
- **THEN** the "Check In" button SHALL NOT appear on the card or in the detail panel

#### Scenario: Pending + checked-in shows Confirm and Complete
- **WHEN** an appointment has `status === 'Pending'` and `checkedInAt !== null`
- **THEN** the visible buttons SHALL be exactly Confirm, Complete, Cancel

#### Scenario: Confirmed + not checked-in shows Check In as primary
- **WHEN** an appointment has `status === 'Confirmed'` and `checkedInAt === null`
- **THEN** the first (primary) button SHALL be Check In
- **AND** the remaining buttons SHALL be No Show and Cancel

#### Scenario: Read-only states show no action buttons
- **WHEN** an appointment has status `Completed`, `Cancelled`, or `NoShow`
- **THEN** no action buttons SHALL appear on the card or in the detail panel

---

### Requirement: Action buttons use a semantically distinct colour palette

Each action SHALL render with the same colour treatment on both `AppointmentCard` and `AppointmentDetailPanel`. The palette SHALL be:

- Confirm  → teal filled (`bg-teal-600`, hover `bg-teal-800`), white text
- Check In → amber filled (`bg-amber-600`, hover `bg-amber-800`), white text
- Complete → dark green filled (`bg-emerald-800`, hover `bg-emerald-900`), white text
- No Show  → gray outlined, white bg, gray text (hover light gray bg)
- Cancel   → red outlined, white bg, red text (hover light red bg)

#### Scenario: Same action has identical colour in card and panel
- **WHEN** an admin views the Confirm button on an `AppointmentCard` and on the `AppointmentDetailPanel` for the same appointment
- **THEN** both buttons SHALL use the teal-filled palette
- **AND** the same applies to Check In (amber), Complete (dark green), No Show (gray outlined), Cancel (red outlined)

---

### Requirement: Cancel action never fires without a reason

The "Cancel" button SHALL never invoke the cancel mutation directly. Clicking Cancel SHALL set the page-level `cancellingId` and render `CancelWithReasonForm`. The mutation SHALL only be called from the form's submit with a reason of at least 5 characters.

#### Scenario: Cancel on the card opens the reason form
- **WHEN** an admin clicks Cancel on an appointment card
- **THEN** the cancel API mutation SHALL NOT be called
- **AND** the `CancelWithReasonForm` SHALL appear in the detail panel for that appointment

---

### Requirement: 409 "already checked in" errors are not surfaced to the user

If `checkIn` returns HTTP 409, the dashboard SHALL NOT display an error banner for that response. Instead, it SHALL silently refetch the appointment list so that the updated `checkedInAt` reconciles the UI naturally. All other mutation errors (and non-409 check-in errors) SHALL continue to surface via the existing inline error banner in the detail panel.

#### Scenario: 409 on check-in is suppressed and triggers a refetch
- **WHEN** the check-in mutation returns HTTP 409
- **THEN** no error banner SHALL render in the detail panel
- **AND** `useAdminAppointments.refetch()` SHALL be invoked

#### Scenario: Non-409 check-in errors still display
- **WHEN** the check-in mutation returns any non-409 error (e.g. 500)
- **THEN** the error message SHALL render in the detail panel's red banner as before

---

### Requirement: Top bar exposes day-by-day schedule navigation

The desktop `AdminTopBar` and the mobile top bar SHALL include a date navigator next to the search input. The navigator SHALL consist of a previous-day arrow, a date label, and a next-day arrow. Clicking the date label SHALL reset the selection to today (in IST). The selected date SHALL drive which day's appointments are displayed.

#### Scenario: Right arrow advances the selected date by one day
- **WHEN** an admin clicks the right arrow in the date navigator
- **THEN** the selected date SHALL advance by one day
- **AND** the schedule view SHALL refetch and display that day's appointments

#### Scenario: Clicking the date label resets to today
- **WHEN** an admin clicks the date label
- **THEN** the selected date SHALL reset to `getTodayIST()`

#### Scenario: Past date fetches include past appointments
- **WHEN** the selected date is earlier than `getTodayIST()`
- **THEN** the dashboard SHALL call `appointmentsService.getAll(true)` (include past)
- **AND** filter results to the selected date

#### Scenario: Today or future date fetches without past
- **WHEN** the selected date is `getTodayIST()` or later
- **THEN** the dashboard SHALL call `appointmentsService.getAll(false)`
- **AND** filter results to the selected date

#### Scenario: Doctor column count reflects the selected date
- **WHEN** the selected date changes
- **THEN** each `DoctorColumn` header count badge SHALL update to the count of appointments for that doctor on the selected date

---

### Requirement: Sidebar and top bar are locked; only the schedule canvas scrolls

The desktop layout SHALL keep `AdminSidebar` and `AdminTopBar` visually fixed in place when the schedule content overflows. The only element that scrolls vertically SHALL be the content area below the top bar. `AppointmentDetailPanel` SHALL scroll independently within its own fixed-position container.

#### Scenario: Scrolling the schedule does not move the sidebar or top bar
- **WHEN** an admin scrolls the schedule on desktop
- **THEN** `AdminSidebar` SHALL remain visible at its original position
- **AND** `AdminTopBar` SHALL remain visible at its original position

#### Scenario: Detail panel scrolls independently
- **WHEN** the detail panel is open and its contents exceed the viewport height
- **THEN** the panel SHALL scroll internally
- **AND** the rest of the page SHALL not scroll as a result of panel scrolling

---

### Requirement: All Appointments table renders doctor names

The All Appointments view SHALL render each appointment's doctor as `doctor.name` looked up from the already-fetched doctors array. The column header SHALL read "DOCTOR". Unmatched doctor IDs SHALL render as "Unknown Doctor" in gray text.

#### Scenario: Known doctor renders by name
- **WHEN** an appointment's `doctorId` matches an entry in the loaded doctors array
- **THEN** the corresponding cell in the All Appointments table SHALL display `doctor.name`

#### Scenario: Unknown doctor renders a fallback
- **WHEN** an appointment's `doctorId` does not match any loaded doctor
- **THEN** the cell SHALL display "Unknown Doctor" in gray

---

### Requirement: All UTC timestamps display in IST via formatTimestamp

Every timestamp originating from the backend (`checkedInAt`, `cancelledAt`, `createdAt`) that appears in the admin UI SHALL pass through `formatTimestamp()` from `date.utils.ts`. No raw UTC string SHALL be rendered.

#### Scenario: Check-in timestamp renders in IST
- **WHEN** an appointment with `checkedInAt = "2026-05-25T16:10:48Z"` is shown in the detail panel
- **THEN** the displayed string SHALL be formatted as IST via `formatTimestamp()` (e.g. "25 May 2026, 9:40 PM")

#### Scenario: Cancellation timestamp renders in IST
- **WHEN** an appointment has `cancelledAt` set
- **THEN** the cancellation timestamp SHALL render via `formatTimestamp()`

---

### Requirement: Selected card has a visible selected state

When the detail panel is open for an appointment, the corresponding `AppointmentCard` SHALL render a 2-pixel teal ring on all four sides and a `teal-50` background tint. The status-coloured left border SHALL remain visible. When the panel closes, the ring and tint SHALL be removed.

#### Scenario: Selected card shows teal ring and tint
- **WHEN** the detail panel is open for an appointment
- **THEN** the corresponding card SHALL render with `ring-2 ring-teal-600` and `bg-teal-50`
- **AND** the status-coloured left border SHALL remain visible

#### Scenario: Closing the panel removes the highlight
- **WHEN** the detail panel is closed
- **THEN** no card SHALL render the selected-state classes
