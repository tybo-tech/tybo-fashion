# Sprint 5 — Job Hierarchy: Overview → Plain Garment List → Garment Details

> Revision 3 — approved direction with implementation-safe routing,
> editing and data-integrity contracts resolved before build. See
> "Revision 3 changes" at the end for what moved.

## Problem

The current job page mixes overview, editing, item management, payments
and destructive actions in one surface. The hierarchy should be:

**Jobs → Job details → Garment details**

Findings on latest `main` (`b4638c8`):

- Only the thumbnail and garment name navigate; the complete row should
  navigate.
- Status and total are repeated in multiple places.
- The customer field opens another editable form inside the job page,
  adding another mixed responsibility.
- The garment page loads the entire job and locates the item client-side,
  although a dedicated item endpoint already exists.
- The actual PHP endpoints have no server-verified authentication
  context. A client-supplied `CompanyId` is scoping, not authentication.
- The garment mutation flow deletes first, fires the parent update
  without checking its result, then immediately reports success —
  totals can silently diverge.
- Routes such as `/job/:id/jobs` work, but the final hierarchy reads
  better under `/jobs/:jobId`, with redirects from legacy links.

## Goal (user directive)

- **Clean parent overview** — job details is read-first.
- **Plain child list** — garments rendered as a plain list, no cards.
- **Dedicated child detail/editor** — the only editing surface.
- **Destructive action only at the deepest level.**

## 1. Routing (locked first — blocking)

`/jobs/:jobId` conflicts directly with the existing `/jobs/:status`;
Angular cannot distinguish those parameter names. The route map below
removes the ambiguity and is locked before any component work.

### Route map

| Route | Purpose |
| --- | --- |
| `/jobs` | Jobs list (status filter via query param `?status=`) |
| `/jobs/:jobId` | Job overview |
| `/jobs/:jobId/edit` | Job editor |
| `/jobs/:jobId/garments/new` | Add garment |
| `/jobs/:jobId/garments/:garmentId` | Garment details/editor |

### Redirects

- Replace `/jobs/:status` with explicit redirects for the six known
  status slugs → `/jobs?status=...`.
- **Unknown-slug fallback**: after removing `/jobs/:status`, any
  `/jobs/<segment>` matches `/jobs/:jobId` — so an unknown status slug
  cannot "fall back" by route shape. Job IDs are matched with a **UUID
  `UrlMatcher`** on `/jobs/:jobId`; a `/jobs/**` wildcard route beneath
  it redirects anything that is not a UUID to `/jobs`. (This is
  preferred over validating inside the component, which would flash a
  loading state before redirecting.)
- Legacy redirects, locked separately (note `/job/:id/jobs` is an
  instance of `/job/:id/:backTo`, and neither carries a garment ID):

  | Legacy | New |
  | --- | --- |
  | `/job/:id` | `/jobs/:id` |
  | `/job/:id/:backTo` (incl. `/job/:id/jobs`) | `/jobs/:id` |
  | `/job/:jobId/items/new` | `/jobs/:jobId/garments/new` |
  | `/job/:jobId/items/:jobItemId/edit` | `/jobs/:jobId/garments/:jobItemId` |

  `:backTo` is dropped; the overview is the canonical parent and
  browser Back works naturally.

## 2. Job details becomes primarily an overview

Keep on the overview:

- Job number, status, due date and payment summary.
- Customer summary.
- Invoice and payment actions.
- Garments list.
- Totals and special instructions.

Changes:

- **Status remains the only deliberate quick action on the overview**
  (it changes frequently). Everything else is read-first.
- Customer, due date and special instructions move to the job editor
  below. Payments, invoices and shipping remain dedicated overview
  actions.

## 3. Edit job (`/jobs/:jobId/edit`)

The editor is a real route, not an in-place form.

- **Route/component**: `/jobs/:jobId/edit`, dedicated component
  (`src/app/admin/job-editor/` or equivalent), reusing existing job
  save contracts.
- **Fields owned by the editor**: customer, due date, special
  instructions. Nothing else.
- **Save/cancel**: Save commits via the existing update contract and
  returns to `/jobs/:jobId`. Cancel discards local changes and returns.
  Navigating away with unsaved changes prompts (unsaved-change guard).
- **Loading / errors / duplicate-submit**: standard loading state;
  save failures surface an inline error with Retry; duplicate-submit
  guard (e.g. `finalize()` pattern used in the wizard) prevents double
  saves.
- **Status** is not editable here — it stays the overview quick action
  to avoid two competing status surfaces.

## 4. Garments becomes the same plain-list pattern as Jobs

Remove the rounded container around every garment, quantity stepper and
delete button.

Each row shows:

- Small thumbnail.
- Garment name.
- Size and colour.
- `Qty 1`.
- Assigned person, when available.
- Line total.
- Chevron.

Rules:

- **The Garments section itself is unboxed** — no section-level shadow,
  rounded container or card. It is not enough to flatten the rows while
  leaving the whole list inside the current shadowed card.
- The entire row is one clickable target — keyboard focusable, with at
  least 44px touch targets.
- Only top, bottom and between-row separators — no row shadows or
  rounded cards.
- Keep **Add garment** in the section header (`/jobs/:jobId/garments/new`).
  Shopify may lock down order editing more heavily, but Tybo's tailoring
  workflow genuinely needs garments to be added after job creation.
- Empty-garment state: quiet message plus the **Add Garment** action.
- Removing a garment happens only on the garment details page — never
  from the list.

## 5. Garment details becomes the only editing surface

Clicking a garment opens:

`JOB642 → Mini length ostrich leather skirt`

- **Heading**: the garment name is the final page heading;
  "Garment details" is the context label above it.
- **Naming**: the UI uses **Garment** throughout; internal `JobItem`
  API/model names remain unchanged.
- The page owns: image, name, size and measurements, colour, quantity,
  unit price, assigned person, notes, print card, save.
- **Remove from job** sits at the bottom as a quiet danger action.
  Confirmation names the garment and explains that job totals will be
  recalculated. Confirmation copy also covers the last-garment case
  (see contract below).
- States: loading, 404 (garment not in this job), forbidden, save
  failure with Retry, and unsaved-change/cancel behaviour.

## 6. Item read + total-recalculation contract (blocking)

`getJobItemById()` alone cannot replace the full-job load, because
add/edit/remove is followed by a parent-totals update. The contract is:

- **Scoped garment-detail read**: the endpoint receives
  `CompanyId + JobId + JobItemId` and validates all three (garment
  belongs to job, job belongs to company). Cross-job and cross-company
  garment IDs are rejected.
- **Server-side totals**: add/update/remove operations recalculate and
  persist job totals **server-side in the same transaction** as the
  item mutation.
- **Exact mutation response** (add/edit return the saved garment;
  removal cannot, so the shape is explicit):

  ```ts
  interface JobGarmentMutationResponse {
    garment: JobItem | null;          // null on removal
    removedJobItemId: string | null;  // set on removal
    totals: {
      itemsSubtotal: number;
      discountAmount: number;
      shippingPrice: number;
      totalCost: number;
      paidAmount: number;
      dueAmount: number;
    };
  }
  ```

  The client no longer recalculates or chains a second parent request.
- **Removal verb**: removal must become a POST/DELETE operation — not
  the existing state-changing GET. New endpoints are **additive**;
  legacy endpoints remain intact for rollback.
- **Atomicity**: never report complete success when the garment
  mutation succeeds but the parent-total update fails — the transaction
  rolls back and the UI shows a save-failure state.
- **Removal path fixed**: the current delete-first/fire-and-forget flow
  is replaced by the transaction above; success is shown only when the
  full transaction commits.
- **Last garment**: removing the last garment is allowed; the job
  remains valid with an empty garments list (empty state on the
  overview). The confirmation copy states this explicitly. See the
  financial formula for how totals behave.
- **Financial formula (locked)** — the existing behaviour is
  normative:

  - `item.SubTotal = UnitPrice × Quantity`
  - Percentage discount applies to garments only.
  - Shipping is added after the garment discount.
  - Paid amount is the sum of `Metadata.payments`.
  - Due amount is `TotalCost − paidAmount`.

  For **last-garment removal, the current `delete_from_cart()`
  behaviour is explicitly NOT preserved** (it replaces almost all
  metadata and forces `TotalCost = 0`). Instead it must:

  - Preserve invoice, payments, proof and unrelated metadata.
  - Remove/reset garment-discount fields appropriately.
  - Preserve shipping.
  - Set total to the remaining shipping charge.
  - Recalculate paid and due amounts consistently.

  Transaction tests are required for: no discount, percentage
  discount, shipping, payments, last garment, rollback failure, and an
  already-overpaid job.
- Tampered `JobId`, `CompanyId` and body identifiers are rejected
  (mismatch between path and body identifiers is a 4xx, not a silent
  success).

## 7. Backend scope — authentication decision (blocking)

The actual PHP endpoints currently have no server-verified
authentication context; adding a client-supplied `CompanyId` is
scoping, not authentication.

**Decision: Sprint 5 is a UI + data-integrity sprint.** It implements
the scoping and transactional contracts above (identifier validation,
cross-job/cross-company rejection, atomic totals) but does **not**
claim tenant enforcement or authentication. Establishing real
server-side authentication (server-verified session/token deriving
company identity) is carried as a separate security sprint covering:

- `get-job.php`, `update-job.php` and the job-item endpoints together —
  securing only the garment endpoints would leave the parent route
  exposed.
- A server-verified auth context for all job/job-item reads and writes.

The sprint doc and code must not use language implying tenant
enforcement until that security sprint lands.

## Acceptance criteria

Routing

- [ ] Route map implemented exactly as in §1; no `/jobs/:status`
      parameter route remains.
- [ ] Six status slugs redirect to `/jobs?status=...`; a UUID
      `UrlMatcher` guards `/jobs/:jobId` and a `/jobs/**` fallback
      redirects non-UUID segments (unknown status slugs) to `/jobs`.
- [ ] All legacy redirects implemented per the §1 table: `/job/:id`,
      `/job/:id/:backTo` (incl. `/job/:id/jobs`) → `/jobs/:id`;
      `/job/:jobId/items/new` → `/jobs/:jobId/garments/new`;
      `/job/:jobId/items/:jobItemId/edit` →
      `/jobs/:jobId/garments/:jobItemId`.
- [ ] Direct refresh, browser Back and legacy-link redirects all work
      on overview, editor and garment pages.

Overview & editor

- [ ] Job page is read-first; customer/due date/special instructions
      edit only via `/jobs/:jobId/edit`.
- [ ] Status is the only quick action on the overview.
- [ ] Editor defines save/cancel, unsaved-change guard, loading, error
      + Retry and duplicate-submit protection.
- [ ] Payments, invoices and shipping remain dedicated overview
      actions.

Garment list

- [ ] The Garments section is unboxed — no section-level shadow or
      card, not just flattened rows.
- [ ] Garment rows are plain list rows (thumbnail, name, size/colour,
      qty, assigned person, line total, chevron) — no cards, no
      steppers, no inline delete.
- [ ] Entire row navigates; rows are keyboard focusable with ≥44px
      touch targets.
- [ ] Empty-garment state plus **Add Garment** action;
      `/jobs/:jobId/garments/new` workflow supported.
- [ ] UI copy uses **Garment**; `JobItem` API/model names unchanged.

Garment details

- [ ] Garment name is the final page heading; "Garment details" is the
      context label.
- [ ] Garment details is the only editing surface; **Remove from job**
      lives only at its bottom with confirmation naming the garment and
      explaining totals recalculation.
- [ ] Garment page uses the scoped item read (`CompanyId + JobId +
      JobItemId`) — no full-job load with client-side lookup.
- [ ] Loading, 404, forbidden, save-failure/Retry and
      unsaved-change/cancel states implemented.
- [ ] Duplicate save and duplicate remove protection.

Data integrity

- [ ] Add/edit/remove persist item mutation + job totals in one
      server-side transaction; response matches the
      `JobGarmentMutationResponse` contract (§6).
- [ ] Totals follow the locked financial formula (§6): subtotals,
      garment-only percentage discount, shipping after discount, paid
      from `Metadata.payments`, due as `TotalCost − paidAmount`.
- [ ] Removal is a POST/DELETE operation, not a state-changing GET;
      new endpoints are additive and legacy endpoints intact.
- [ ] No false success when the parent-total update fails.
- [ ] Cross-job and cross-company garment IDs are rejected.
- [ ] Tampered `JobId`, `CompanyId` and body identifiers are rejected.
- [ ] Last-garment removal preserves invoice/payments/proof/unrelated
      metadata and shipping, resets garment-discount fields, sets total
      to remaining shipping charge, and recalculates paid/due — it does
      not reuse `delete_from_cart()` metadata replacement.
- [ ] Transaction tests cover: no discount, percentage discount,
      shipping, payments, last garment, rollback failure, already-
      overpaid job.

Verification

- [ ] Mobile and desktop verification of all new/changed pages.
- [ ] `npm run build`, TypeScript check, `php -l`,
      `git diff --check`, API tests, and production
      rollback/deployment evidence recorded.

## Revision 2 changes

- Locked the route map; replaced `/jobs/:status` with explicit status
  redirects; defined all legacy redirects (§1).
- Defined `/jobs/:jobId/edit` fully — route, fields, save/cancel,
  states, duplicate-submit protection; status stays on the overview
  (§3).
- Replaced the naive "use `getJobItemById()`" plan with the scoped read
  + transactional totals contract (§6).
- Scoped authentication explicitly out to a separate security sprint;
  Sprint 5 no longer claims tenant enforcement (§7).
- Expanded acceptance criteria accordingly.

## Revision 3 changes

- Fixed the legacy-redirect contradiction: `/job/:id/:backTo` carries
  no garment ID, so it redirects to the overview; item routes are
  mapped individually (§1).
- Replaced the impossible "unknown slug falls back to `/jobs`" rule
  with a UUID `UrlMatcher` on `/jobs/:jobId` plus a `/jobs/**`
  fallback (§1).
- Locked the exact mutation response (`JobGarmentMutationResponse`),
  made removal a POST/DELETE with additive endpoints and legacy
  endpoints kept for rollback (§6).
- Locked the financial formula and the last-garment behaviour
  (explicitly not `delete_from_cart()`), with required transaction
  tests (§6).
- Clarified that the Garments section itself is unboxed, not just the
  rows (§4).
