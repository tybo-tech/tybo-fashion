# Sprint 2 — Customer Query Optimization and Lean Admin List

**Repository:** [`tybo-tech/tybo-fashion`](https://github.com/tybo-tech/tybo-fashion)  
**Reviewed baseline:** `main` at [`e26f107`](https://github.com/tybo-tech/tybo-fashion/commit/e26f10785e30bb0a3136c937d33e82540b320ab0)  
**Precedent:** Jobs query/index work at [`9237404`](https://github.com/tybo-tech/tybo-fashion/commit/9237404fca096d745ab2bbe34a7b5802ce3bf395)  
**Sprint type:** Additive, low-risk list-path optimization  
**Primary route:** `/store/admin/customers`

## Outcome

Replace the current all-at-once, analytics-heavy Customer list with a lean,
server-paginated list that displays exactly:

1. Customer name
2. Phone number
3. Email address
4. Navigation chevron (visual affordance only)

Everything else—job totals, value, outstanding balance, priority, activity,
profile completeness, address, measurements and customer insights—belongs on
`/store/admin/customer/:id` and must not be calculated or downloaded for the
list page.

The visual result must follow the established Jobs/admin pattern: neutral
surface, yellow reserved for primary actions/focus, no decorative gradients,
no analytics strip, no card grid, no avatars, no badges and no nested row
actions.

## Current-State Findings

### Frontend

The current Customer page is a thin wrapper around
[`CustomerListViewComponent`](https://github.com/tybo-tech/tybo-fashion/blob/e26f10785e30bb0a3136c937d33e82540b320ab0/src/app/admin/customer-list-view/customer-list-view.component.ts):

- It downloads the full customer collection with `getCustomers(CompanyId)`.
- It stores the same full collection twice as `all_customers` and `customers`.
- Search scans the complete array in the browser on every input event.
- There is no pagination, loading/error separation, request cancellation or
  URL-restorable list state.
- The template renders a dense card grid with statistics, status/priority,
  financial metrics, job indicators, activity, address flags, profile
  completeness, avatars and badges.
- The SCSS still contains the retired purple gradient (`#667eea` → `#764ba2`),
  directly conflicting with the documented neutral/yellow admin system.

### Shared-component boundary

`CustomerListViewComponent` is also used inside the New Job flow to select or
add a customer. This is an important regression boundary.

**Locked decision:** implement the optimized, URL-driven list directly in
`CustomersComponent`. Keep `CustomerListViewComponent` and the legacy
`getCustomers()` service method available for the embedded New Job picker in
this sprint. Do not let `/store/admin/customers?page=&q=` query parameters leak
into the New Job modal.

This gives the high-traffic Customers page the complete optimization while
leaving job creation behaviour intact. Converting the embedded picker to the
lean endpoint can follow as a separate, local-state enhancement after this
sprint is proven.

### Backend

The existing [`customer/list.php`](https://github.com/tybo-tech/tybo-fashion/blob/e26f10785e30bb0a3136c937d33e82540b320ab0/api.tybo.fashion.main/api/customer/list.php)
calls `Customer::getCustomers()`, which currently:

- selects a wide customer record including addresses, image, measurements and
  metadata;
- joins every active job for every customer;
- calculates job counts and sums;
- repeatedly casts financial values;
- extracts payment values from job JSON;
- groups by a long customer column list;
- fetches the entire result with no `LIMIT`;
- loops through all rows in PHP to decode JSON and calculate status, priority,
  profile completeness, averages and formatted dates.

The endpoint then logs the complete result payload. That can place customer
names, phone numbers, emails, addresses and other personal data in server logs.
This log must be removed; it is neither required for the new list nor an
acceptable diagnostic pattern.

### Database evidence already known

The Jobs production check recorded:

- `customer`: `PRIMARY(CustomerId)` only; approximately 426 rows at that
  checkpoint.
- The attempted customer join index `(CompanyId, CustomerId)` was redundant
  for the Jobs join because `CustomerId` is already the primary key.

That conclusion applies only to the Jobs join. It does **not** prove whether a
Customer-list index is useful. The Customer list filters and sorts on different
columns, so its own `EXPLAIN` evidence is required.

## Locked Scope and Invariants

1. Add a new endpoint; do not replace or change the response contract of
   `customer/list.php`.
2. Keep `CustomerService.getCustomers()` for the New Job customer picker and
   rollback.
3. The new list endpoint returns four fields only:
   `CustomerId`, `CustomerName`, `PhoneNumber`, `Email`.
4. No `job` join, financial calculation, JSON extraction, JSON decoding,
   address, measurements, avatar or analytics on the new list path.
5. Only active customers of type `Customer` are included:
   `CompanyId = ?`, `CustomerType = 'Customer'`, `StatusId = 1`.
6. Search is server-side and case-insensitive under the database collation,
   covering name, surname, combined full name, phone and email.
7. Pagination is deterministic:
   `ModifyDate DESC, CreateDate DESC, CustomerId DESC`.
8. Search uses parameterized `LIKE '%term%'`; no user input is interpolated
   into SQL.
9. Missing values render as an em dash. The API may normalize empty values and
   legacy email value `Na` to `—` so the lean UI has a stable string contract.
10. URL query state applies only to `/store/admin/customers`; the New Job
    embedded picker remains local and unchanged.
11. The whole Customer row is one semantic Angular `routerLink` to
    `/store/admin/customer/:CustomerId`. No call/email buttons are nested in
    the link.
12. Add no index until current production `SHOW INDEX` and `EXPLAIN` prove it.
13. The customer detail route and its analytics remain unchanged.
14. Tenant authorization remains a separate security-hardening sprint; this
    sprint records the existing client-supplied `CompanyId` boundary without
    pretending to solve it.

## New Backend Contract

```text
GET /customer/get-admin-customers.php
    ?CompanyId={companyId}
    &page={n}            # default 1; values below 1 clamp to 1
    &pageSize={n}        # default 20; valid range 1..100
    &q={search text}     # optional; trimmed and capped at 100 characters
```

`CustomerType` is intentionally not accepted from the client. This endpoint is
for the admin Customer list and always uses `CustomerType = 'Customer'`.

### Success response

```json
{
  "items": [
    {
      "CustomerId": "uuid",
      "CustomerName": "Jane Doe",
      "PhoneNumber": "0712345678",
      "Email": "jane@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 426,
    "totalPages": 22,
    "hasPrevious": false,
    "hasNext": true
  }
}
```

The example total is illustrative. Every implementation/deployment note must
quote the current verified total, never assume that 426 is still current.

### Error response

| Condition | Response |
| --- | --- |
| Missing `CompanyId` | HTTP 400 `{"error":"CompanyId is required."}` |
| Invalid `page`/`pageSize` | Clamp to valid values |
| Database/connection/query failure | HTTP 500 `{"error":"Unable to load customers."}` |
| SQL, driver or exception details | Never returned to the client |

The endpoint must guard `Database::connect()` the same way as the proven Jobs
endpoint: capture accidental connection output, require a real `PDO` instance,
log only a generic server-side failure marker and return a generic 500.

## Query Shape

```sql
SELECT
    c.CustomerId,
    COALESCE(
        NULLIF(TRIM(CONCAT_WS(' ', c.Name, c.Surname)), ''),
        '—'
    ) AS CustomerName,
    COALESCE(NULLIF(TRIM(c.PhoneNumber), ''), '—') AS PhoneNumber,
    COALESCE(
        NULLIF(NULLIF(TRIM(c.Email), ''), 'Na'),
        '—'
    ) AS Email
FROM customer c
WHERE c.CompanyId = :CompanyId
  AND c.CustomerType = 'Customer'
  AND c.StatusId = 1
  /* optional parameterized name/phone/email search */
ORDER BY c.ModifyDate DESC, c.CreateDate DESC, c.CustomerId DESC
LIMIT :limit OFFSET :offset;
```

The count query must use the identical `WHERE` conditions and no join.
`LIMIT`/`OFFSET` must be bound as `PDO::PARAM_INT`.

## Index Decision Gate

Run these against the current production schema before creating a migration:

```sql
SHOW INDEX FROM customer;
```

Run `EXPLAIN` for at least these list shapes:

1. Default page: company + type + active status + deterministic sort.
2. Name/full-name search.
3. Phone search.
4. Email search.

Candidate to test—not pre-approve:

```sql
CREATE INDEX idx_customer_company_type_status_modified
    ON customer (
        CompanyId,
        CustomerType,
        StatusId,
        ModifyDate,
        CreateDate,
        CustomerId
    );
```

The equality prefix can serve tenant/type/active filtering and may allow the
default list to walk the ordering backwards. The leading-wildcard search
predicates will not become direct B-tree lookups, so separate indexes on
`Name`, `Surname`, `PhoneNumber` or `Email` must not be added merely because
those columns are searched.

If MySQL continues to prefer the table scan at the current data size, record
that result and add no index. The largest improvement in this sprint still
comes from eliminating the job aggregation, JSON work, full-collection fetch
and oversized response.

If the candidate is proven, commit a dated migration with a named rollback
statement before applying it to production, then repeat all `EXPLAIN` checks.

## Frontend Result

### Canonical URL

```text
/store/admin/customers
/store/admin/customers?page=2
/store/admin/customers?q=ndumiso
/store/admin/customers?page=2&q=071
```

Defaults should be omitted from the canonical URL where practical. Search
changes remove `page`, returning the user to page 1. Refresh and Back/Forward
restore the exact URL state without a full page reload.

### Row content

- Strong primary line: customer full name.
- Muted secondary line: phone number and email, each safely truncated.
- Chevron at the right.
- Whole row opens the existing customer dashboard.
- Approximately 56–72px high with a minimum 44px touch target.
- Horizontal separators only; no outer card, side borders, row rounding,
  avatar, status, value, totals or badges.
- On narrow screens, contact values may wrap/stack without horizontal scroll.
- Visible focus outline using `--admin-accent`.

### Page controls and states

- Header: `Customers` + yellow `New Customer` primary action.
- One compact search box: `Search name, phone or email…`.
- No status/priority/financial filter in this sprint.
- About 300ms search debounce.
- One `switchMap` request pipeline cancels obsolete requests.
- Errors are caught inside `switchMap` so Retry remains functional.
- Pagination is driven entirely by API metadata.
- Distinct states:
  - initial/loading-on-change;
  - no customers at all → add first customer;
  - no search results → clear search;
  - page beyond last result → go to page 1/previous;
  - HTTP failure → error with Retry, never an empty-state message.
- New Customer keeps the existing customer form behaviour. After a successful
  save, close the form and refresh the active query/page safely.

## Delivery Phases

### Phase 0 — Baseline and contract lock

- [x] Record current `main` SHA and ensure the work starts from it.
- [x] Capture the live `customer/list.php` response row count, response bytes
      and request duration for the target company without placing response
      bodies in logs or sprint notes.
- [x] Confirm current production Customer indexes and table cardinality.
- [x] Confirm the Customer page, Customer detail and New Job customer picker
      behaviour before changes.
- [x] Lock the four-field item contract and `/customers?page=&q=` URL contract.

**Exit:** baseline evidence exists and no schema/API assumption is unverified.

### Phase 1 — Add the lean backend query

- [x] Add `Customer::GetAdminCustomersPage($CompanyId, $search, $limit,
      $offset)` returning `items` and `total`.
- [x] Use the exact lean query/count shape above; no job join or analytics.
- [x] Add `api/customer/get-admin-customers.php` with parameter validation,
      pagination metadata, generic errors and guarded DB connection.
- [x] Remove complete result-payload logging from legacy `customer/list.php`.
      Preserve its HTTP response contract for the embedded picker.
- [x] Keep the existing `getCustomers()` method intact apart from any
      separately reviewed non-contract logging cleanup.
- [x] Run `php -l` on every changed PHP file.

**Exit:** local/direct endpoint tests prove four fields only, correct search,
pagination/count agreement, deterministic ordering and generic failures.

### Phase 2 — Deploy backend and decide the index from evidence

- [x] Upload only the new endpoint, required `Customer.php` change and the
      surgical legacy logging cleanup. Never upload `Database.php` or secrets.
- [x] Verify live default page, page 2, beyond-last page, name, full-name,
      phone and email searches, missing `CompanyId`, clamped pagination and an
      empty result.
- [x] Compare old vs new response bytes and duration using current production
      totals; do not log customer response bodies.
- [x] Run and record `SHOW INDEX` plus the four `EXPLAIN` shapes.
- [x] Test the candidate composite index only if justified. Keep it only when
      the plan improves materially; otherwise remove/test rollback and record
      “no index added”.
- [x] If retained, commit and apply a dated migration with rollback, then
      repeat `SHOW INDEX` and all `EXPLAIN` checks.
- [x] Regression-test the legacy New Job customer picker after backend upload.

**Exit:** live endpoint is stable; index decision is evidence-based; no
frontend integration begins until the backend contract is proven.

> **Production evidence (2026-09-04):** the endpoint was uploaded and
> verified live — default page returned `totalItems=423`, `totalPages=22`,
> four-field-only items; name/full-name/phone/email searches, pagination
> clamps and the missing-`CompanyId` 400 all passed. `SHOW INDEX` showed
> PRIMARY only (cardinality 426); all four `EXPLAIN` shapes were
> `ALL`+filesort. After applying the migration, all four returned
> `type=range, key=idx_customer_company_type_status_modified, key_len=264,
> rows=416, Extra="Using where"` (no filesort). The legacy New Job picker
> regression passed (still calls `list.php`, unchanged).

### Phase 3 — Add typed Angular client support

- [x] Add `CustomerListItem`, `CustomersPagination` and
      `CustomersPageResponse` interfaces without bloating the full `Customer`
      model.
- [x] Add `CustomerService.getAdminCustomersPage()` using `HttpParams` for
      `CompanyId`, `page`, `pageSize` and optional trimmed `q`.
- [x] Keep `CustomerService.getCustomers()` unchanged for the New Job picker
      and rollback.
- [x] Verify the typed service against the live endpoint before changing the
      Customer page.

**Exit:** build passes and the existing UI behaviour is still unchanged.

### Phase 4 — Rewrite the standalone Customers page

- [x] Move list orchestration into `CustomersComponent` and stop using
      `CustomerListViewComponent` on `/store/admin/customers`.
- [x] Implement URL-owned `page`/`q` state with Router navigation only.
- [x] Add debounced search, pending-debounce cancellation on Reset and URL
      changes, switchMap request cancellation and identical-parameter Retry.
- [x] Render the compact unboxed four-field rows and whole-row router links.
- [x] Add API-metadata pagination and the full loading/error/empty matrix.
- [x] Preserve New Customer creation with duplicate-submit prevention and a
      safe list refresh after success.
- [x] Remove the obsolete Customer-page breadcrumb if needed to match the Jobs
      header pattern; do not change the detail-page breadcrumb.

**Exit:** `/store/admin/customers` downloads one page only, the URL restores
state and no legacy analytics/card content is rendered or requested.

### Phase 5 — Regression, performance proof and documentation

- [x] Playwright: default page, search by every supported field, rapid typing,
      cancellation, pagination boundaries, refresh, Back/Forward, reset,
      empty states, beyond-last page, simulated 400/500 and Retry.
- [x] Playwright: open a row and verify the correct Customer dashboard loads.
- [ ] Playwright: add a customer, return/refresh correctly and open it.
- [x] Regression: New Job picker still lists, adds and selects a customer and
      creates a job with the selected `CustomerId`.
- [x] Regression: customer detail analytics, measurements and edit/save remain
      available and unchanged.
- [x] Confirm Network shows no Customer list request to legacy `list.php` on
      the standalone page and no full-collection scan in browser code.
- [x] Confirm server/application logs contain no complete customer payloads.
- [x] Run `npm run build`, the project’s spec TypeScript check, `php -l` and
      `git diff --check`; document only pre-existing baseline failures.
- [x] Update `docs/admin-ui-patterns.md` with the Customer list pattern and
      `docs/customer-workflow-baseline.md` with the list/detail/picker boundary.

**Exit:** functional matrix passes with zero console errors and measured
payload/query evidence is recorded.

## Target Files

```text
api.tybo.fashion.main/
├── api/customer/
│   ├── get-admin-customers.php        # new lean endpoint
│   └── list.php                       # response unchanged; remove PII log
├── database/migrations/
│   └── 202609xx_admin_customers_query_index.sql  # only if EXPLAIN proves it
└── models/Customer.php                # additive lean page/count method

src/
├── app/admin/customers/
│   ├── customers.component.ts         # URL/query/page/state controller
│   ├── customers.component.html       # compact list + new-customer form
│   └── customers.component.scss       # Jobs-aligned unboxed rows
├── app/admin/customer-list-view/      # unchanged New Job picker this sprint
├── models/Customer.ts                 # lean interfaces added
└── services/customer.service.ts       # additive paginated method

docs/
├── admin-ui-patterns.md
└── customer-workflow-baseline.md
```

## Explicitly Out of Scope

- Reworking the Customer detail dashboard or its analytics queries.
- Changing customer save/update payloads or password behaviour.
- Converting the New Job embedded picker to URL-driven state.
- Tenant/session authorization remediation.
- Full-text search or a search service at the current data size.
- Customer/user identity deduplication.
- Angular/framework upgrades or a new UI library.
- Status, priority, financial or analytics filters on the Customer list.

## Risks and Controls

| Risk | Control |
| --- | --- |
| Shared list component breaks New Job | Standalone page stops using it; picker and `getCustomers()` remain intact |
| Stale response overwrites newer search | One `switchMap` request pipeline |
| Pending debounce overwrites Back/Reset URL | Explicit cancellation on URL changes and Reset |
| Error appears as “no customers” | Separate HTTP failure state; catch inside `switchMap` |
| Newly added customer is hidden by current search/page | Refresh current query, then provide a predictable reset/open path |
| Index adds write cost without benefit | `SHOW INDEX` + `EXPLAIN` gate; no forced index |
| Search indexes do not serve `%term%` | Do not add standalone B-tree search-column indexes |
| Personal data enters logs | Remove full-result logging; record counts/timings only |
| Detail analytics accidentally disappear | Detail endpoint/route unchanged and covered by regression tests |

## Definition of Done

- [x] New live endpoint returns only `CustomerId`, `CustomerName`,
      `PhoneNumber`, `Email` plus pagination metadata.
- [x] No job aggregation, payment JSON, measurements, address, avatar or
      analytics work occurs on the new list path.
- [x] `/store/admin/customers` uses server pagination/search and never
      downloads the full customer collection.
- [x] Rows display exactly name, phone and email, in the Jobs-aligned unboxed
      design, and open the existing customer dashboard.
- [x] URL, refresh, Back/Forward, debounce/cancel, page boundaries, loading,
      empty, error and Retry behaviour all pass.
- [ ] New Customer and New Job customer selection both pass regression tests.
- [x] Full customer result logging is removed.
- [x] Any retained database index is backed by before/after production
      `EXPLAIN` evidence and a committed rollback-capable migration; otherwise
      the sprint explicitly records that no index was added.
- [x] Build/lint/diff checks pass apart from documented pre-existing failures.
- [x] Documentation is current and no credentials or customer payloads appear
      in commits, upload manifests, test artifacts or logs.

