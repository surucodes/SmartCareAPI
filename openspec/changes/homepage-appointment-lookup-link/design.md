## Context

The site's global `Header` defines navigation via a constant `NAV_LINKS` array in `SmartCareUI/src/components/layout/Header.tsx`. Both the desktop nav (rendered inside an `md:flex` block) and the mobile drawer iterate the same array, so a single edit propagates to both surfaces.

Current entries:

```ts
const NAV_LINKS = [
  { label: 'Home',          href: '/'           },
  { label: 'Find Doctors',  href: '/book'        },
  { label: 'Specialties',   href: '#specialties' },
  { label: 'Services',      href: '#services'    },
  { label: 'About Us',      href: '#about'       },
  { label: 'Resources',     href: '#resources'   },
] as const
```

`#specialties`, `#services`, `#about` scroll to anchored sections on the home page. `#resources` does not — there is no `id="resources"` element anywhere in the codebase. The link is dead weight.

The patient lookup page is already wired:
- Route `/my-appointment` exists in `src/router/index.tsx`.
- `PatientLookupPage` renders the lookup form when no URL params are present.
- The form does its own validation (Zod) and error display.

## Goals / Non-Goals

**Goals:**
- A returning patient lands on the marketing site and can reach the lookup page in one tap.
- The link is visible at all viewport sizes (desktop nav + mobile drawer) without redesigning the header layout.
- Active-state styling is consistent with the other nav entries.

**Non-Goals:**
- Redesigning the header. No layout/spacing changes.
- Adding analytics, A/B tests, or feature flags. This is a static navigation entry.
- Building a deep-link from the homepage hero or footer — header link is sufficient for this change. A footer link can be added later if data shows the header isn't discoverable enough.
- Adding a CTA in the page body of `/`. Out of scope.

## Decisions

### Decision 1 — Replace "Resources" rather than adding a new entry

**Choice:** Swap `{ label: 'Resources', href: '#resources' }` → `{ label: 'My Appointment', href: '/my-appointment' }`.

**Why:**
- The header already has 6 nav links + a "Book Now" CTA, and on `md:` (768px) widths the bar is visually tight. Adding a 7th item risks wrapping or squishing.
- "Resources" links to a non-existent anchor. Keeping it would be misleading either way (whether we leave it or hide it). Replacing it is the lowest-risk delete.
- Information architecture-wise, "My Appointment" is closer to a patient self-service action — the same neighbourhood as "Find Doctors" — and fits naturally in the existing slot.

**Alternatives considered:**
- *Add a 7th link* → header layout would need media-query tuning at `md:`; out of proportion to the task.
- *Add only to mobile drawer* → defeats the purpose; desktop patients also need entry.
- *Add a small "Find my appointment" pill next to Book Now* → visually competes with the primary CTA, splits attention, and creates a two-CTA pattern that the design system avoids.

### Decision 2 — Use a `react-router` `<Link>` for the new entry, not `<a href>`

**Why:**
- The other internal entries currently use `<a href>` (legacy), but those point to in-page anchors that the browser handles natively. `/my-appointment` is a route — using `<Link to>` avoids a full document reload and keeps the SPA bundle warm.
- The Header already imports `Link` from `react-router-dom` (used by the logo + Book Now CTA), so no new imports are needed.

**Trade-off:** The other nav entries stay as `<a href>` for now — fixing those is a separate concern and would expand scope.

### Decision 3 — Active-state matching stays as-is

The existing logic:

```ts
const isActive = href === '/' ? pathname === '/' : pathname === href
```

This will already evaluate `pathname === '/my-appointment'` correctly. No changes needed.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Removing "Resources" silently breaks a bookmarked `/#resources` anchor. | The anchor never resolved to anything (no matching element). No regression possible. |
| Mixing `<Link>` and `<a href>` in the same nav loop produces inconsistent active behaviour for `/my-appointment` vs anchors. | The active-detection branch already handles both — `pathname === '/my-appointment'` and `pathname === '#specialties'` both evaluate cleanly. Anchors never match `pathname` so they only highlight when on `/`, which is the existing behaviour. |
| Mobile drawer renders `<a href>` not `<Link>` — clicking "My Appointment" in the drawer would do a full reload. | Mirror the desktop change: render a `<Link>` for the patient-lookup entry in the mobile drawer. The drawer iterates the same array; we need a small conditional to pick the right element. Acceptable complexity. |
| Active-state colour for "My Appointment" might visually clash with the brand-gold underline used for other active entries. | Same gold + underline treatment applies. Verified: brand-gold against the white header bg is the design-system standard, used identically by "Find Doctors". |

## Migration Plan

Single-file change. No data migration, no API change.

1. Edit `NAV_LINKS` in `Header.tsx`.
2. Update the desktop nav `map` to render a `<Link>` for internal route entries (those whose `href` starts with `/`) and keep `<a>` for in-page anchors.
3. Mirror the same conditional in the mobile drawer `map`.
4. Verify `npm run build`.
5. Manually verify: clicking the link from `/`, `/book`, and `/my-appointment` itself.

Rollback: revert the single commit. No state to migrate.

## Open Questions

No open questions.
