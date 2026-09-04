# Sprint 4 — Multi-Step New Customer Wizard

## Problem

Adding a new customer was a single tall modal. The Create button sat at the
bottom, so on mobile the user had to scroll past address and measurements
they did not want to fill just to finish — and the flow was not URL-addressed
(no deep link, no browser Back inside the flow).

## Goal (user directive)

- Replace the popup with a page (URL-supported).
- Multi-step: **1. Basic details → 2. Address (skippable) → 3. Measurements
  (skippable)**.
- Fixed action bar so Next/Skip is always visible — never scroll-to-skip.

## Implementation

### Route

- `/store/admin/customers/new` → redirects to `/store/admin/customers/new/basic`.
- `/store/admin/customers/new/:step` with `step ∈ { basic, address,
  measurements }`. Unknown steps canonicalize to `basic` (replaceUrl).
- The URL is the single source of truth for the step. The component instance
  is reused across param-only navigations, so the draft survives
  Next/Back/Skip. A full refresh restarts the draft (intentional, documented).

### Component — `src/app/admin/new-customer/`

- **Step 1 Basic details**: Full Name, Email, Phone (same required fields and
  contracts as the previous form) + Import-from-contacts (same behavior as
  the old form, including avatar preview/upload). Next is disabled until all
  three fields have values.
- **Step 2 Address**: Address Line 1/2, City, Postal Code — all optional.
  Footer: Back / Skip for now / Next.
- **Step 3 Measurements**: same measurement grid as before. Footer: Back /
  Skip & create (when no rows have names) / Create Customer (when rows exist).
- **Sticky footer**: `position: sticky; bottom: calc(76px + safe-area)` on
  mobile (clears the fixed bottom nav), `bottom: 0` on md+. Full-bleed
  against `.admin-content` padding.
- **Save contract unchanged**: `CustomerService.save()`,
  `sanitizePhoneNumber`, duplicate-submit guard with `finalize()`. Empty
  measurement rows are filtered out before sending (skip semantics).
- **Save destination**:
  - Default → `/store/admin/customer/:id` (the Sprint 3 detail page).
  - `?return=picker` → `/store/admin/jobs` with navigation state
    `{ addJobFor: CustomerListItem }`.

### Entry points

- **Customers page** (`/store/admin/customers`): New Customer button and the
  empty-state action navigate to the wizard. The modal is removed.
- **Add Job picker** (`customer-list-view`): New Customer button and
  empty-state action navigate to the wizard with `?return=picker`. The inline
  modal is removed. The `onAdd` selection emit is untouched.
- **Jobs page**: on init, reads `history.state.addJobFor`; if present, opens
  Add Job with `[preselectedCustomer]` — the Sprint 3 preselection flow that
  requires an explicit "Create Job" confirmation click, so no job is ever
  created without user intent and the one-request guarantee holds.

### Explicitly unchanged

- `CustomerService.save()` and the backend write contract.
- The **Edit** customer modal (`customer-form`) everywhere it is still used
  (Customer detail, Job view) — this sprint only replaces the *create* flow.
- Legacy `add()` API and all read endpoints.

## Verification (local, 2026-09-04 — dev :4200 + podman PHP :8080)

| Check | Result |
|---|---|
| Customers → New Customer → lands on `/customers/new/basic` | PASS |
| Next disabled until Name + Email + Phone filled | PASS |
| Draft persists across Back/Next/Skip (name, email, phone, address) | PASS |
| Address step skip advances without touching fields | PASS |
| Skip & create creates customer, navigates to detail page, analytics render | PASS |
| No empty measurement rows sent (DB has none for the skip-created customer) | PASS |
| Picker New Customer → `/customers/new/basic?return=picker` | PASS |
| Return flow: jobs page reopens Add Job preselected, explicit confirm | PASS |
| Exactly one `add-job.php` request per confirmation | PASS |
| Sticky footer: Skip button visible at `scrollY=0` with 12 measurement rows | PASS |
| Deep-link to `/new/measurements` renders step 3 directly | PASS |
| Invalid step `/new/bogus` → canonicalized to `/new/basic` | PASS |
| Browser console errors | NONE |
| Test data removed (2 test customers + 1 test job deleted) | PASS |

## Reviewer edge-case fixes (2026-09-04)

Three P2 findings from post-review, all fixed and re-verified:

1. **Preselection lock** — closing the preselected Add Job dialog (or opening
   a normal New Job) left `preselectedCustomer` set, so every later New Job
   opened locked to the wizard's customer. Fixed: `closeAddJob()` clears the
   preselection, `openAddJob()` clears it before opening, and the consumed
   `history.state.addJobFor` is wiped with `Location.replaceState()` so a
   refresh never re-opens the dialog.
2. **`?return=picker` lost between steps** — step navigation now uses
   `queryParamsHandling: 'preserve'` (Next, Back, Skip, and the invalid-step
   canonicalization), so the picker origin survives refresh on any step.
3. **Optional-step deep link with empty draft** — `/new/address` or
   `/new/measurements` deep links (or refreshes) with no basic details now
   redirect to `/new/basic` (params preserved) instead of showing an enabled
   action that silently did nothing.

### Re-verification (local, 2026-09-04)

| Check | Result |
|---|---|
| Save → jobs page preselected → close → New Job again → normal picker | PASS |
| Refresh after preselection consumed → no dialog re-opens | PASS |
| `?return=picker` preserved through Next / Skip / redirect | PASS |
| Refresh on `/new/address?return=picker` (empty draft) → `/new/basic?return=picker` | PASS |
| Deep link `/new/measurements` and `/new/measurements?return=picker` with empty draft → redirect to `/new/basic` (param kept) | PASS |
| Browser console errors | NONE |
| Test data removed (Edge Case Ben customer deleted) | PASS |

Production build: hash `04e1edb0f3bdd282`.

## Deployment note

Frontend-only change (no backend files touched). Deploys with the next
Angular bundle upload; backend verification from Sprint 3 still stands.
