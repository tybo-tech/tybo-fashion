# Job / Job-item workflow baseline (captured before UI changes)

This document records the pre-existing behaviour of the admin job workflow so
the routed editor refactor can preserve it exactly. Captured against the real
API contracts with Playwright using mocked payloads (test account has 0 jobs;
real `get-jobs.php?CompanyId=c1` returns `[]`, real `get-job.php?JobId=JOB1`
returns 500 for unknown IDs).

> **Sprint 1 update (server-side Jobs list).** The admin Jobs *list* no longer
> consumes `get-jobs.php`; it paginates/searches/filters server-side through
> `get-admin-jobs.php` (lean `{items, pagination}` contract; canonical status
> set `Not started`, `In Progress`, `Completed`, `Stuck`, `Terminated`,
> `Paused`; URL-driven `?page=&q=&status=`; ~300 ms debounced,
> `switchMap`-canceled search; loading/empty/error/Retry states; Retry
> re-issues identical parameters). Everything below about job detail,
> job-item add/edit and `get-jobs.php` remains byte-identical to the original
> baseline.
>
> **Adopted status aliases (server-side normalization):** `Working on it` →
> `In Progress`; `Done` and `Complete` → `Completed`. The frontend dropdown
> exposes only the canonical set (one `Completed` option, plus `Paused`); the
> server still accepts `complete` as a compatibility alias.
>
> **Outstanding Phase 2 operational task:** production `SHOW INDEX` and
> `EXPLAIN` analysis for the new endpoint's query shapes could not be
> performed (no production DB access from this environment). No index
> migration has been committed or executed; the migration artifact
> (`api.tybo.fashion.main/database/migrations/20260904_admin_jobs_query_indexes.sql`)
> must be created and committed only after that evidence is recorded on
> production.

## Service methods (src/services/job.service.ts)

| Method | Endpoint | Notes |
|---|---|---|
| `getjob(jobId)` | GET `job/get-job.php?JobId=` | Returns `Job` incl. `JobItems[]` |
| `getJobItemById(jobItemId)` | GET `job-item/get-job-item.php?JobItemId=` | Returns `JobItem` |
| `addJobItem(jobItem)` | POST `job-item/add-job-item.php` | `JobItemId` empty on create; response echoes item with server ID |
| `updateJobItem(jobItem)` | POST `job-item/update-job-item.php` | Full item body; response echoes item |
| `update(job)` | POST `job/update-job.php` | Full `Job` body incl. `JobItems[]` |
| `cart_total(job)` | client-side | `ShippingPrice + Σ(UnitPrice*Quantity)` then discount; also rewrites each item's `SubTotal` |
| `initJobItem(jobId, companyId, userId)` | client-side | Blank item: `Quantity: 1`, `StatusId: 1`, `Metadata: { ProductId: '' }` |

## Job-item required fields (model `src/models/job-item.model.ts`)

Image (`FeaturedImageUrl`), Item name, Size (+ optional Measurements via
`Metadata.Measurements`), Colour, Quantity, Unit price, Assigned user
(`Metadata.AssignedTo` + `Metadata.AssignedToName`), Notes
(`Metadata.Notes`). Derived: `SubTotal` (client recomputed), `SalePrice`,
`ItemType`, audit IDs, `StatusId`.

## Add flow (JobItemsComponent.onJobItemUpdated)

1. `initJobItem(job.JobId, job.CompanyId, job.CreateUserId)` — modal form.
2. POST `add-job-item.php` with empty `JobItemId`.
3. Push returned item into `job.JobItems`.
4. `updateJobTotals()`: `TotalCost = cart_total(job)`,
   `Metadata.paidAmount/dueAmount` recomputed.
5. POST `update-job.php` (whole job, now incl. new item; observed
   `TotalCost: 1010 = 60 shipping + 500 + 150 + 300`).
6. Toast "Job item created successfully".

Observed add payload:

```json
{"JobItemId":"","JobId":"JOB1","CompanyId":"c1","FeaturedImageUrl":"","Size":"","Colour":"Navy","ItemName":"Waistcoat","Measurements":[],"ItemType":"","UnitPrice":300,"SalePrice":0,"Quantity":1,"SubTotal":"","CreateUserId":"u1","ModifyUserId":"u1","StatusId":1,"Metadata":{"ProductId":""}}
```

## Edit flow (JobItemComponent.onJobItemUpdated)

1. Modal opens with the existing item (`editMode` toggle).
2. POST `update-job-item.php` with the full item (observed payload kept
   `JobItemId: "ITEM1"`, all fields incl. `Metadata.Notes`).
3. Local `jobItem = data`, totals recomputed locally.
4. Note: the parent job is **not** re-persisted on plain edit (only add and
   qty-change persist it); `check_total()` on page load repairs drift. The
   routed editor will keep this asymmetry out by persisting totals after
   both add and edit (same `update-job.php` call the add path already uses).
5. Print card link: `Constants.PrintJobCard + JobItemId`.

Observed edit payload:

```json
{"JobItemId":"ITEM1","JobId":"JOB1","CompanyId":"c1","FeaturedImageUrl":"","Size":"M","Colour":"Midnight Navy","ItemName":"Suit jacket","ItemType":"","UnitPrice":500,"SalePrice":0,"Quantity":1,"SubTotal":"450.00","CreateUserId":"u1","ModifyUserId":"u1","Measurements":[],"StatusId":1,"Metadata":{"ProductId":"","AssignedTo":"","AssignedToName":"","Notes":"Canvas front"}}
```

(`SubTotal` arrives stale from the form; `cart_total()` fixes it client-side.)

## Existing UI wiring (pre-refactor)

- `JobComponent` (`/store/admin/job/:id[/:backTo]`) loads job, normalises
  Metadata, calls `check_total`.
- `JobItemsComponent` owns `addMode` + "Add item" button; hosts
  `JobItemFormComponent` in an overlay for **add**.
- `JobItemComponent` owns `editMode`; thumbnail/name click toggles
  `JobItemFormComponent` in an overlay for **edit**; also handles inline qty
  update and delete.
- `JobItemFormComponent` renders `_overlay/_modal`, header with close-X,
  image widget, size/measurements picker, qty/price, assigned user, notes,
  Save/Print/Close. Emits `jobItemUpdated` / `onClose`.

## Behaviour to preserve after the routed refactor

- Same endpoints, payloads and response handling (see above).
- Add: server-returned item appended to `job.JobItems`; totals recalculated
  and **persisted** via `update-job.php`.
- Edit: item replaced in `job.JobItems` (matched by `JobItemId`); totals
  recalculated and persisted.
- Parent-child validation: `item.JobId === route jobId` (edit of a mismatched
  item must fail loudly, never silently create). Client-side check only; the
  PHP endpoints do not enforce authenticated tenant authorization.
- Cancel returns to Job Details; Save returns to Job Details; browser Back
  works; direct refresh works on both routes.
- Size "Measurements"/"Later" keeps `Metadata.Measurements` handling.
- Assigned user select derives `Metadata.AssignedToName` from the user list.