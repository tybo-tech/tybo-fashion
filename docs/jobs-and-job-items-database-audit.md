# Jobs & Job Items — Database, Backend & Frontend Audit

This document studies the **job** and **jobitem** tables, the PHP backend that
serves them, and the Angular admin frontend that edits them — with a focus on
the **size** flow (creating a new size) and the stability of editing job items.

---

## 1. Local environment & database access

- **Container orchestration:** `api.tybo.fashion.main/podman-compose.yml`
  - `php` service → port `8080:80`, mounts `./` to `/var/www/html`
  - `mysql` service → port `3306:3306`, database `tybo_fashion`
  - `phpmyadmin` → port `8081:80`
- **Connection (PHP):** `api.tybo.fashion.main/config/Database.php`
  - Local flag `$isLocal = false` → connects to `mysql` host, db `tybo_fashion`,
    user `docker` / password `docker`.
  - (A commented-out local branch uses `localhost`, db `tybocoza_editor`,
    root / empty password.)
- **Schema source:** `api.tybo.fashion.main/db.sql` (the `job` and `jobitem`
  table definitions and seed data).

---

## 2. The `job` table

Defined in `db.sql` (around line 1230). Columns:

| Column | Type | Notes |
|---|---|---|
| `JobId` | varchar | PK (UUID) |
| `CompanyId` | varchar | tenant |
| `ParentCompanyId` | varchar | nullable |
| `CustomerId` | varchar | FK → customer |
| `CustomerName` | varchar | denormalised |
| `JobNo` | varchar | e.g. `JOB175` / `INV528` |
| `Tittle` | varchar | (sic — typo in schema) |
| `JobType` | varchar | `Internal` / `Online Shop` |
| `Description` | text | |
| `TotalCost` | varchar | **stored as string** |
| `TotalDays` | varchar | **stored as string** |
| `Shipping` | varchar | `collection` / `delivery` |
| `ShippingPrice` | varchar | **stored as string** |
| `StartDate` | datetime | nullable |
| `DueDate` | varchar | **stored as string** (ISO-ish) |
| `Status` | varchar | workflow state (`Not started`, `In Progress`, …) |
| `Class` | varchar | default `not-started` |
| `CreateDate` | datetime | |
| `CreateUserId` | varchar | |
| `ModifyDate` | datetime | |
| `ModifyUserId` | varchar | |
| `StatusId` | int | active-record flag (`1` = active) |
| `Metadata` | text | JSON blob (payments, logs, discount, invoice no, …) |

**Key observations**
- `TotalCost`, `TotalDays`, `ShippingPrice`, `DueDate` are **varchar**, not
  numeric/date types. This is a data-integrity smell: arithmetic and date
  comparisons must cast/parse defensively.
- `Status` (workflow) and `StatusId` (soft-delete/active flag) are **two
  different concepts** that are easy to conflate.
- `Metadata` is a free-form JSON text column — the source of truth for
  payments, logs, discount, invoice number, etc.

---

## 3. The `jobitem` table

Defined in `db.sql`. Columns:

| Column | Type | Notes |
|---|---|---|
| `JobItemId` | varchar | PK (UUID) |
| `JobId` | varchar | FK → job |
| `CompanyId` | varchar | tenant |
| `FeaturedImageUrl` | varchar | |
| `Measurements` | text | JSON array of `{Name, Value, Units, Image}` |
| `Metadata` | text | JSON blob (`AssignedTo`, `AssignedToName`, `Notes`, `ProductId`, `Measurements`) |
| `Size` | varchar | free text: a size label OR `Measurements` OR `Later` |
| `Colour` | varchar | |
| `ItemName` | varchar | garment name |
| `ItemType` | varchar | product id / type |
| `UnitPrice` | varchar | **stored as string** |
| `Quantity` | varchar | **stored as string** |
| `SubTotal` | varchar | **stored as string** |
| `CreateUserId` | varchar | |
| `ModifyUserId` | varchar | |
| `CreateDate` | datetime | |
| `ModifyDate` | datetime | |
| `StatusId` | int | |

**Key observations**
- `UnitPrice`, `Quantity`, `SubTotal` are **varchar** — the backend must
  `number_format()`/cast them on write and the frontend must parse them.
- `Size` is a **free-text string**, not a FK to a sizes table. The "size
  library" lives in the `other_info` table (see §5), and `jobitem.Size` merely
  stores a label copied from it (or the sentinel values `Measurements` /
  `Later`).
- `Measurements` (top-level) and `Metadata.Measurements` both exist; the
  frontend primarily uses `Metadata.Measurements`.

---

## 4. Backend CRUD coverage

### 4.1 Job — `models/Job.php`

| Operation | Method | Endpoint | Notes |
|---|---|---|---|
| Create | `Create()` | `api/job/add-job.php` | Inserts; **does not** write `StartDate` (only `DueDate`). |
| Read (all) | `GetJobsByCompanyId()` | `api/job/get-jobs.php` | Enriched: customer, order, derived fields. |
| Read (one) | `GetById()` / `GetJobById()` | `api/job/get-job.php` | `GetJobById` embeds Customer, Order, JobItems, Company. |
| Read (admin page) | `GetAdminJobsPage()` | `api/job/get-admin-jobs.php` | Lean, paginated list. |
| Update | `Update()` | `api/job/update-job.php` | Writes `StartDate` + `DueDate`. |
| Delete | — | — | **No hard delete endpoint.** Jobs are soft-deleted via `StatusId`. |
| List | `GetJobsByCreateUserId()` | — | By creator. |

**Gaps**
- **No delete** (only soft-delete via `StatusId`).
- `Create()` omits `StartDate` (only `Update()` writes it) — a newly created
  job has no start date.
- `GetById()` returns raw `SELECT *` with `Metadata` decoded but no customer /
  order / items enrichment; `GetJobById()` is the enriched variant. Callers
  must pick the right one.

### 4.2 Job item — `models/JobItem.php`

| Operation | Method | Endpoint | Notes |
|---|---|---|---|
| Create | `Create()` | `api/job-item/add-job-item.php` | |
| Read (one) | `getById()` | `api/job-item/get-job-item.php` | Optionally embeds parent job. |
| Read (scoped) | `getScopedById()` | `api/job-item/get-job-item-scoped.php` | Sprint 5: enforces CompanyId+JobId+JobItemId match. |
| Read (by job) | `getByJobId()` | `api/job-item/get-job-items.php` | |
| Read (by status) | `getByStatus()` | `api/job-item/get-job-item-by-status.php` | |
| Read (by user) | `getByAssignedTo()` | `api/job-item/get-job-item-by-user.php` | |
| Read (by company) | `getByCompanyId()` | `api/job-item/get-job-item-by-companyId.php` | |
| Update | `Update()` | `api/job-item/update-job-item.php` | |
| Delete | `Delete()` | `api/job-item/delete-job-item.php` | Hard delete. |
| **Transactional** | `JobItemTransaction` | `add/update/delete-job-item-transactional.php` | Sprint 5 §6 — atomic item + totals. |

**Transactional layer (`models/JobItemTransaction.php`)** — the modern,
recommended path:
- `add()` / `update()` / `remove()` each run in **one DB transaction** that
  also recalculates and persists the parent job `TotalCost` + `Metadata`
  totals (`JobTotals`).
- Locks the parent job row (`SELECT … FOR UPDATE`), scope-checks the garment
  (cross-job / cross-company IDs → 404), mutates, recalculates from persisted
  rows, persists totals, then commits. Any failure rolls everything back.
- Validates `UnitPrice` (non-negative number) and `Quantity` (whole number ≥ 1).
- Returns `{ garment, removedJobItemId, totals }`.

**Gaps / risks**
- Legacy `JobItem::Update()` and `Create()` do **not** recalculate job totals —
  only the transactional endpoints do. Callers using the legacy endpoints can
  leave `job.TotalCost` stale.
- `getByCompanyId()` returns raw rows **without** decoding `Measurements` /
  `Metadata` (unlike the other readers) — inconsistent.
- `getTopSellingByCompanyId()` selects `ProductId`/`ProductName` columns that
  **do not exist** on `jobitem` (they live on `product`) — this query would
  fail if invoked.

---

## 5. Sizes & measurements — the `other_info` table

Sizes and measurement templates are **not** columns on `jobitem`. They are
stored as generic key/value rows in the `other_info` table, keyed by
`ItemType`:

- `OTHER_TYPES.Sizes = 'SystemSizes'`
- `OTHER_TYPES.Measurements = 'SystemMeasurement'`

Each row has `ParentId = CompanyId` and `ItemValue` = a JSON **array of
strings** (the size labels, or the measurement names).

**Backend** — `models/Other_info.php` + `api/other_info/*.php`:
- `search.php` → `search(ParentId, ItemType)` returns rows with `ItemValue`
  JSON-decoded.
- `save.php` → `Add()` / `Update()` persist the whole `ItemValue` array.
- `get.php`, `delete.php`, `company-info.php` also exist.

**Frontend service** — `src/services/other-info.service.ts`:
- `sizes(companyId)` → `search({ ItemType: 'SystemSizes', ParentId })`
- `measurements(companyId)` → `search({ ItemType: 'SystemMeasurement', ParentId })`
- `save(data)` → POST to `other_info/save.php`
- `addNewSize(companyId, name)` / `addNewMeasurement(...)` — helper that
  fetches the row, pushes the name, saves.

---

## 6. Frontend — editing a job item (stability)

### 6.1 The editing surface

- **Route:** `/store/admin/jobs/:jobId/garments/:garmentId`
  (`src/app/admin/job-item-page/job-item-page.component.ts`).
- **Form:** `src/app/admin/job-item-form/job-item-form.component.ts` + `.html`
  (presentation only; the page owns loading/persistence/navigation).
- **Size picker:** `src/app/admin/admin-select-size/admin-select-size.component.ts`
  + `.html`.
- **Measurements editor:** `src/app/admin/admin-measurements/admin-measurements.component.ts`
  + `.html`.

### 6.2 Edit-mode data flow

1. `JobItemPageComponent.load()` (edit mode) calls
   `jobService.getJobItemScoped(companyId, jobId, jobItemId)` →
   `api/job-item/get-job-item-scoped.php` → `getScopedById()`.
2. The server returns the garment **only** if `JobItemId` belongs to `JobId`
   and `JobId` to `CompanyId` (404 otherwise). This is identifier scoping, not
   authentication.
3. The form binds directly to `jobItem` (two-way `ngModel`).
4. Save → `addJobItemTransactional` / `updateJobItemTransactional` →
   `JobItemTransaction` (atomic item + totals).
5. Success is gated by `isValidGarmentMutationResponse()` — the frontend only
   treats a response as success when the garment (with matching ID on edit),
   `removedJobItemId: null`, and **complete totals** are all present.

**Stability features already present**
- Unsaved-change protection: snapshot/dirty tracking, a `canDeactivate` route
  guard, and a `beforeunload` handler.
- Duplicate-submission guard (`saving` / `removing` flags).
- Scoped reads prevent cross-job/cross-company garment access.
- Transactional writes prevent partial saves (item saved but totals stale).

### 6.3 The size flow — creating a new size

The size picker (`admin-select-size.component.html`) is a modal opened by
clicking the size field. It shows the company's saved sizes as buttons plus a
**"New Size"** button.

**Flow to create a new size:**

1. User clicks the size field → `toggle_sizes()` → `show_sizes = true`.
2. `ngOnInit()` already loaded the sizes via
   `otherInfoService.sizes(user.CompanyId)` → `other_info/search.php` with
   `ItemType = 'SystemSizes'`. The first returned row is stored in
   `this.sizes` (an `OtherInfo<string[]>` whose `ItemValue` is the array of
   size labels).
3. User clicks **"New Size"** → `show_new_size = true` → a nested modal with a
   text input (`[(ngModel)]="name"`) and a **Save** button.
4. User types a label (e.g. `XXL`) and clicks **Save** → `addSize()`:
   - Guards: `this.sizes` exists, `this.name` non-empty, `ItemValue` is an array.
   - Pushes `this.name` onto `this.sizes.ItemValue`.
   - Calls `this.update('Size Added', …)`.
   - `update()` → `otherInfoService.save(this.sizes)` → POST
     `other_info/save.php` → `Other_info::Update()` → persists the **entire**
     `ItemValue` array (now including the new size).
   - On success (`data.Id`), `this.sizes = data` and a toast is shown.
   - Resets `this.name = ''` and `this.show_new_size = false`.
5. The new size is now part of the company's size list and appears as a button
   on the next open of the picker.

**Important:** creating a size only updates the **size library**
(`other_info`). It does **not** assign the size to the current garment. To
apply it, the user must click the new size button, which emits
`selectSize.emit(item)` → sets `jobItem.Size = item`.

### 6.4 The measurements flow

- Choosing **"Use Measurements"** emits `selectSize.emit('Measurements')` and
  sets `jobItem.Size = 'Measurements'`.
- `sizeChanged('Measurements')` in the form seeds
  `jobItem.Metadata.Measurements` with three blank rows (Waist / Hips / Chest).
- The measurements editor (`admin-measurements`) lets the user add lines
  (from the system measurement template via `app-system-measurements`), set
  units, and enter values. `onDone()` validates units + values and emits
  `onCaptured` → writes back to `jobItem.Metadata.Measurements`.
- Choosing **"Later"** sets `jobItem.Size = 'Later'` (also treated as
  measurements mode by `isMeasurements`).

---

## 7. Findings & risks

### Data model
1. **Varchar money/quantity/dates** (`TotalCost`, `UnitPrice`, `Quantity`,
   `SubTotal`, `ShippingPrice`, `DueDate`) — requires defensive casting on
   every read/write; arithmetic and date logic are error-prone.
2. **`Size` is free text**, not a FK — a garment can hold a size label that no
   longer exists in the `other_info` library, or a sentinel (`Measurements` /
   `Later`). No referential integrity.
3. **`Metadata` JSON blobs** on both `job` and `jobitem` are the source of
   truth for payments, logs, discount, notes, assigned user, and measurements —
   schema-less and easy to corrupt.

### Backend
4. **No hard delete for jobs** — only soft-delete via `StatusId`.
5. **`Job::Create()` omits `StartDate`** — only `Update()` writes it.
6. **Legacy job-item `Create()`/`Update()` do not recalc job totals** — only
   the transactional endpoints do. Mixed usage can leave `job.TotalCost` stale.
7. **`getByCompanyId()` doesn't decode JSON** columns (inconsistent with other
   readers).
8. **`getTopSellingByCompanyId()` references non-existent columns**
   (`ProductId`, `ProductName` on `jobitem`) — would error if called.

### Frontend
9. **Size library is a single shared array** — `addSize()` mutates and saves
   the whole `ItemValue` array. Concurrent edits (two admins) can overwrite
   each other (last-write-wins, no merge).
10. **New-size flow is decoupled from the garment** — after creating a size the
    user must click it again to apply it; easy to create a size and forget to
    assign it.
11. **`addNewSize()` in the service is unused by the picker** — the picker
    implements its own inline `addSize()`/`update()`; two code paths exist for
    the same operation.
12. **No duplicate-size guard** — the same label can be pushed multiple times
    into `ItemValue`.
13. **`admin-measurements` `onDone()`** returns early on the first empty value
    but the `values_error` message is generic; validation is per-row but the
    error is global.

### Recommended next steps (not implemented here)
- Normalise money/quantity/date columns to proper numeric/date types, or at
  least centralise casting helpers.
- Add a `size` FK / lookup and validate `jobitem.Size` against the company's
  size library on write.
- Make the transactional job-item endpoints the **only** write path and
  deprecate the legacy ones.
- Add duplicate-size detection and a merge-safe update for the size library.
- Fix `getTopSellingByCompanyId()` or remove it.
