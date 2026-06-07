## ADDED Requirements

### Requirement: Global header exposes a patient appointment lookup entry

The site's global header SHALL include a navigation entry that takes the user to the patient appointment lookup page (`/my-appointment`) regardless of which page they are currently on.

#### Scenario: Desktop user clicks the lookup entry from the home page
- **WHEN** a user is on `/` at a viewport width of `md` (768px) or above
- **AND** they click the navigation entry labelled "My Appointment"
- **THEN** the browser navigates to `/my-appointment` without a full page reload
- **AND** the `PatientLookupPage` renders the lookup form (no URL params present)

#### Scenario: Desktop user clicks the lookup entry from any non-home page
- **WHEN** a user is on `/book` (or any other internal route) at a viewport width of `md` or above
- **AND** they click the navigation entry labelled "My Appointment"
- **THEN** the browser navigates to `/my-appointment` without a full page reload

#### Scenario: Mobile user opens the drawer and clicks the lookup entry
- **WHEN** a user is on any page at a viewport width below `md`
- **AND** they tap the hamburger button to open the mobile drawer
- **AND** they tap the drawer entry labelled "My Appointment"
- **THEN** the browser navigates to `/my-appointment` without a full page reload
- **AND** the drawer closes after navigation

#### Scenario: Active state highlights the entry when on the lookup page
- **WHEN** a user is on `/my-appointment`
- **THEN** the "My Appointment" header entry SHALL render in the brand-gold colour with the underline indicator used for other active links

### Requirement: Header does not expose a non-functional "Resources" entry

The header SHALL NOT include a "Resources" link until a corresponding destination (either a page or an in-page section with `id="resources"`) exists.

#### Scenario: Resources link is removed from the nav
- **WHEN** the user inspects the desktop nav or the mobile drawer
- **THEN** no entry labelled "Resources" SHALL be present

### Requirement: Internal route entries use SPA navigation, anchor entries use native scroll

Header entries whose `href` starts with `/` SHALL use `react-router` `<Link>` so they navigate without a full document reload. Entries whose `href` starts with `#` SHALL continue to use `<a href>` so the browser's native in-page scroll behaviour applies.

#### Scenario: Internal route entry navigates without reload
- **WHEN** a user clicks an entry whose `href` is `/my-appointment`
- **THEN** the navigation is handled by the SPA router
- **AND** the page does not perform a full document reload

#### Scenario: Anchor entry scrolls within the current page
- **WHEN** a user clicks an entry whose `href` is `#specialties` and they are on `/`
- **THEN** the browser scrolls to the `#specialties` section without a route change
