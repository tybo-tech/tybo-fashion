# Sprint 3 — Customer Detail and Lean Job Picker

Focused cleanup of two surfaces: **Customer Detail** and the **New Job
Customer Picker**. No write-contract changes and no speculative UI.

## Outcome

- Customer Detail follows the established neutral/yellow admin system.
- Purple gradients and decorative legacy styling are completely removed.
- Only sections backed by real data are displayed.
- New Job picker becomes a lean, paginated selection list instead of
  downloading and rendering 423 analytics-heavy cards.
- Customer creation, editing, measurements, and job creation remain
  compatible with existing PHP write contracts.

## Baseline

- Starting `main` SHA: `8f93b33bd87d5ecfb464a26f5d9204d0eb190d7c`.

### Contracts locked (Phase 0)

- **Customer save contract** — `POST /customer/save.php` decides update vs add
  by the presence of `CreateDate`; `Customer::update()` writes the full
  editable record (CompanyId, CustomerType, Name, Surname, Email, PhoneNumber,
  Password, Dp, AddressLineHome, Measurements, Metadata, AddressUrlHome,
  AddressLineWork, AddressUrlWork, BuildingType, AddressLine2, Suburb, City,
  PostalCode, CompanyName, UserId, CreateUserId, ModifyUserId, StatusId,
  UserToken) keyed by `CustomerId`. The detail read must return every field
  the form round-trips so a save never corrupts data.
- **Job creation contract** — `AddJobComponent.selected()` sets
  `job.CustomerId` then calls `jobService.add()` →
  `POST /job/add-job.php`; on success it navigates to
  `/store/admin/job/:JobId`. This is the write path the picker must protect
  (one request per selection, visible busy state).
- **Legacy endpoints untouched** — `customer/get.php`, `customer/list.php`,
  `customer/save.php` and their response contracts are unchanged. The new
  detail endpoint is additive; the picker keeps `getCustomers()`/`list.php`
  available for rollback.

## Phase 1 — Add a focused detail read endpoint

`GET /customer/get-admin-customer-detail.php?CompanyId={companyId}&CustomerId={customerId}`

- Additive endpoint; legacy `customer/get.php` untouched.
- Lookup scoped by both `CompanyId` and `CustomerId`.
- Returns the editable customer fields the existing form needs (full row +
  decoded `Measurements`/`Metadata` + `FullName`).
- **Password and `UserToken` are never returned by the focused endpoint** —
  they are stripped from the response before it reaches the browser.
- Returns only analytics the new detail page renders.
- Does not return unused job/payment history arrays.
- Does not generate unused contact/address/activity/service-preference analysis.
- Distinguishes `null`/missing analytics from legitimate numeric zero
  (e.g. `PaymentCompletionRate` is `null` when there is no job value, not `0`).
- Generic 400, 404, 500 responses; guarded DB connection; parameterized queries.
- `SHOW INDEX` + `EXPLAIN`; no index without production evidence.
- `php -l` on changed PHP files.

**Edit/save preservation (write contract unchanged):**

- Missing password/token/audit fields are preserved server-side. `update()`
  reads the current `Password`, `UserToken`, `CreateUserId` and `ModifyUserId`
  and reuses them when the incoming model omits them, so an edit/save from the
  detail flow never erases them.
- **Preservation failure aborts the update.** If the current protected fields
  cannot be read, `update()` returns an error and no SQL runs — "Could not
  preserve protected fields" means no update occurred.

Response groups:

- `customer`: identity, contact, address, dates, measurements, editable fields
- `analytics`: job counts, financial totals, payment rate, profile
  completeness, last activity

## Phase 2 — Rebuild Customer Detail UI

- Explicit loading state.
- HTTP error state with identical-request Retry.
- Customer-not-found state with a safe return to Customers.
- Compact neutral header (replaces oversized header card).
- Yellow accent only for the primary Create Job action; Edit Customer is a
  neutral secondary action.
- Call/Email only for valid values.
- Quieter metrics section (replaces four decorative analytics cards).
- Hide individual metrics when the value is unavailable; preserve legitimate
  zero counts and zero balances.
- Remove the Contact Verification card.
- Remove the Jobs and Activity placeholder tabs.
- Convert Overview and Measurements into clear page sections (or retain only
  those two tabs).
- Render Address only when at least one meaningful address value exists.
- Filter measurements whose name or value is empty.
- One useful measurement empty state with an Edit/Add action.
- Preserve Edit Customer and Edit Measurements behavior.
- Refresh the detail read model after a successful update.
- Mobile actions wrap without horizontal scrolling.
- Visible keyboard focus states and 44px minimum targets.

## Phase 3 — Rewrite the embedded Customer Picker

- Change the picker to `getAdminCustomersPage()`.
- Request 20 customers per page.
- Keep search/page state inside the modal (no `/customers?page=&q=` URL change).
- ~300ms search debounce.
- Cancel obsolete requests with `switchMap`.
- Cancel pending search when the picker closes or resets.
- Render name, phone, and email only.
- Hide missing phone/email values instead of legacy placeholders.
- Whole row is a semantic selection button.
- API-metadata pagination with accurate "Showing X–Y of Z".
- Loading, error, Retry, empty-search, empty-company, beyond-last-page states.
- Preserve Add Customer inside the picker.
- After adding a customer, continue directly into the existing job-creation
  behavior.
- Keep legacy `getCustomers()` and `list.php` available for rollback.
- Do not delete or change the legacy response contract.

## Phase 4 — Protect job creation

- `creatingJob` state on `AddJobComponent`.
- Disable all customer rows after the first selection.
- Spinner and "Creating job…" feedback.
- Guarantee one job request per selection.
- `finalize()` to release busy state on success or failure.
- Error toast if job creation fails.
- Retry through a fresh deliberate selection/click.
- Prevent closing (or explain closing behavior) while creation is in flight.
- Preserve navigation to the created job after success.

## Phase 5 — Styling cleanup

- Remove `#667eea`, `#764ba2`, and all related purple shadows.
- Remove decorative gradients from both components.
- Use the existing `--admin-*` tokens.
- Neutral surfaces, separators, restrained shadows.
- Semantic Bootstrap colours only for genuine status/warning/error meaning.
- Black/near-black text on yellow.
- Remove hover movement that causes cards or rows to jump.
- Picker works comfortably within the full-height modal.
- Validate desktop, tablet, narrow mobile, and safe-area layouts.

## Phase 6 — Validation

### Customer Detail

- Existing customer with complete data.
- Customer with missing phone/email/address.
- Customer with legitimate zero jobs/value.
- Customer with unavailable analytics.
- Customer with measurements.
- Customer with empty measurement entries.
- Customer without measurements.
- Direct URL refresh.
- Invalid customer ID.
- Backend 400/404/500 and Retry.
- Edit modal open/cancel.
- Failed update recovers.
- Successful update refreshes displayed data.
- Create Job action follows the correct workflow.

### Customer Picker

- First page contains no analytics/card content.
- Search by name, phone, and email.
- Rapid typing and stale-request cancellation.
- Reset pending search.
- Previous/Next boundaries.
- Beyond-last page.
- HTTP failure, Retry, and recovery.
- Selecting once creates exactly one job.
- Repeated clicking cannot create duplicate jobs.
- Failed job creation releases the picker.
- New Customer save creates exactly one customer and one intended job.
- Closing and reopening resets picker-local state.
- Standalone Customers URL remains untouched.

### Engineering checks

- `npm run build`
- Application TypeScript check
- `php -l`
- `git diff --check`
- Record only the known `AppComponent.title` baseline spec error
- Confirm no customer payloads or credentials enter logs/artifacts

## Phase 7 — Deployment

- Deploy the additive detail endpoint and required model changes first.
- Verify its production response contract and timings.
- Run production `EXPLAIN`.
- Apply no index unless the production plan proves it.
- Verify legacy detail and picker endpoints remain operational.
- Build Angular from the approved commit.
- Deploy the Angular bundle.
- Verify the deployed bundle hashes changed.
- Run Customer Detail and New Job picker smoke tests.
- Record production evidence and rollback files.

## Definition of Done

- No purple styling remains on Customer Detail or Customer Picker.
- No unsupported Jobs, Activity, or Contact Verification placeholders remain.
- Missing data is hidden or represented honestly—never fabricated as zero.
- Empty measurements are not rendered.
- Customer Detail requests only data the page or edit form consumes.
- Picker downloads one lean page rather than the full analytics collection.
- Picker search and pagination stay local to the modal.
- Selecting a customer produces at most one job request.
- Existing customer save and job save contracts remain unchanged.
- Loading, error, empty, not-found, busy, and Retry states pass.
- Mobile and desktop match the established Jobs/Customers admin UI.
- Production evidence and rollback instructions are documented.

## Local functional matrix (2026-09-04)

Run against the local podman stack (PHP :8080, MySQL :3306) with the dev
Angular server (:4200). All checks passed; no console errors and no PHP
warnings were emitted.

### Detail endpoint (HTTP)

- `GET get-admin-customer-detail.php?CompanyId&CustomerId` → 200, clean JSON.
- Missing `CompanyId` → 400 `{"error":"CompanyId is required."}`.
- Missing `CustomerId` → 400 `{"error":"CustomerId is required."}`.
- Unknown `CustomerId` → 404 `{"error":"Customer not found."}`.
- Response contains **neither** `Password` **nor** `UserToken`.
- No undefined-key warnings; analytics survive the response split.

### Analytics against a known customer (Fie-Fie, 32 jobs)

- `TotalJobs=32`, `ActiveJobs=0`, `CompletedJobs=22`,
  `CustomerLifetimeValue=82215`, `OutstandingBalance=77365`,
  `PaymentCompletionRate=5.9`, `ProfileCompleteness=67`,
  `LastActivityDate=2025-10-01 09:03:38`.
- `customer` group keys are exactly the editable fields + `FullName`; no
  computed columns leak into it.

### Edit/save preservation

- Created a disposable customer, snapshotted `Password`, `UserToken`,
  `CreateUserId`, `ModifyUserId`, then edit-saved omitting all four. All four
  were preserved byte-for-byte.
- UI edit-save (change name on Fie-Fie) preserved `Password=notset`,
  `UserToken`, `CreateUserId`, `ModifyUserId`; the detail read model refreshed
  to show the new name.
- **Fail-closed**: update on a nonexistent `CustomerId` returned
  `{"error":true,"message":"Could not preserve protected fields."}`; no
  customer row and no linked user row were created.

### Customer Detail UI

- Complete-data customer renders all metrics and sections.
- Missing phone/email/address customer hides Call/Email buttons and the Address
  section; metrics show real values.
- Measurements render only real recorded values; a customer with no
  measurements shows the "No measurements recorded" empty state with an
  Add Measurements action.
- Not-found state ("Customer not found" + Back to Customers) on an invalid ID.
- HTTP 500 → error + Retry; Retry recovers to the loaded customer.
- Create Job opens the Add Job modal with the customer preselected and an
  intentional confirmation ("Create a job for X?"); confirming sends exactly
  one `add-job.php` request and navigates to the created job.

### Customer Picker

- First page renders lean rows (name, phone, email only) — no analytics/card
  content; "Showing 1–20 of 423", Page 1 of 22.
- Persistent New Customer button beside search (reachable with 423 customers);
  opens the Add Customer modal.
- Search by name (Thabang) filters via `q=Thabang` on the lean endpoint.
- Pagination Next → Page 2 of 22; URL stays `/store/admin/jobs` (local state).
- Empty-search state ("No customers found" + Clear search).
- Beyond-last-page state ("No customers on this page" + Go to page 1).
- HTTP 500 → error + Retry; Retry recovers to "Showing 1–20 of 423".
- Selecting a customer sends exactly one `add-job.php` request.
- Fail-first: forced 500 keeps the picker open with rows re-enabled; a fresh
  selection succeeds and navigates to the new job.
- Close/reopen during creation: exactly one request even with a close attempt
  while in flight.
- Standalone `/store/admin/customers` URL is untouched.

### Engineering checks

- `npm run build` passes (only pre-existing budget warnings + the pre-existing
  "2 rules skipped" selector warning).
- `tsc --noEmit` shows only the known baseline `AppComponent.title` spec error.
- `php -l` clean on changed PHP files.
- `git diff --check` clean.
- No customer payloads or credentials entered logs/artifacts; all disposable
  test data was removed.

## Production deployment (2026-09-04) — verified

Full evidence trail: `docs/3-customer-detail-and-lean-job-picker-deployment.md`.

### Backend (uploaded and verified live)

- `get-admin-customer-detail.php` → 200 full contract; 400 (missing
  CompanyId / CustomerId, exact error bodies); 404 unknown customer.
- Response contains neither `Password` nor `UserToken`; no PHP warnings.
- Analytics verified live on Fie-Fie: 32/22 jobs, CLV 82215, Outstanding
  77365, PaymentRate 5.9, Profile 67, LastActivity 2025-10-01.
- Legacy `get.php` (200) and `list.php` (200) unchanged; New Job picker still
  served by `list.php`.
- `SHOW INDEX` recorded; **no index added** (customer resolved by
  `PRIMARY(CustomerId)`, single-customer job join bounded).

### Frontend (uploaded and verified live)

- Build from `7166c47` (Sprint 3 + Sprint 4), hash `04e1edb0f3bdd282`.
- Production `index.html` serves `main.e5c2f1ced014034c.js` /
  `styles.81cc6f1c82641653.css`; `ngsw.json` references the new bundles
  (single main hash, no stale references).
- Customer Detail page renders live (created smoke customer landed on it with
  analytics served by the new detail endpoint).
- Picker: lean rows, search + one-request job creation verified (exactly one
  `add-job.php` POST → 200, navigated to the created job).
- Browser console: zero errors across all smoke flows.

### Cleanup note

Two production smoke customers (`Prod Smoke Zinhle`
`b7dcdcab-a86f-11f1-81aa-ac1f6b7f619a`, `Prod Smoke Sipho`
`ed17584a-a86f-11f1-81aa-ac1f6b7f619a`) and the smoke job
(`11461818-a870-11f1-81aa-ac1f6b7f619a`) were created during verification.
The app has no delete endpoints; remove them in phpMyAdmin (SQL handed to
the owner).
