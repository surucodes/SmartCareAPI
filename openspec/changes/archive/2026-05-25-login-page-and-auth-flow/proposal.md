## Why

The staff authentication flow is incomplete — `/login` renders a stub and the `ProtectedRoute` guards on `/admin` and `/doctor` already redirect unauthenticated staff to `/login`, so any admin or doctor who follows that redirect lands on a blank page. Building the login page closes the gap and makes the staff portal usable end-to-end.

## What Changes

- Replace the `LoginPage` stub with a fully designed staff portal login screen matching the approved visual spec (logo, "STAFF PORTAL" label, "Welcome Back" serif heading, email + password fields with icons, show/hide password toggle, Sign In button, patient redirect link).
- Add `useLogin.ts` — a `useMutation`-based hook that calls `authService.login()`, stores the JWT in memory via `useAuth().login()`, and redirects by role: Admin → `/admin`, Doctor → `/doctor`.
- Add a `/setup` stub route (unprotected) so future setup/onboarding work has a registered path without touching ProtectedRoute logic.
- Confirm (no change needed) that `/admin` and `/doctor` already have `ProtectedRoute` guards.

## Capabilities

### New Capabilities
- `staff-authentication`: Defines the login UI, form validation rules, error states, credential submission flow, role-based post-login redirect, and session storage contract for SmartCare staff users.

### Modified Capabilities
<!-- None — ProtectedRoute, AuthContext, and authService behaviour are unchanged. -->

## Impact

- **Code**: `SmartCareUI/src/pages/auth/LoginPage.tsx` (replace stub), `SmartCareUI/src/hooks/useLogin.ts` (new), `SmartCareUI/src/router/index.tsx` (add `/setup` stub).
- **Routing**: No existing routes change. `/setup` added as unprotected stub.
- **APIs**: `POST /api/auth/login` already implemented; no backend changes.
- **Dependencies**: No new packages. Uses TanStack Query v5 (`useMutation`), React Hook Form + Zod, `react-router-dom` `useNavigate`.
- **Backwards compatibility**: The stub `LoginPage` had no users. Replacing it is non-breaking.
