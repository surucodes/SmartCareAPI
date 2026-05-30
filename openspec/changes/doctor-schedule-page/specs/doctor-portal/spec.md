## ADDED Requirements

### Requirement: Doctor portal renders only the logged-in doctor's appointments

The `/doctor` route SHALL render a portal showing appointments belonging only to the doctor record associated with the logged-in user. Other doctors' appointments SHALL never be fetched or displayed in this view.

#### Scenario: Page fetches via the doctor-scoped endpoint
- **WHEN** the doctor portal renders for a logged-in doctor with resolved `doctorId`
- **THEN** the dashboard SHALL call `appointmentsService.getByDoctor(doctorId, includePast)`
- **AND** SHALL NOT call `appointmentsService.getAll()` to retrieve appointments

#### Scenario: No admin actions appear in the doctor view
- **WHEN** the doctor views any appointment card or detail surface
- **THEN** no "Check In" button SHALL appear
- **AND** no "No Show" button SHALL appear
- **AND** no "+ Add Appointment" or walk-in booking control SHALL appear

---

### Requirement: Doctor identity is resolved on first load and persisted in sessionStorage

Because the JWT does not include `doctorId`, the portal SHALL resolve doctor identity on first load via the following chain:

1. If a stored doctor selection exists in `sessionStorage` keyed to the current user, use it.
2. Otherwise, fetch all doctors. If exactly one doctor exists, auto-select it.
3. Otherwise, render a doctor selector listing all doctors; the user picks their record; the selection is written to `sessionStorage` and the page proceeds.

#### Scenario: Stored selection is honoured
- **WHEN** the portal mounts and `sessionStorage` contains a doctor selection for the current user
- **THEN** the stored `doctorId` SHALL be used immediately without rendering the selector

#### Scenario: Selector is shown when no selection exists
- **WHEN** the portal mounts, no selection is stored, and multiple doctors exist
- **THEN** the doctor selector SHALL render with a card per doctor (photo + name + specialty)
- **AND** tapping a card SHALL persist that `doctorId` in `sessionStorage` and proceed to render the schedule

#### Scenario: Single doctor is auto-selected
- **WHEN** the portal mounts, no selection is stored, and exactly one doctor record exists
- **THEN** that doctor SHALL be selected automatically without rendering the selector

---

### Requirement: Action button visibility follows the doctor-only state machine

The set of action buttons rendered on each `DoctorAppointmentCard` SHALL be determined exclusively by a pure helper `getDoctorActions(appointment)`. The state machine SHALL be:

| Status      | `checkedInAt`  | Primary buttons              | Reschedule link |
|---           |---             |---                           |---              |
| Pending     | null           | Confirm, Cancel              | yes             |
| Pending     | not null       | Confirm, Complete, Cancel    | yes             |
| Confirmed   | null           | Cancel                       | yes             |
| Confirmed   | not null       | Complete, Cancel             | yes             |
| Completed   | (any)          | —                            | no              |
| Cancelled   | (any)          | —                            | no              |
| NoShow      | (any)          | —                            | no              |

#### Scenario: No Check In or No Show button ever appears
- **WHEN** the doctor portal renders any appointment card
- **THEN** no "Check In" button SHALL appear regardless of status
- **AND** no "No Show" button SHALL appear regardless of status
- **AND** this rule SHALL hold even though the Stitch desktop reference renders a "No Show" button on Confirmed cards — that button is an intentional omission

#### Scenario: Confirmed + not checked-in shows only Cancel and Reschedule
- **WHEN** an appointment has `status === 'Confirmed'` and `checkedInAt === null`
- **THEN** the only primary button on the card SHALL be "Cancel"
- **AND** the Reschedule link SHALL be visible below the buttons

#### Scenario: Read-only states show no buttons or reschedule link
- **WHEN** an appointment has status `Completed`, `Cancelled`, or `NoShow`
- **THEN** no buttons SHALL appear on the card
- **AND** no Reschedule link SHALL appear

---

### Requirement: Cancel always opens DoctorCancelForm — never fires directly

Clicking the "Cancel" button SHALL never call the cancel mutation directly. It SHALL expand `DoctorCancelForm` inline below the card content. The mutation SHALL only run when the form's submit is clicked with a reason of at least 5 characters.

#### Scenario: Cancel button opens the reason form, not the mutation
- **WHEN** the doctor clicks "Cancel" on an appointment card
- **THEN** `DoctorCancelForm` SHALL expand inline below the card
- **AND** the cancel API mutation SHALL NOT be called

#### Scenario: Confirm cancellation is disabled until 5 characters are entered
- **WHEN** `DoctorCancelForm` is open and the reason textarea has fewer than 5 characters
- **THEN** the "Confirm Cancellation" button SHALL be disabled

#### Scenario: Cancel calls updateStatus with cancelledBy 'Doctor'
- **WHEN** the doctor submits a valid cancellation reason
- **THEN** the request SHALL include `cancelledBy: 'Doctor'` in the body
- **AND** SHALL include the entered `cancellationReason`

---

### Requirement: Reschedule expands inline below the card

The "Reschedule →" text link SHALL expand `DoctorRescheduleForm` inline below the card. The form's "New Time" field SHALL be a plain text input (not a time picker), validated against `/^\d{2}:\d{2}$/`. The minimum date SHALL be tomorrow in IST.

#### Scenario: Reschedule time uses a text input, not a time picker
- **WHEN** `DoctorRescheduleForm` renders
- **THEN** the "New Time" field SHALL be `<input type="text">` (or equivalent), not `<input type="time">`
- **AND** SHALL validate against the pattern `HH:MM` (24-hour)

#### Scenario: Minimum date is tomorrow in IST
- **WHEN** `DoctorRescheduleForm` renders
- **THEN** the New Date field's `min` attribute SHALL be `getTodayIST()` + 1 day in `yyyy-MM-dd`

#### Scenario: Successful reschedule closes the form and refetches
- **WHEN** the reschedule request succeeds
- **THEN** the form SHALL collapse
- **AND** the schedule SHALL refetch

---

### Requirement: Cancel and Reschedule forms are mutually exclusive per card

At most one of `DoctorCancelForm` or `DoctorRescheduleForm` SHALL be open on a single card at a time. Opening one SHALL close the other.

#### Scenario: Opening Cancel closes Reschedule
- **WHEN** the Reschedule form is open and the doctor clicks "Cancel"
- **THEN** the Reschedule form SHALL collapse
- **AND** the Cancel form SHALL expand

---

### Requirement: Week strip surfaces date navigation and dots for days with appointments

The portal SHALL render a 7-day week strip starting Monday. Each day cell SHALL show the short day name and date number. The cell representing the currently selected date SHALL render with a teal-filled circle around the number. Each cell SHALL render a small dot if at least one appointment exists for the doctor on that date.

#### Scenario: Today is highlighted distinctly
- **WHEN** the week strip is rendered and one cell's date equals today
- **THEN** that cell SHALL render with a visual indicator that distinguishes it from the other cells

#### Scenario: Selected date overrides today's style
- **WHEN** the selected date differs from today
- **THEN** the selected date's cell SHALL render with the teal-filled selection style
- **AND** today's cell SHALL render its today-only indicator without the selection style

#### Scenario: Cells with appointments show a dot
- **WHEN** a date in the visible week has at least one appointment for the doctor
- **THEN** that cell SHALL render a small dot below the date number

#### Scenario: Clicking a day changes the selected date
- **WHEN** the doctor taps a day cell
- **THEN** `selectedDate` SHALL update to that cell's date in `yyyy-MM-dd`
- **AND** the appointments list SHALL refetch for the new date

---

### Requirement: Status filter pills slice the day's appointments

A row of filter pills SHALL render below the date heading with options: All, Confirmed, Pending, Cancelled. Exactly one pill SHALL be active at a time. The default SHALL be All.

#### Scenario: Filter applies to the currently selected day
- **WHEN** the doctor selects the "Confirmed" filter pill
- **THEN** only appointments with status `Confirmed` for the selected date SHALL be shown

#### Scenario: Cancelled filter shows Cancelled and NoShow
- **WHEN** the "Cancelled" filter pill is active
- **THEN** appointments with status `Cancelled` and `NoShow` SHALL be shown together

---

### Requirement: "All" view shows active appointments then a PAST & CLOSED section

When the All filter is active, the appointment list SHALL split into two groups:

- Group 1 (active): `Pending` and `Confirmed`, rendered first.
- Group 2 (past & closed): `Completed`, `Cancelled`, `NoShow`, rendered below a "PAST & CLOSED" section divider with reduced-opacity cards.

#### Scenario: PAST & CLOSED divider appears only under All
- **WHEN** the All filter is active and the day has at least one completed/cancelled/no-show appointment
- **THEN** a "PAST & CLOSED" divider SHALL appear between the active group and the closed group

#### Scenario: Specific-status filters do not show the divider
- **WHEN** any filter other than All is active
- **THEN** the "PAST & CLOSED" divider SHALL NOT be rendered

---

### Requirement: Patient avatars are always initials, never photos

Each `DoctorAppointmentCard` SHALL render the patient identity using a 2-letter initials avatar (gray background, teal text). The portal SHALL NOT fetch or display patient photos.

#### Scenario: Two-word patient name renders first + last initials
- **WHEN** an appointment's patient name is "Robert Chen"
- **THEN** the avatar SHALL show "RC"

#### Scenario: Single-word patient name renders first two letters
- **WHEN** an appointment's patient name is "Madonna"
- **THEN** the avatar SHALL show "MA"

---

### Requirement: Schedule polls every 60 seconds; processExpired fires silently on mount

On mount, the portal SHALL call `appointmentsService.processExpired()` once as a silent background operation. Errors SHALL be swallowed and logged to console only. Once the call resolves or rejects, the day query SHALL become enabled. The day query SHALL refetch every 60 seconds.

#### Scenario: processExpired runs silently before the first fetch
- **WHEN** the doctor portal mounts
- **THEN** `processExpired()` SHALL be called exactly once
- **AND** no UI indicator SHALL be shown for that call
- **AND** the appointments query SHALL be `enabled` only after the call resolves or rejects

#### Scenario: Day query polls every 60 seconds
- **WHEN** the portal is open
- **THEN** the day appointments query SHALL refetch every 60 seconds
