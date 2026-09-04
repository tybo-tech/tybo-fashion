# Sprint 5 — Job Hierarchy: Verification Evidence

Sprint spec: `sprints/5-job-hierarchy-overview-plain-garment-list-garment-details.md`
(Revision 3 + approved construction order).

## Construction commits

| Step | Commit | Content |
| --- | --- | --- |
| 1 | `629cb94` | Transactional job-item endpoints + server-side totals + calculation tests |
| 2 | `2e0696b` | Scoped garment-detail read endpoint |
| 3 | `ec1607e` | Route map locked: UUID matcher, status redirects, legacy redirects |
| 4 | `418a673` | Dedicated job editor + read-first overview |
| 5 | `67b812e` | Plain garment list + garment details as only editing surface |
| 6 | this commit | Regression, verification evidence |

## What was built

### Backend (additive — legacy endpoints untouched)

- `api/job-item/add-job-item-transactional.php` — POST `{CompanyId, JobId, JobItem}`.
- `api/job-item/update-job-item-transactional.php` — POST `{CompanyId, JobId, JobItemId, JobItem}`.
- `api/job-item/delete-job-item-transactional.php` — POST/DELETE only (legacy GET removal untouched).
- `api/job-item/get-job-item-scoped.php` — GET `?CompanyId&JobId&JobItemId`, no parent-job embed.
- `models/JobTotals.php` — locked financial formula, pure/static, DB-free.
- `models/JobItemTransaction.php` — one transaction per mutation:
  lock job row → scope-check (`CompanyId`+`JobId`+`JobItemId` against stored
  rows) → item mutation with server-side `SubTotal` → recalculate totals from
  persisted rows → persist `TotalCost` + `Metadata` → commit. Any Throwable
  rolls everything back and returns 500 with a generic message; 4xx for
  missing identifiers, cross-job/cross-company garment IDs (404), tampered
  body identifiers and wrong HTTP verbs (405).

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
  `/jobs/:jobId/garments/:garmentId`; known status slugs → `/jobs?status=…`
  via `JobsStatusRedirectComponent`; `/jobs/**` → `/jobs`; legacy
  `/job/:id`, `/job/:id/:backTo`, `/job/:jobId/items/new`,
  `/job/:jobId/items/:jobItemId/edit` all redirect.
- Overview read-first: customer/due date are summaries; special instructions
  read-only; **Edit job** action; status remains the only quick action;
  load-time auto-saves removed (metadata POST + `check_total` chaining).
- Garments: unboxed plain list (no section shadow, no row cards, no steppers,
  no inline delete); whole row is one anchor (keyboard focusable, ≥44px);
  empty state + Add garment; canonical `/jobs/:jobId/garments/new`.
- Garment details: "Garment details" context label with the garment name as
  the final heading; scoped read (no full-job load); transactional
  add/update/remove; loading/404/error+Retry states; duplicate submit/remove
  protection; **Remove from job** as quiet bottom danger action with a
  confirmation naming the garment and explaining totals recalculation.
- UI copy uses **Garment**; `JobItem` API/model names unchanged.

## Verification results (2026-09-04, local + podman `tybo_fashion_main` MySQL)

| Check | Result |
| --- | --- |
| `php -l` on all new/changed PHP files (9 files) | PASS — no syntax errors |
| `php tests/JobTotalsTest.php` (formula: no discount, percentage discount, shipping, payments, last garment, overpaid, rounding, fixed-discount parity) | PASS — 38 checks, 0 failures |
| `php tests/JobTransactionIntegrationTest.php` (live DB: add/update/remove totals, scoped read, cross-job/cross-company 404, injected rollback failure leaves item + totals untouched, double-remove 404, last-garment metadata preservation) | PASS — 34 checks, 0 failures |
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
