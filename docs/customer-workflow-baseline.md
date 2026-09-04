# Customer workflow baseline

Baseline for the Tybo admin Customer area: the lean server-paginated list, the
analytics-rich detail dashboard, and the embedded New Job customer picker.

## List vs detail vs picker boundary

Three distinct surfaces share the `customer` table but must never be conflated:

| Surface | Route / trigger | Endpoint | Renders | Data weight |
|---|---|---|---|---|
| **Admin Customers list** | `/store/admin/customers` | `get-admin-customers.php` | name, phone, email, chevron | one page only (default 20) |
| **Customer detail dashboard** | `/store/admin/customer/:id` | `get-admin-customer-detail.php` | editable fields + rendered analytics, measurements, edit/save | one customer, no job/payment history |
| **New Job embedded picker** | inside the Add Job modal | `get-admin-customers.php` (lean, paginated) | name, phone, email, add/select | one page only (default 20) |

### Admin Customers list (Sprint 2)

- Server-paginated and searched; the browser never downloads or scans the full
  collection. Search is server-side and case-insensitive under the DB
  collation, covering name, surname, combined full name, phone and email, via
  parameterized `LIKE '%term%'`.
- Returns exactly four fields per row: `CustomerId`, `CustomerName`,
  `PhoneNumber`, `Email`. No job join, financial calculation, JSON
  extraction/decoding, address, measurements, avatar or analytics on this
  path.
- Only active customers of type `Customer` are included:
  `CompanyId = ?`, `CustomerType = 'Customer'`, `StatusId = 1`.
- Pagination is deterministic: `ModifyDate DESC, CreateDate DESC,
  CustomerId DESC`.
- Missing values render as an em dash (`—`); the API normalizes empty values
  and the legacy email value `Na` to `—` so the UI has a stable string
  contract.
- URL query state (`?page=&q=`) applies only to `/store/admin/customers`; the
  New Job embedded picker remains local and unchanged.
- The whole row is one semantic `routerLink` to
  `/store/admin/customer/:CustomerId`. No call/email buttons are nested in the
  link.

### Customer detail dashboard (Sprint 3)

- The detail route now uses the focused additive endpoint
  `get-admin-customer-detail.php`, scoped by both `CompanyId` and
  `CustomerId`. The legacy `get.php` remains untouched for rollback.
- Returns the editable customer fields the form round-trips (full row +
  decoded `Measurements`/`Metadata` + `FullName`) plus only the analytics the
  page renders. It does **not** return job/payment history arrays,
  contact/address/activity/service-preference analysis, or any field the page
  does not consume.
- Analytics distinguish `null`/missing from legitimate numeric zero:
  `PaymentCompletionRate` and `ProfileCompleteness` are `null` when
  unavailable (never a fabricated `0`); job counts and balances are `0`/`0.0`
  when genuinely zero.
- The page renders loading, HTTP-error-with-Retry, and not-found states; a
  compact neutral header; a quieter metrics section; Personal Information,
  Address (only when a meaningful value exists) and Measurements (only real
  recorded values) sections. The Contact Verification card and the Jobs /
  Activity placeholder tabs are removed.
- Edit/save behaviour is unchanged; the detail read model refreshes after a
  successful update.

### New Job embedded picker (Sprint 3)

- `CustomerListViewComponent` now uses the lean `getAdminCustomersPage()`
  endpoint (20 per page) with local search/page state inside the modal — no
  `/customers?page=&q=` URL change. It renders name, phone and email only.
- The legacy `getCustomers()`/`list.php` remain available for rollback.
- Job creation is protected: a `creatingJob` state disables all rows after
  the first selection, shows a spinner + "Creating job…", guarantees one job
  request per selection via `finalize()`, and shows an error toast on failure.

## Index evidence

The Jobs production check recorded `customer: PRIMARY(CustomerId)` only. That
conclusion applied only to the Jobs join. The Customer list filters and sorts
on different columns, so its own `EXPLAIN` evidence was required.

Sprint 2 evidence (recorded against the production-shaped local snapshot,
428 customer rows; main company 423 active):

- `SHOW INDEX FROM customer;` → PRIMARY only.
- `EXPLAIN` (default page, name/full-name search, phone search, email search)
  BEFORE index → `type=ALL, rows=428, Extra="Using where; Using filesort"`.
- `EXPLAIN` AFTER adding `idx_customer_company_type_status_modified` →
  `type=range, key=idx_customer_company_type_status_modified, key_len=264,
  rows=423, Extra="Using index condition; Backward index scan"` — full scan +
  filesort eliminated on all four shapes.
- The equality prefix `(CompanyId, CustomerType, StatusId)` serves the
  tenant/type/active filter; the trailing columns allow the default list to
  walk the ordering backwards. The leading-wildcard search predicates do not
  become direct B-tree lookups, so no separate indexes on `Name`, `Surname`,
  `PhoneNumber` or `Email` are added.

Migration: `api.tybo.fashion.main/database/migrations/20260904_admin_customers_query_index.sql`
(with rollback).

## Logging

The legacy `customer/list.php` previously logged the complete result payload
(including customer names, phone numbers, emails, addresses and other personal
data) to the server log. That full-result logging is removed; the endpoint
preserves its HTTP response contract for the embedded picker. No complete
customer payloads are written to logs on the list path.
