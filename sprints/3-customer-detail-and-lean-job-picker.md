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
- Returns only analytics the new detail page renders.
- Does not return unused job/payment history arrays.
- Does not generate unused contact/address/activity/service-preference analysis.
- Distinguishes `null`/missing analytics from legitimate numeric zero
  (e.g. `PaymentCompletionRate` is `null` when there is no job value, not `0`).
- Generic 400, 404, 500 responses; guarded DB connection; parameterized queries.
- `SHOW INDEX` + `EXPLAIN`; no index without production evidence.
- `php -l` on changed PHP files.

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
