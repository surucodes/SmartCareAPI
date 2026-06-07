## ADDED Requirements

### Requirement: Login page renders the staff portal UI

The `/login` route SHALL render a centred card on a dark-green (`#132b1a`) full-screen background. The card SHALL contain, in order from top to bottom: the Spandana Hospital logo, a "STAFF PORTAL" label, a "Welcome Back" heading in a serif font, an email input, a password input with a show/hide toggle, a "Sign In" submit button, and a link directing patients to the public booking page.

#### Scenario: Page loads with correct structure
- **WHEN** a user navigates to `/login`
- **THEN** the page SHALL display the hospital logo, the text "STAFF PORTAL", the heading "Welcome Back", an email field, a password field, and a "Sign In" button

#### Scenario: Page is accessible to unauthenticated users
- **WHEN** an unauthenticated user visits `/login`
- **THEN** the page SHALL render without redirecting

#### Scenario: Patient redirect link is visible
- **WHEN** the login page renders
- **THEN** a link labelled "Looking for your appointment? →" (or similar) SHALL be visible at the bottom of the card and SHALL navigate to `/my-appointment`

---

### Requirement: Login form validates inputs before submission

The form SHALL use React Hook Form with Zod schema validation. Submission SHALL be blocked until both fields pass validation. Errors SHALL appear inline below each field.

#### Scenario: Empty form submission is blocked
- **WHEN** the user clicks "Sign In" without entering any values
- **THEN** the form SHALL NOT submit
- **AND** validation error messages SHALL appear below the email and password fields

#### Scenario: Invalid email format is rejected
- **WHEN** the user enters a string that is not a valid email address in the email field
- **AND** blurs or submits the form
- **THEN** an inline error SHALL appear below the email field

#### Scenario: Password below minimum length is rejected
- **WHEN** the user enters fewer than 6 characters in the password field
- **AND** blurs or submits the form
- **THEN** an inline error SHALL appear below the password field

---

### Requirement: Show/hide password toggle controls field visibility

The password input SHALL include a toggle button that switches the `input[type]` between `"password"` (characters hidden) and `"text"` (characters visible). The toggle SHALL use an inline SVG eye / eye-off icon with no external icon library dependency.

#### Scenario: Password is hidden by default
- **WHEN** the login page first renders
- **THEN** the password input `type` attribute SHALL be `"password"`

#### Scenario: Toggle reveals the password
- **WHEN** the user clicks the show/hide toggle button while the input type is `"password"`
- **THEN** the input `type` SHALL change to `"text"`

#### Scenario: Toggle re-hides the password
- **WHEN** the user clicks the toggle button while the input type is `"text"`
- **THEN** the input `type` SHALL change back to `"password"`

---

### Requirement: Successful login redirects staff by role

On a `200` response from `POST /api/auth/login`, the hook SHALL call `useAuth().login({ email, role, token })` to store the JWT in memory, then navigate without a full page reload:
- Role `"Admin"` → `/admin`
- Role `"Doctor"` → `/doctor`

#### Scenario: Admin is redirected to the admin dashboard
- **WHEN** a staff member with role `"Admin"` submits valid credentials
- **AND** the server responds with `{ token, email, role: "Admin" }`
- **THEN** the SPA SHALL navigate to `/admin` without a full document reload
- **AND** `window.__smartcare_token` SHALL be set to the returned token

#### Scenario: Doctor is redirected to the doctor schedule
- **WHEN** a staff member with role `"Doctor"` submits valid credentials
- **AND** the server responds with `{ token, email, role: "Doctor" }`
- **THEN** the SPA SHALL navigate to `/doctor` without a full document reload
- **AND** `window.__smartcare_token` SHALL be set to the returned token

---

### Requirement: Failed login displays an error banner

On a `401` or `403` response, or on a network error, the login form SHALL display a non-dismissible error banner below the submit button. The form fields SHALL remain editable so the user can correct their input and retry.

#### Scenario: Wrong credentials show an error
- **WHEN** a staff member submits credentials that the server rejects with `401`
- **THEN** an error banner SHALL appear below the "Sign In" button
- **AND** the email and password fields SHALL remain editable

#### Scenario: Network error shows a generic error
- **WHEN** the network request fails (no response)
- **THEN** an error banner SHALL appear with a generic "Something went wrong" message

---

### Requirement: Sign In button reflects submission state

During the async login request, the "Sign In" button SHALL show a loading indicator and SHALL be disabled to prevent duplicate submissions. On completion (success or error), the button SHALL return to its normal state.

#### Scenario: Button is disabled while submitting
- **WHEN** the user clicks "Sign In" and the request is in-flight
- **THEN** the button SHALL be disabled
- **AND** the button SHALL display a loading indicator in place of the label text

#### Scenario: Button re-enables after failure
- **WHEN** the login request returns a `401`
- **THEN** the button SHALL be re-enabled and display "Sign In" again

---

### Requirement: Login page meets accessibility and touch-target standards

All interactive elements SHALL meet the following minimums to ensure usability on mobile and assistive technology:
- Input font-size SHALL be at least `16px` to prevent iOS auto-zoom.
- Clickable targets (inputs, buttons, toggle) SHALL have a minimum height of `44px`.
- Password toggle button SHALL have an `aria-label` describing its current action.

#### Scenario: Inputs do not trigger iOS zoom
- **WHEN** the login page is viewed on a mobile viewport
- **THEN** the email and password inputs SHALL have a computed `font-size` of at least `16px`

#### Scenario: Touch targets are large enough
- **WHEN** the login page is rendered
- **THEN** the email input, password input, toggle button, and Sign In button SHALL each have a minimum height of `44px`
