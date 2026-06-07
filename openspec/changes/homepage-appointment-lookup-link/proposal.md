## Why

The patient appointment lookup page (`/my-appointment`) is fully implemented but only reachable from the booking confirmation screen via the "View My Appointment" button. A returning patient who closes the tab — or who received their appointment ID by email and lands on the marketing site days later — has no way back in. They have to either re-book or guess the URL.

We need a permanent, obvious entry point to the lookup page from the global header so any patient can find their appointment from any page on the site.

## What Changes

- Add a header link labelled **"My Appointment"** that navigates to `/my-appointment`.
- The link replaces the unused **"Resources"** entry in `NAV_LINKS` rather than expanding the nav (the bar is already tight on tablets at `md` and the Resources link has no destination yet).
- The link is visible in both the desktop nav bar and the mobile drawer.
- Active-state styling already handled by the existing `pathname === href` logic in `Header.tsx` — no new active-detection logic needed.
- No changes to PatientLookupPage itself: when reached without URL params, it shows the lookup form (already implemented).

## Capabilities

### New Capabilities
- `homepage-navigation`: defines the requirements for the marketing-site global header — which top-level links exist, their destinations, and how the lookup entry point is exposed.

### Modified Capabilities
<!-- None — no existing specs to amend. -->

## Impact

- **Code**: `SmartCareUI/src/components/layout/Header.tsx` — one entry in the `NAV_LINKS` array changes, both mobile and desktop nav inherit the change automatically.
- **Routing**: no change — `/my-appointment` is already registered in `src/router/index.tsx`.
- **APIs**: none.
- **Dependencies**: none.
- **Backwards compatibility**: the removed "Resources" link was a `#resources` anchor that did not scroll anywhere — removing it has no user-visible regression.
