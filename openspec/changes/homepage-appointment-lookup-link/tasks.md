## 1. Header nav array

- [x] 1.1 In `SmartCareUI/src/components/layout/Header.tsx`, replace the `{ label: 'Resources', href: '#resources' }` entry in `NAV_LINKS` with `{ label: 'My Appointment', href: '/my-appointment' }`.

## 2. Desktop nav rendering — use SPA Link for internal routes

- [x] 2.1 Inside the desktop `<nav>` map, branch the rendered element by `href`: if `href.startsWith('/')`, render `<Link to={href}>` (already imported); otherwise keep the existing `<a href={href}>`.
- [x] 2.2 Preserve all existing classNames, the active-state `span` wrapper, and the `key={label}` prop on both branches so styling is identical.

## 3. Mobile drawer rendering — mirror the same branching

- [x] 3.1 Inside the mobile drawer's nav map, apply the same `href.startsWith('/')` branch: render `<Link to={href}>` for internal routes, keep `<a href={href}>` for anchors.
- [x] 3.2 Both branches MUST call `setMobileOpen(false)` in `onClick` so the drawer closes after a tap, matching the existing anchor behaviour.

## 4. Verification

- [x] 4.1 Run `npm run build` in `SmartCareUI/` and confirm zero TypeScript errors and zero new warnings.
- [x] 4.2 Manually verify from `npm run dev`: click "My Appointment" from `/`, from `/book`, and from `/my-appointment` itself — each navigates without a full reload (Network tab shows no document request) and active-state highlighting appears on `/my-appointment`.
- [x] 4.3 Manually verify the mobile drawer: open at <768px width, tap "My Appointment", confirm the drawer closes and the lookup form renders.
- [ ] 4.4 Manually verify anchor links still work: from `/`, click "Specialties" and confirm the page scrolls to the `#specialties` section without a route change. **Deferred** — the `#specialties` section is not yet implemented on the home page. Revisit when that section ships.
