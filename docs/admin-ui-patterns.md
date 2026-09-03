# Admin UI patterns

Design system for the Tybo admin workspace (`/store/admin`). Mobile-first,
light theme only, built on Bootstrap 5.3.3 with scoped tokens.

## Admin colour system

### Foundation

Neutral black/white/gray foundation with the existing project yellow accent.
The former purple admin identity (`#6d28d9`, `#5b21b6`, `#ede9fe`) is retired
and must not reappear.

| Token | Value | Purpose |
|---|---|---|
| `--admin-accent` | `#e6b505` | Primary actions, active nav, small active indicators |
| `--admin-accent-rgb` | `230, 181, 5` | RGB form for focus rings/shadows |
| `--admin-accent-hover` | `#d1a304` | Hover/active state on accent controls |
| `--admin-accent-soft` | `#fdf6e0` | Soft accent tint (selected list rows) |
| `--admin-accent-ink` | `#1a1a1a` | Text/icon colour **on** yellow (never white) |
| `--admin-ink` | `#16181d` | Near-black: headings, strong values, bottom-nav surface |
| `--admin-text` | `#2b2f36` | Primary body text |
| `--admin-muted` | `#6b7280` | Secondary text |
| `--admin-bg` | `#f6f7f9` | App background (quiet light gray) |
| `--admin-surface` | `#ffffff` | Cards, list rows, nav surfaces |
| `--admin-border` | `#e5e7eb` | Default borders and separators |
| `--admin-border-strong` | `#d1d5db` | Emphasised borders |
| `--admin-radius` / `--admin-radius-sm` | `10px` / `6px` | Corner rounding |
| `--admin-shadow` / `--admin-shadow-sm` | subtle | Elevation |

Semantic success/warning/danger remain Bootstrap's defaults
(`bg-success-subtle`, `bg-danger-subtle`, `bg-warning-subtle`, …) so status
stays distinct from the accent. Status badges never use yellow.

### Bootstrap variable mapping

All tokens live inside `.admin-workspace` (see
`src/assets/styles/_admin-theme.scss`). Bootstrap's compiled components carry
their own component-level variables, so mapping `--bs-primary` alone is not
enough:

```scss
--bs-primary: var(--admin-accent);
--bs-primary-rgb: var(--admin-accent-rgb);
--bs-link-color: var(--admin-ink);
--bs-link-hover-color: var(--admin-accent-hover);
--bs-focus-ring-color: rgba(var(--admin-accent-rgb), .35);

// Buttons (component-level)
.btn-primary   { --bs-btn-bg: …; --bs-btn-color: var(--admin-accent-ink); … }
.btn-outline-primary { … }
.form-control, .form-select { &:focus { border-color: …; box-shadow: …; } }
.list-group { --bs-list-group-border-color: …; --bs-list-group-active-bg: …; }
.nav-pills  { --bs-nav-pills-link-active-bg: …; }
```

### Legacy `_boot.scss` compatibility boundary

The global `_boot.scss` predates the admin theme and applies `!important`
rules (button radius/width, `.btn-primary` colour, `.btn-light` shadow,
`.text-primary`, `.form-check-input:checked`). Narrowly scoped `!important`
overrides inside `.admin-workspace` re-assert the admin theme without touching
the storefront. This is a temporary boundary; do not add new global overrides.

### Accent usage rules

Yellow is for: primary CTA buttons, the active mobile navigation item,
selected/focused controls, small active indicators, important non-destructive
emphasis. Yellow is never for: body text on white, every icon, every heading,
every badge, every border, decorative gradients, large background regions.
Text/icons placed on yellow must be black or near-black.

## Admin list pattern

Used by Jobs (later: Products with a thumbnail).

- Same structure at every viewport; desktop gets more surrounding space but
  never becomes cards, a grid or a data table.
- Unboxed on mobile: no outer card, no left/right borders, no shadow around
  the list, no per-row rounding. Quiet horizontal separators only.
- Rows carry primary text (strong), secondary text (muted) and one
  right-side status/value (badge or thumbnail).
- The whole row is one semantic `routerLink` to the detail route; no nested
  buttons or interactive elements inside the row link.
- Detail information (amounts, dates, progress) belongs on detail pages, not
  in rows.
- Rows: ~56–72px tall, minimum 44px touch target, safe truncation, visible
  `:focus-visible` outline, subtle hover.

Reference: `src/app/admin/jobs/jobs.component.{html,ts,scss}`.

## Mobile navigation pattern

- Bottom navigation on mobile only (`d-lg-none`): **Home** (`/store/admin`),
  **Jobs** (`/store/admin/jobs`), **Customers** (`/store/admin/customers`),
  **More** (opens the existing admin offcanvas).
- Frequent routes live in the bottom bar; lower-frequency destinations
  (Products, Categories, Work Gallery, Settings, Users, Discounts, Job Cards,
  View Store, Logout) live in the offcanvas.
- Near-black bar, muted-white inactive icons, yellow rounded active pill with
  ink-coloured icon/text, minimum 44px targets, subtle elevation.
- `env(safe-area-inset-bottom)` padding on the bar plus matching content
  clearance (`.admin-content`) so nothing is covered in browsers or installed
  PWA mode.
- Desktop keeps the sidebar; the bottom nav is never duplicated there.
- Internal navigation is Angular Router only (`routerLink`), so no document
  reloads; active state follows child routes (Jobs stays active on job and
  job-item routes; Customers on customer routes). External links (store,
  invoices, print, downloads) keep plain `href`.
- The top bar keeps branding; the hamburger remains as a secondary path.

### Future PWA customer capability (not implemented)

A future enhancement may let the user explicitly pick a contact to import:

- User-triggered contact selection/import only — never silent reading or
  syncing of a user's contacts.
- Prefill customer name and phone from the chosen contact.
- Explicit permission prompts and browser-capability detection first
  (Contact Picker API is not universally available).
- Manual entry must always remain available.
- Do not request device permissions or depend on experimental browser APIs
  until that feature is designed.

## Complex editor pattern

Complex forms (e.g. job items) use dedicated routed pages, not popups:

- Routes carry parent + resource IDs:
  `/store/admin/job/:jobId/items/new` and
  `/store/admin/job/:jobId/items/:jobItemId/edit`.
- A routed page component owns loading, persistence, errors and navigation; a
  reusable form component holds presentation only.
- Direct refresh works on editor routes; the page reloads both IDs and
  verifies ownership (mismatch shows an inline error with a safe route back —
  a failed edit never silently becomes a create).
- Predictable exits: browser Back works, Cancel returns to the parent detail
  page, successful Save returns to the parent detail page.
- Save is disabled while saving with a visible busy state; duplicate
  submissions are guarded.
- Modals remain only for confirmations and small atomic actions (payment
  capture, shipping selection, customer info).

Reference: `src/app/admin/job-item-page/`, `src/app/admin/job-item-form/`.