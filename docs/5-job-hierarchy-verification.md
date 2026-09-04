# Sprint 5 — Job Hierarchy: Verification Evidence

Sprint spec: `sprints/5-job-hierarchy-overview-plain-garment-list-garment-details.md`
(Revision 3 + approved construction order).

> Revision 2 of this document: corrected the earlier claims after review
> found contract misses (boxed Garments section, autonomous customer form
> inside the editor, missing garment unsaved-change protection, lenient
> mutation-success validation). All four blockers plus the hardening items
> are fixed and re-verified below.
>
> Revision 3: closes the final three frontend edge cases — single discard
> confirmation (guards own it), New Customer exits hidden in the embedded
> customer picker (`allowAdd`), and one shared complete-response validator
> enforcing every totals field plus operation-specific invariants.

## Construction commits

| Step | Commit | Content |
| --- | --- | --- |
| 1 | `629cb94` | Transactional job-item endpoints + server-side totals + calculation tests |
| 2 | `2e0696b` | Scoped garment-detail read endpoint |
| 3 | `ec1607e` | Route map locked: UUID matcher, status redirects, legacy redirects |
| 4 | `418a673` | Dedicated job editor + read-first overview |
| 5 | `67b812e` | Plain garment list + garment details as only editing surface |
| 6 | `65aa093` | First verification evidence (superseded by this revision) |
| 7 | this commit | Review fixes: unboxed section, controlled customer draft, garment unsaved guard, strict response validation, quantity ≥ 1, parent context, status-failure revert |

## What was built

### Backend (additive — legacy endpoints untouched)

- `api/job-item/add-job-item-transactional.php` — POST `{CompanyId, JobId, JobItem}`.
- `api/job-item/update-job-item-transactional.php` — POST `{CompanyId, JobId, JobItemId, JobItem}`.
- `api/job-item/delete-job-item-transactional.php` — POST/DELETE only (legacy GET removal untouched).
- `api/job-item/get-job-item-scoped.php` — GET `?CompanyId&JobId&JobItemId`;
  returns the garment plus MINIMAL parent context (`{JobId, JobNo}`) for the
  breadcrumb — never the full job, never a raw UUID as the job label.
- `models/JobTotals.php` — locked financial formula, pure/static, DB-free.
- `models/JobItemTransaction.php` — one transaction per mutation:
  lock job row → scope-check (`CompanyId`+`JobId`+`JobItemId` against stored
  rows) → item mutation with server-side `SubTotal` → recalculate totals from
  persisted rows → persist `TotalCost` + `Metadata` → **read the saved
  garment back before commit** (an add/update can never commit and then
  return `garment: null`) → commit. Any Throwable rolls everything back and
  returns 500 with a generic message; 4xx for missing identifiers,
  cross-job/cross-company garment IDs (404), tampered body identifiers,
  wrong HTTP verbs (405), and invalid fields (`UnitPrice` ≥ 0; `Quantity`
  a whole number ≥ 1).
- Field validation: quantity `0`, fractional quantities and negative prices
  are rejected with 400 and change nothing.

### Formula (server-side source of truth)

- `item.SubTotal = UnitPrice × Quantity` (rounded per item, then summed).
- Percentage discount applies to garments only (`amountOffOrder` +
  `Percentage` only — client parity; Fixed/others ignored).
- Shipping added after the garment discount.
- `paidAmount = Σ Metadata.payments[].Amount`.
- `dueAmount = TotalCost − paidAmount` (negative when overpaid — no clamp).
- Last-garment removal: metadata preserved (invoice, payments, proof,
  unrelated fields), garment-discount fields reset, total = remaining
  shipping. The `delete_from_cart()` metadata wipe is NOT reproduced.

### Frontend

- Routes: `/jobs`, `/jobs/:jobId` (UUID `UrlMatcher`), `/jobs/:jobId/edit`
  (dedicated editor + unsaved-changes guard), `/jobs/:jobId/garments/new`,
  `/jobs/:jobId/garments/:garmentId` (both with a garment unsaved-changes
  guard); known status slugs → `/jobs?status=…` via
  `JobsStatusRedirectComponent`; `/jobs/**` → `/jobs`; legacy `/job/:id`,
  `/job/:id/:backTo`, `/job/:jobId/items/new`,
  `/job/:jobId/items/:jobItemId/edit` all redirect.
- Overview read-first: customer/due date are summaries; special instructions
  read-only; **Edit job** action; status remains the only quick action and
  reverts to the last confirmed status when its update fails (loading state
  always released); load-time auto-saves removed (metadata POST +
  `check_total` chaining).
- **Garments section unboxed**: no card, no border, no shadow around the
  section; the list carries an explicit top separator and each row a bottom
  border (between-row + bottom separators). Whole row is one anchor
  (keyboard focusable, ≥44px); empty state + Add garment; canonical
  `/jobs/:jobId/garments/new`.
- Garment details: "Garment details" context label with the garment name as
  the final heading; scoped read (no full-job load); transactional
  add/update/remove; loading/404/error+Retry states; duplicate submit/remove
  protection; **Remove from job** as quiet bottom danger action with a
  confirmation naming the garment and explaining totals recalculation.
- **Mutation-success validation is strict and shared**:
  `isValidGarmentMutationResponse()` (in `job.service.ts`) requires EVERY
  totals field (`itemsSubtotal`, `discountAmount`, `amountBeforeDiscount`,
  `amountAfterDiscount`, `hasDiscount`, `shippingPrice`, `totalCost`,
  `paidAmount`, `dueAmount`) present and correctly typed (finite numbers /
  boolean), plus the operation-specific invariants: add — garment non-null
  with a `JobItemId`, `removedJobItemId` null; edit — additionally matching
  `JobItemId`; remove — garment null, `removedJobItemId` equal to the
  requested garment, complete totals. Anything else is a failure state.
- **Single discard confirmation**: `cancel()` in both editors navigates
  directly; the `canDeactivate` route guards own the one and only
  confirmation prompt.
- **No New Customer exit from the job editor's picker**:
  `CustomerListViewComponent` takes `[allowAdd]="false"` and hides its New
  Customer header button and empty-state action when embedded in the editor,
  preventing the `?return=picker` wizard from landing on the Add Job dialog.
- **Unsaved-change protection on garment routes**: snapshot/dirty tracking,
  `canDeactivate` guard on both `/garments/new` and `/garments/:garmentId`,
  and a `beforeunload` handler. Successful save/remove aligns the snapshot
  so navigation is not blocked.
- **Job editor owns the customer association as a controlled draft**: a
  customer picker updates `CustomerId`/`CustomerName` locally and persists
  only through the editor's single Save (included in the dirty snapshot).
  The customer entity is edited on the customer detail page (linked), not
  here — no autonomous customer form, no side-API writes. Save failures show
  an inline error with Retry (nothing persisted, dirty state kept).
- UI copy uses **Garment**; `JobItem` API/model names unchanged.

## Verification results (2026-09-04, local + podman `tybo_fashion_main` MySQL)

| Check | Result |
| --- | --- |
| `php -l` on all new/changed PHP files | PASS — no syntax errors |
| `php tests/JobTotalsTest.php` (formula: no discount, percentage discount, shipping, payments, last garment, overpaid, rounding, fixed-discount parity) | PASS — 38 checks, 0 failures |
| `php tests/JobTransactionIntegrationTest.php` (live DB: add/update/remove totals, scoped read + minimal parent context, cross-job/cross-company 404, quantity 0 / fractional / negative price → 400 with no changes, injected rollback failure leaves item + totals untouched, double-remove 404, last-garment metadata preservation) | PASS — 40 checks, 0 failures |
| `npm run build` (includes TypeScript compilation) | PASS — pre-existing style-budget warnings only |
| `git diff --check` | PASS — no whitespace errors |
| `ng test` (Karma) | NOT RUN — headless Chrome unavailable in the dev environment; existing specs are CLI scaffolds ("should create") with no behavioural assertions. To be run in CI. |

## Known limits (honest scope, per Sprint 5 §7)

- All scoping is identifier-based (`CompanyId`/`JobId`/`JobItemId` validated
  against stored rows). There is still **no server-verified authentication**
  on the PHP endpoints — tenant enforcement is explicitly deferred to the
  separate security sprint, which must cover `get-job.php`,
  `update-job.php` and the item endpoints together.
- Legacy endpoints (`add-job-item.php`, `update-job-item.php`,
  `delete-job-item.php`, `get-job-item.php`) remain active for rollback.

## Deployment

Deployment to production was NOT performed from this session. Production
rollout + rollback evidence to be recorded by the deployer per the repo's
deployment-doc convention (see `docs/3-customer-detail-and-lean-job-picker-deployment.md`
as the format example). Rollback is safe: all backend changes are additive
and all legacy endpoints/behaviours remain intact.
