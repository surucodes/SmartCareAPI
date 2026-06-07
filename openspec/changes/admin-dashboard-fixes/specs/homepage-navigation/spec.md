## ADDED Requirements

### Requirement: Public header exposes a Staff Login entry point

The public site's global `Header` SHALL include a "Staff Login" navigation entry that takes the user to `/login`. The entry SHALL be visible from any public page (home, booking, patient lookup). The entry SHALL be visually subtle so it does not compete with the primary "Book Now" CTA.

#### Scenario: Desktop user clicks "Staff Login" from the home page
- **WHEN** a user is on `/` at a viewport width of `md` (768px) or above
- **AND** they click the entry labelled "Staff Login"
- **THEN** the browser SHALL navigate to `/login` without a full page reload

#### Scenario: Staff Login is rendered as a subtle text link, not a button
- **WHEN** the desktop nav is rendered
- **THEN** the "Staff Login" entry SHALL render as plain text in `text-sm` with no filled background and no border
- **AND** the entry SHALL appear to the right of the standard nav items, before the "Book Now" CTA

#### Scenario: Mobile drawer includes Staff Login at the bottom
- **WHEN** a user opens the mobile drawer at a viewport width below `md`
- **THEN** "Staff Login" SHALL appear as the last item in the drawer's link list
- **AND** SHALL be preceded by a subtle divider that separates it from the main nav links

#### Scenario: Tapping Staff Login on mobile closes the drawer and navigates
- **WHEN** a user taps "Staff Login" in the mobile drawer
- **THEN** the drawer SHALL close
- **AND** the browser SHALL navigate to `/login` without a full page reload
