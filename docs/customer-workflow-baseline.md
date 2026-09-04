# Customer workflow baseline

Baseline for the Tybo admin Customer area: the lean server-paginated list, the
analytics-rich detail dashboard, and the embedded New Job customer picker.

## List vs detail vs picker boundary

Three distinct surfaces share the `customer` table but must never be conflated:

| Surface | Route / trigger | Endpoint | Renders | Data weight |
|---|---|---|---|---|
| **Admin Customers list** | `/store/admin/customers` | `get-admin-customers.php` | name, phone, email, chevron | one page only (default 20) |
| **Customer detail dashboard** | `/store/admin/customer/:id` | `get.php` | full analytics, measurements, edit/save | one customer + job/payment history |
| **New Job embedded picker** | inside the Add Job modal | `list.php` (legacy) | full analytics card grid, add/select | full collection |

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

### Customer detail dashboard (unchanged)

- The detail route and its analytics queries are unchanged by the list work.
- `get.php` returns the full customer record plus job statistics, financial
  analytics, payment history, activity, service preferences, profile
  completeness, priority and formatted dates.
- Edit/save behaviour is unchanged.

### New Job embedded picker (unchanged this sprint)

- `CustomerListViewComponent` and the legacy `getCustomers()` service method
  remain available for the New Job flow to select or add a customer.
- The picker still calls `customer/list.php` and renders the full analytics
  card grid. Converting it to the lean endpoint is a separate, local-state
  enhancement after the list sprint is proven.

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
