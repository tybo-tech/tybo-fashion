# Sprint 3 — Backend-First Deployment Pack

Approved deployment baseline: **`92b04c646e3ff8e147217a0c369e1ad8b798a5c8`**
(remote `main`). This pack is **backend-first**: the new detail endpoint and
model change are uploaded and verified on production **before** any Angular
bundle is deployed. A hard gate blocks the frontend until the backend passes.

Production base URL: `https://tybofashion.co.za/api/api` (note the double
`/api/api/` path). Production `CompanyId`:
`80edddf9-6fc0-11eb-9698-12911df8ace9`.

---

## 1. FileZilla manifest (backend)

Upload exactly these two files, in this order. **Do not** upload
`Database.php`, `config/`, credentials, or any local artifact.

| Order | Local path (repo) | Remote path (production) |
|---|---|---|
| 1 | `api.tybo.fashion.main/models/Customer.php` | `/api/models/Customer.php` |
| 2 | `api.tybo.fashion.main/api/customer/get-admin-customer-detail.php` | `/api/api/customer/get-admin-customer-detail.php` |

> The remote `api/` tree mirrors the repo layout: `models/` sits one level
> above `api/customer/`. Confirm the exact remote root with the hosting panel
> before uploading; the endpoint's `include_once '../../config/Database.php'`
> and `'../../models/Customer.php'` resolve relative to
> `/api/api/customer/`, i.e. `/api/config/Database.php` and
> `/api/models/Customer.php`.

### Explicit prohibitions

- **Never** upload `api.tybo.fashion.main/config/Database.php` (hardcodes
  `mysql:host=mysql;dbname=docker` and echoes PDO errors on connect).
- **Never** upload `.env`, `*.local`, `*.log`, `*.sql`, `*.md`, or any file
  outside the two-file manifest.
- **Never** upload the Angular `dist/` bundle in this phase.

### Pre-upload backups

Before overwriting, download the current production copies to a local backup
folder (e.g. `C:\Users\User\AppData\Local\Temp\opencode\sprint3-backup\`):

- `Customer.php` → `Customer.php.bak-<date>`
- `get-admin-customer-detail.php` → does not exist yet (new file; no backup
  needed, but record that it was absent).

### Per-file rollback

- **`Customer.php`**: re-upload the backed-up `Customer.php.bak-<date>` to
  `/api/models/Customer.php`. This restores the pre-Sprint-3 `update()` /
  `updateUser()` behavior (no preservation logic).
- **`get-admin-customer-detail.php`**: delete the file from
  `/api/api/customer/`. The legacy `get.php` remains the detail source and the
  Angular bundle (if already deployed) must be rolled back to the previous
  build, since the new UI calls this endpoint.

---

## 2. Backend upload order

1. Upload `Customer.php` first (the model change the endpoint depends on).
2. Upload `get-admin-customer-detail.php` second.
3. Run `php -l` on both files locally **before** uploading (already clean at
   `92b04c6`).

---

## 3. Live endpoint verification (after upload)

Run these against production. All commands use the double `/api/api/` path.

### 3a. 200 — known customer with jobs

```text
GET https://tybofashion.co.za/api/api/customer/get-admin-customer-detail.php?CompanyId=80edddf9-6fc0-11eb-9698-12911df8ace9&CustomerId=9fae761b-a2ce-11eb-bcb8-ac1f6bd0427e
```

Expect `200`, clean JSON, `customer` group with editable fields + `FullName`,
and `analytics` group. Verify:

- Response contains **neither** `"Password"` **nor** `"UserToken"`.
- `analytics.TotalJobs` matches the known job count for that customer.
- `analytics.PaymentCompletionRate` is a number when there is job value, or
  `null` when there is none (never a fabricated `0`).
- No PHP warnings / no `Undefined` text in the raw body.

### 3b. 400 — missing CompanyId

```text
GET https://tybofashion.co.za/api/api/customer/get-admin-customer-detail.php?CustomerId=9fae761b-a2ce-11eb-bcb8-ac1f6bd0427e
```

Expect `400` `{"error":"CompanyId is required."}`.

### 3c. 400 — missing CustomerId

```text
GET https://tybofashion.co.za/api/api/customer/get-admin-customer-detail.php?CompanyId=80edddf9-6fc0-11eb-9698-12911df8ace9
```

Expect `400` `{"error":"CustomerId is required."}`.

### 3d. 404 — unknown customer

```text
GET https://tybofashion.co.za/api/api/customer/get-admin-customer-detail.php?CompanyId=80edddf9-6fc0-11eb-9698-12911df8ace9&CustomerId=does-not-exist
```

Expect `404` `{"error":"Customer not found."}`.

### 3e. Analytics contract/value checks

For a customer with jobs (e.g. `9fae761b-a2ce-11eb-bcb8-ac1f6bd0427e`),
confirm the `analytics` group contains exactly:

```json
{
  "TotalJobs": <int>,
  "ActiveJobs": <int>,
  "CompletedJobs": <int>,
  "CustomerLifetimeValue": <float>,
  "OutstandingBalance": <float>,
  "PaymentCompletionRate": <number|null>,
  "ProfileCompleteness": <number|null>,
  "LastActivityDate": <string|null>
}
```

### 3f. Legacy regression

- `GET /api/api/customer/get.php?CustomerId=9fae761b-a2ce-11eb-bcb8-ac1f6bd0427e`
  → `200`, unchanged full analytics payload (legacy endpoint untouched).
- `GET /api/api/customer/list.php?CustomerType=Customer&CompanyId=80edddf9-6fc0-11eb-9698-12911df8ace9`
  → `200`, unchanged raw-array contract (legacy picker rollback path).
- New Job picker (current production build) still lists/adds/selects a
  customer via `list.php`.

---

## 4. Production `SHOW INDEX` and `EXPLAIN`

The new detail query filters on `(CustomerId, CompanyId, StatusId)` and joins
`job` on `(CustomerId, StatusId)`. Run:

```sql
SHOW INDEX FROM customer;
SHOW INDEX FROM job;
EXPLAIN SELECT ... FROM customer c LEFT JOIN job j ON c.CustomerId = j.CustomerId AND j.StatusId = 1
  WHERE c.CustomerId = :CustomerId AND c.CompanyId = :CompanyId AND c.StatusId = 1
  GROUP BY c.CustomerId, ...;
```

- `customer` already has `PRIMARY(CustomerId)` and
  `idx_customer_company_type_status_modified` (Sprint 2). The detail lookup is
  by primary key, so it should use `PRIMARY` with `rows=1`.
- `job` already has `idx_job_company_status_date` (Sprint 1). The join on
  `(CustomerId, StatusId)` may or may not use an index; record the plan.
- **No migration is applied unless the production plan proves a material
  improvement.** If the detail lookup is already `type=const`/`type=eq_ref`
  on `PRIMARY`, no index is needed. Record the evidence and close.

> **Status (2026-09-04):** the endpoint is live and verified (sections 3a–3f
> pass). The `SHOW INDEX`/`EXPLAIN` checks require production DB access,
> which is not available to the automation. Run the SQL above in the hosting
> panel and record the output here before the frontend gate is lifted.

### Production `SHOW INDEX` (2026-09-04, recorded)

**`customer`**

| Key | Columns | Cardinality |
|---|---|---|
| `PRIMARY` | `CustomerId` | 416 |
| `idx_customer_company_type_status_modified` | `CompanyId, CustomerType, StatusId, ModifyDate, CreateDate, CustomerId` | 416 |

**`job`**

| Key | Columns | Cardinality |
|---|---|---|
| `PRIMARY` | `JobId` | 627 |
| `idx_job_company_status_date` | `CompanyId, StatusId, CreateDate` | 627 |

### Index decision

- The detail lookup filters on `(CustomerId, CompanyId, StatusId)`; `customer`
  is resolved by `PRIMARY(CustomerId)` → `type=const`/`eq_ref`, `rows=1`.
  Optimal; no new index on `customer`.
- The `job` join is on `(CustomerId, StatusId)`. There is no dedicated
  `job.CustomerId` index, but this is a **single-customer** detail lookup (one
  customer's jobs), so the scan is bounded and no material improvement is
  justified.
- **No migration is applied.** The existing Sprint 1/2 indexes already serve
  the detail query. Recorded as "no index added".

---

## 5. Hard gate

**Do not upload the Angular bundle until the new backend endpoint passes
sections 3a–3f and section 4 is recorded.** If any check fails, roll back the
backend per section 1 and do not proceed to the frontend.

---

## 6. Angular build manifest

Build from the approved commit `92b04c6`:

```text
npm run build
```

Output: `dist/tybo-fashion-mat/` (or the configured output path). Upload the
entire `dist/` tree to the production web root that serves the SPA.

### Upload order

1. `index.html` last (so a partial upload never serves a broken entry point).
2. `main.*.js`, `polyfills.*.js`, `runtime.*.js`, `styles.*.js/css` first.
3. `assets/` and any other hashed chunks.

### Cache handling

- Hashed filenames (`main.<hash>.js`) are immutable — upload them and let the
  CDN/browser cache them; the new `index.html` references the new hashes.
- `index.html` should be served with `no-cache` so clients pick up the new
  bundle references. If the hosting panel sets a long cache on `index.html`,
  add a cache-busting header or purge the CDN cache after upload.

### Bundle-hash confirmation

After upload, fetch the production `index.html` and confirm it references the
new hashed bundle filenames (compare against the local `dist/` build). The
deployed hashes must differ from the previous production build.

### Rollback

- Re-upload the previous production `dist/` (or restore from the hosting
  panel's backup) and purge the CDN cache. The previous build's `index.html`
  references the old hashes, so clients revert cleanly.

---

## 7. Post-frontend smoke matrix

After the Angular bundle is deployed, run against production:

### Customer Detail

- Existing customer with complete data renders all metrics and sections.
- Customer with missing phone/email/address hides Call/Email and the Address
  section.
- Measurements render only real values; a customer with no measurements shows
  the empty state with Add Measurements.
- Direct URL refresh works.
- Invalid customer ID → not-found state with Back to Customers.
- Backend 400/404/500 → error + Retry; Retry recovers.
- Edit modal open/cancel; failed update recovers; successful update refreshes
  the displayed data.
- Create Job opens the modal with the customer preselected and requires
  confirmation.

### Customer Picker

- First page renders lean rows (name, phone, email only); no analytics/card
  content.
- Search by name, phone, email; rapid typing cancels stale requests.
- Previous/Next boundaries; beyond-last-page state.
- HTTP failure → error + Retry; recovery.
- Persistent New Customer action.
- Selecting once creates exactly one job; repeated clicking cannot create
  duplicates.
- Failed job creation releases the picker.
- Close/reopen resets picker-local state; close during creation is blocked.
- Standalone `/store/admin/customers` URL is untouched.

### Edit preservation (production)

- Open a customer, edit-save without changing password/token. Confirm the
  `Password`, `UserToken`, `CreateUserId`, `ModifyUserId` columns are
  unchanged in the database after the save.

### One-request job creation

- From the picker and from the detail Create Job confirmation, confirm exactly
  one `add-job.php` request per selection (Network tab).

---

## 8. Sprint-document update (after production evidence)

After the backend passes and the frontend is deployed, update
`sprints/3-customer-detail-and-lean-job-picker.md`:

- Mark Phase 7 deployment tasks complete.
- Record the actual production evidence: endpoint 200/400/404 responses,
  absence of `Password`/`UserToken`, analytics values for a known customer,
  legacy `get.php`/`list.php`/New Job regression results, `SHOW INDEX` +
  `EXPLAIN` output, deployed bundle hashes, and the post-frontend smoke
  results.
- Record rollback files and any index decision (added or "no index added").
- Keep the local matrix evidence clearly labelled as local, and add a separate
  production-evidence section.

---

## 9. Production evidence (2026-09-04, backend)

The two-file backend manifest was uploaded and verified live. All checks
below passed.

### Endpoint responses

- **200** — `get-admin-customer-detail.php?CompanyId&CustomerId=9fae761b-…`
  returned the full `customer` + `analytics` contract.
- **400** — missing `CompanyId` → `{"error":"CompanyId is required."}`.
- **400** — missing `CustomerId` → `{"error":"CustomerId is required."}`.
- **404** — unknown `CustomerId` → `{"error":"Customer not found."}`.

### Security / contract

- Response contains **neither** `"Password"` **nor** `"UserToken"`.
- No `Undefined` / `Warning` text in the raw body (no PHP warnings).

### Analytics (Fie-Fie, `9fae761b-a2ce-11eb-bcb8-ac1f6bd0427e`)

```json
{
  "TotalJobs": 32, "ActiveJobs": 0, "CompletedJobs": 22,
  "CustomerLifetimeValue": 82215, "OutstandingBalance": 77365,
  "PaymentCompletionRate": 5.9, "ProfileCompleteness": 67,
  "LastActivityDate": "2025-10-01 09:03:38"
}
```

### Legacy regression

- `get.php?CustomerId=9fae761b-…` → `200`, size 21126 (unchanged).
- `list.php?CustomerType=Customer&CompanyId=…` → `200`, size 659298
  (unchanged).
- New Job picker (current production build) still calls `list.php` → `200`
  and renders the customer list (legacy path intact).

### Pending

- ~~`SHOW INDEX` / `EXPLAIN`~~ — **recorded** (section 4): no migration
  needed; existing indexes serve the detail query.
- Angular bundle deployment (hard gate now cleared — backend fully verified).
