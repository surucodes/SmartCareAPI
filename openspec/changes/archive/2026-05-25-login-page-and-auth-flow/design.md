## Context

`/login` is already a registered route and already imported lazily in the router. The existing stub (`return <div>LoginPage — not yet implemented</div>`) means any staff member redirected there by `ProtectedRoute` sees a blank div.

Infrastructure already in place:
- `authService.login(dto)` → `POST /api/auth/login` → `{ token, email, role, expiresIn }`
- `AuthContext.login(authUser)` stores `window.__smartcare_token = token` and sets React state — memory-only, never localStorage
- `ProtectedRoute` reads `isAuthenticated` from `AuthContext`; redirects to `/login` when false, to `/unauthorized` on wrong role
- TanStack Query v5, React Hook Form + Zod, `react-router-dom` `useNavigate` are all installed

The approved visual design is a centred card on a dark-green background featuring: hospital logo, "STAFF PORTAL" label, "Welcome Back" serif heading, email input with envelope icon, password input with lock icon + show/hide toggle, a branded "Sign In" button, and a patient-facing redirect link at the bottom.

## Goals / Non-Goals

**Goals:**
- Full-fidelity implementation of the approved staff portal login screen.
- `useLogin.ts` hook isolates mutation logic so `LoginPage` stays presentational.
- Role-based redirect after successful authentication (Admin → `/admin`, Doctor → `/doctor`).
- Clear inline error display for wrong credentials and server errors.
- `/setup` stub route registered as unprotected for future use.

**Non-Goals:**
- "Forgot password" or email verification flows — out of scope.
- Persistent sessions (refresh token, `localStorage`) — memory-only JWT is the established contract.
- Redesigning `AuthContext` or `ProtectedRoute` — they are correct as-is.
- Backend changes — `POST /api/auth/login` already exists.
- Patient-facing login — this page is staff-only.

## Decisions

### Decision 1 — Dedicated `useLogin.ts` hook, not inline mutation

**Choice:** Extract auth mutation into `SmartCareUI/src/hooks/useLogin.ts`.

**Why:** `LoginPage` already manages form state via RHF. Mixing `useMutation` inside the same component creates two interleaved state machines (form + async). A dedicated hook keeps the component presentational and makes the hook independently testable. This mirrors the existing `useAppointmentLookup.ts` pattern already in the codebase.

**Alternatives considered:**
- *Inline `useMutation` in `LoginPage`* → simpler file count but muddies the component; rejected.
- *Redux thunk / Zustand action* → no state manager is set up; overkill for a single mutation.

### Decision 2 — `useNavigate` called from the hook's `onSuccess`, not the component

**Why:** The hook owns the auth state side-effect (`useAuth().login()`) so it's natural to own the navigation side-effect too. The component passes no redirect logic — it just calls `submitLogin({ email, password })`.

**Trade-off:** Hook is navigation-aware, which is slightly harder to unit-test in isolation. Acceptable because the hook is intrinsically tied to post-login UX.

### Decision 3 — Inline SVG show/hide password toggle, no external library

**Why:** The project uses zero icon libraries. Adding one (e.g., react-icons) for a single toggle icon is not proportional. Inline SVG eye/eye-off paths are already used throughout the codebase (e.g., the arrow in the "Book Now" button). Consistent approach, no new bundle weight.

### Decision 4 — Error display: single server-error banner below the form, not field-level

**Why:** Login failures ("Invalid credentials", "Account disabled") are always server-side and do not map to a specific field — highlighting email vs password would be misleading. A banner below the form matches the pattern used in `Step3PatientDetails.tsx` and `AppointmentLookupForm.tsx`.

### Decision 5 — `/setup` registered as a lazy-loaded stub, no `ProtectedRoute`

**Why:** The setup route may need to be reached before any admin account exists (initial seeding scenario). Wrapping it in `ProtectedRoute` would deadlock that flow. A stub `SetupPage` component is the safest placeholder.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Hook calls `useNavigate` — if rendered outside a Router context in tests, it throws. | Tests can wrap the hook with `MemoryRouter` or mock `react-router-dom`. |
| `window.__smartcare_token` is cleared on tab close/refresh; staff must log in again. | Intentional design. Session persistence is out of scope. |
| `ProtectedRoute` redirects to `/unauthorized` for role mismatch, but that route is not registered. | Existing gap, pre-existing. Not introduced by this change. Out of scope. |
| `/setup` stub is unprotected and publicly accessible. | Stub renders no sensitive data or functionality. Acceptable until the real setup flow is built. |

## Migration Plan

1. Create `SmartCareUI/src/hooks/useLogin.ts`.
2. Replace `SmartCareUI/src/pages/auth/LoginPage.tsx` stub with full implementation.
3. Create `SmartCareUI/src/pages/setup/SetupPage.tsx` stub.
4. Add `/setup` route to `SmartCareUI/src/router/index.tsx`.
5. Run `npm run build` — confirm zero TypeScript errors.

Rollback: revert the commit. No data migration, no backend changes.

## Open Questions

No open questions.
