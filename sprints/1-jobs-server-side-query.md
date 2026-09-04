# Sprint 1 — Jobs Server-Side Query Path

> **Program**: Tybo Fashion Admin
> **Status**: Locked — ready for implementation
> **Duration**: Multi-phase (5 phases, sequential execution)
> **Previous work**: Admin workspace neutral theme + yellow accent (`#e6b505`), stable router state and shared nav matching, minimal unboxed Jobs list with URL-synced `status`/`q` filters, routed job-item editor with validated save, corrective commit `b2414a9` (case-insensitive status handling, editor response validation), docs (`docs/admin-ui-patterns.md`, `docs/job-workflow-baseline.md`).

---

## Objective

Move the Admin Jobs list from browser-side pagination/filtering over the full
`get-jobs.php` payload to a dedicated read-only backend endpoint that performs
server-side pagination, search and status filtering, returning only the four
fields the minimal list renders. The existing `get-jobs.php` contract is
untouched. Job creation and editing payloads are untouched.

When complete: `/store/admin/jobs` requests one page at a time
(`?page=&pageSize=&q=&status=`), the browser never downloads or scans the full
job collection, refresh/back navigation restores page + search + status, and
loading / empty / failure / Retry / Previous / Next states are present.

---

## Existing Foundation (Locked)

- **Minimal Jobs list UI** — unboxed 61px rows, four columns (job number,
  customer, item summary, status badge), yellow accent tokens
  (`--admin-accent:#e6b505`), no stat cards, no side borders.
- **URL filter contract** — canonical `/store/admin/jobs?status=&q=`;
  legacy `/jobs/:status` redirect; filters reset to page 1 on change;
  `trackByJobId`. This sprint extends the URL with `page` and moves filtering
  server-side; the canonical route stays.
- **Status semantics** — `job.Status` holds workflow values
  (`Not started`, `In Progress`, `Completed`, `Complete`, `Terminated`,
  `Stuck`); `StatusId = 1` is the active-record flag only. The
  case-insensitive status matching fix from `b2414a9` remains.
- **Routed job-item editor** — `JobItemPageComponent` owns load/validation/
  persistence; payload contracts (add → push → `cart_total()` → totals POST;
  edit → replace → totals POST) are locked.
- **Admin shell** — shared route matching (`admin/admin/nav-routes.ts`),
  bottom nav, offcanvas, sidebar; brand link stays dark; single mobile More.
- **Design system** — `docs/admin-ui-patterns.md` tokens and patterns.
- **Backend stack** — PHP 8 + PDO + MySQL at
  `https://tybofashion.co.za/api/api`; production deploys via FileZilla.
- **`get-jobs.php` contract** — raw array, used by storefront profile-orders
  with `CreateUserId`; must not change.

---

## Business Capabilities

| Capability | Type | Description |
| --- | --- | --- |
| Admin jobs query endpoint | New backend | `GET /job/get-admin-jobs.php` returning one lean page of jobs with pagination metadata |
| Server-side pagination | New backend | `LIMIT`/`OFFSET` with deterministic sort and `COUNT(*)` metadata |
| Server-side search | New backend | `q` matches job number, customer name/surname, legacy `job.CustomerName`, customer phone |
| Server-side status filter | New backend | `status` matches `job.Status` (never `StatusId`), case-insensitively |
| Correct status display | Backend fix | List returns `job.Status` as display status; `StatusId`-derived `StatusDisplay` defect eliminated on this path |
| Lean client list item | New frontend | `JobListItem` interface (`JobId`, `JobNo`, `CustomerName`, `Status`) |
| URL-driven list state | Frontend rework | `page`, `q`, `status` in the URL; no `all_jobs`, no browser filter/slice |
| Debounced, cancelable search | Frontend | ~300ms debounce; `switchMap` cancels obsolete requests |
| List state UI | Frontend | Loading, empty, failure + Retry, Previous/Next driven by API metadata |

---

## Domain Model

```
Company
└── Job (active records only: StatusId = 1)
    ├── Status (workflow text) ── used for filter + display
    ├── JobNo, CreateDate ── sort / search keys
    └── JobItem[] (untouched in this sprint)
Customer
└── Job (legacy jobs may reference customer by name only)
```

### Collections

| Collection | Owner | Key fields used here |
| --- | --- | --- |
| Job | Company | `JobId`, `CompanyId`, `JobNo`, `Status`, `StatusId`, `CustomerName`, `CustomerId`, `CreateDate` |
| Customer | Company | `CustomerId`, `CompanyId`, `Name`, `Surname`, `Phone` |

### Lookup Collections

| Collection | Values |
| --- | --- |
| Job workflow statuses | `Not started`, `In Progress`, `Completed`, `Complete`, `Terminated`, `Stuck` (case varies in DB; compare case-insensitively) |
| Active-record flag | `StatusId = 1` — membership condition, never a display value |

### Collection Links

| Link | Cardinality | Implementation |
| --- | --- | --- |
| Company → Job | 1:N | `job.CompanyId` (every query restricted) |
| Job → Customer | N:1 | `LEFT JOIN customer ON customer.CustomerId = job.CustomerId` (legacy rows may have no match) |

### Invariants

- Every endpoint query is bounded by `CompanyId`.
- `StatusId = 1` filters active records only; it never produces display text.
- `job.Status` is the single source of truth for filter matching and display.
- Pagination never removes the company boundary.
- `get-jobs.php` response contract does not change.
- Job add/edit payload contracts do not change.

---

## Shared CRUD Pattern

Read-only slice of the universal flow:

```
List (/store/admin/jobs?page&q&status)
    │  server-returned lean page + metadata
    ▼
Detail (/store/admin/job/:jobId/jobs)  ← existing, untouched
    │
    ▼
Form (/store/admin/job/:jobId/items/new|:jobItemId/edit)  ← existing, untouched
```

This sprint touches only the List leg; Detail and Form keep their current
implementations and payloads.

---

## Architecture Decisions

1. **New endpoint, not a modified one.** `get-admin-jobs.php` is additive;
   `get-jobs.php` keeps its raw-array contract for the storefront
   profile-orders caller.
2. **Lean response object, not a bare array.** `{ items, pagination }` carries
   `page`, `pageSize`, `totalItems`, `totalPages`, `hasPrevious`, `hasNext`.
3. **SQL `LEFT JOIN` over PHP-side customer loading.** Customer name resolved
   in one query with the fallback
   `COALESCE(NULLIF(TRIM(CONCAT_WS(' ', customer.Name, customer.Surname)), ''), NULLIF(job.CustomerName, ''), '—')`.
4. **No order/payment data on this path.** The minimal list does not render
   payment information; the endpoint must not fetch it.
5. **Deterministic sort.** `CreateDate DESC, JobId DESC` so pagination is
   stable across requests.
6. **Case-insensitive status matching server-side.** Mirrors the frontend fix
   in `b2414a9` (DB stores `Not started`; UI sends `not-started` slugs or
   mixed-case text).
7. **Client-supplied `CompanyId` is accepted as-is.** Tenant authorization is
   a separate security-hardening task (see Future Modules); this sprint must
   not weaken or pretend to fix it.
8. **Backend deploys independently.** New endpoint + model changes upload
   first; Angular integration follows only after production endpoint
   verification. `Database.php` is never uploaded from this repository.

---

## Routes

### Backend

```
GET /job/get-admin-jobs.php
    ?CompanyId={companyId}
    &page={n}            // default 1
    &pageSize={n}        // default 20, max 100
    &q={search text}     // optional
    &status={slug}       // optional: not-started | in-progress | completed | complete | terminated | stuck
```

### Frontend

```
/store/admin/jobs?page=1&q=sibahle&status=in-progress
/store/admin/jobs                      // defaults: page 1, no q, no status
/store/admin/job/:jobId/jobs           // unchanged
/store/admin/job/:jobId/items/new      // unchanged
/store/admin/job/:jobId/items/:jobItemId/edit  // unchanged
```

---

## Phases

### Phase 1 — Backend endpoint and lean contract

Build `get-admin-jobs.php` plus the model query it needs, without touching
`get-jobs.php`.

#### Tasks

- [ ] **1.1** Add a lean jobs-list query to the Job model: `CompanyId`-bound,
      `StatusId = 1`, `LEFT JOIN customer`, deterministic
      `CreateDate DESC, JobId DESC` sort, `LIMIT`/`OFFSET`, and a matching
      `COUNT(*)` query with identical WHERE conditions.
- [ ] **1.2** Implement search in the WHERE clause: `job.JobNo`, joined
      `customer.Name`/`customer.Surname`, legacy `job.CustomerName`, customer
      phone (preserving current behaviour), all as case-insensitive
      `LIKE '%q%'` matches.
- [ ] **1.3** Implement status filtering against `job.Status`
      case-insensitively; reject/ignore `StatusId`-based status values. Map
      `status` slugs (`not-started`, `in-progress`, …) to stored values inside
      the endpoint.
- [ ] **1.4** Validate and clamp parameters: `page ≥ 1`, `1 ≤ pageSize ≤ 100`
      (default 20), empty `q`/`status` treated as absent, unknown `status`
      returns an empty `items` array rather than an error page.
- [ ] **1.5** Return the lean contract:
      `{"items":[{"JobId","JobNo","CustomerName","Status"}],"pagination":{"page","pageSize","totalItems","totalPages","hasPrevious","hasNext"}}`
      with the customer-name SQL fallback (em-dash when no name resolves).
- [ ] **1.6** Confirm the endpoint never loads customers into PHP arrays and
      never fetches order/payment data for the list.
- [ ] **1.7** Verify `get-jobs.php` is byte-identical to its current state
      (`git diff` on the backend repo must show no changes to it).

#### Exit Criteria

- [ ] `get-admin-jobs.php` returns the lean JSON object for page 1 with
      defaults when called with only `CompanyId`.
- [ ] `q=sibahle` returns only matching jobs; `status=not-started` matches DB
      rows stored as `Not started`.
- [ ] `page=2` returns a different, non-overlapping set; `totalItems` matches
      a manual `COUNT(*)` on the same filters.
- [ ] Invalid `page`/`pageSize` values are clamped, not fatal.
- [ ] `get-jobs.php` unchanged in version control.

---

### Phase 2 — Production deployment and endpoint verification

Deploy the new read-only endpoint and validate it against live data.

#### Tasks

- [ ] **2.1** Run `SHOW INDEX` on production `job` and `customer` tables;
      record existing indexes before adding any.
- [ ] **2.2** Add only the missing indexes from the agreed set:
      `job (CompanyId, StatusId, CreateDate)`,
      `job (CompanyId, StatusId, Status, CreateDate)`,
      `job (CompanyId, JobNo)`, `customer (CompanyId, CustomerId)` — skip any
      that `SHOW INDEX` already covers.
- [ ] **2.3** Upload via FileZilla: the new endpoint file and required model
      changes only. Do **not** upload `Database.php`.
- [ ] **2.4** Test the live endpoint directly (browser/HTTP client): unfiltered
      pagination, customer search, job-number search, every status slug,
      invalid parameters, empty results, first/last page boundaries.
- [ ] **2.5** Confirm the storefront profile-orders flow still works
      (regression proof that `get-jobs.php` is untouched).

#### Exit Criteria

- [ ] Live `get-admin-jobs.php` passes every Phase 1 verification against
      production data (642-job-scale totals accepted).
- [ ] Index list recorded; duplicate index additions avoided.
- [ ] `Database.php` absent from the upload set.
- [ ] Storefront profile-orders regression passes.

---

### Phase 3 — Angular service and lean interfaces

Introduce the client contract without changing list behaviour yet.

#### Tasks

- [ ] **3.1** Add `JobListItem` (`JobId`, `JobNo`, `CustomerName`, `Status`)
      and `JobsPageResponse` (`items`, `pagination`) interfaces.
- [ ] **3.2** Add a jobs-list service method building the request with
      Angular `HttpParams` (`CompanyId`, `page`, `pageSize`, `q`, `status`)
      returning `Observable<JobsPageResponse>`.
- [ ] **3.3** Keep the legacy `getJobs()` call intact for rollback; do not
      remove `all_jobs` in this phase.

#### Exit Criteria

- [ ] Service method compiles and, against the live endpoint, returns typed
      `items` + `pagination`.
- [ ] Existing jobs component behaviour is unchanged (regression check on
      `/store/admin/jobs`).

---

### Phase 4 — URL-driven Jobs list rewrite

Replace browser-side filtering/pagination with server-driven state.

#### Tasks

- [ ] **4.1** Remove `all_jobs`, browser `filter()` scanning and array
      `slice()` pagination from `jobs.component.ts`.
- [ ] **4.2** Drive the list from URL query params `page`, `q`, `status`;
      write every change back to the URL via the Router (no reload).
- [ ] **4.3** Debounce text search ~300ms; use `switchMap` so obsolete
      requests are cancelled; reset to `page=1` whenever `q` or `status`
      changes.
- [ ] **4.4** Use API `totalItems`/`totalPages`/`hasPrevious`/`hasNext` for
      pagination controls and the "Showing X–Y of Z" line; keep the existing
      minimal row markup and `trackByJobId`.
- [ ] **4.5** Preserve page, search and status across refresh and back
      navigation (URL is the single source of truth).
- [ ] **4.6** Keep the legacy `/jobs/:status` redirect and the Reset action
      (navigates to canonical route, page 1, cleared filters).
- [ ] **4.7** Render status badges from `JobListItem.Status` with the existing
      case-insensitive badge-class mapping.

#### Exit Criteria

- [ ] Network tab shows one lean request per page/filter/search change — no
      full-collection download.
- [ ] URL reflects `page`, `q`, `status`; refresh restores the exact page.
- [ ] Rapid typing issues exactly one request per settled input (debounce +
      `switchMap` verified).
- [ ] Pagination metadata comes from the API, not client arithmetic.

---

### Phase 5 — States, regression and validation

Finish the list UX and prove no regressions.

#### Tasks

- [ ] **5.1** Add loading, empty (per filter/search), and failure states with
      a Retry control that repeats the failed request.
- [ ] **5.2** Verify Previous/Next disable correctly at page boundaries per
      API metadata.
- [ ] **5.3** Regression-check the untouched flows: job detail, routed item
      add/edit (payloads byte-identical to `docs/job-workflow-baseline.md`),
      bottom-nav active states, brand colour, single More control.
- [ ] **5.4** Run `npm run build`, `npx tsc -p tsconfig.spec.json --noEmit`
      (document the known baseline `AppComponent.title` exit-2), and
      `git diff --check`.
- [ ] **5.5** Playwright verification of the full matrix: search, every status
      slug, pagination boundaries, refresh/back restore, debounce/cancel,
      failure + Retry, empty states.
- [ ] **5.6** Update `docs/admin-ui-patterns.md` and
      `docs/job-workflow-baseline.md` for the server-driven list.

#### Exit Criteria

- [ ] All Phase 4 criteria still pass with the new states present.
- [ ] Build passes; spec tsc failure limited to the known baseline.
- [ ] No regression in job detail or item editor payloads.
- [ ] Docs updated.

---

## Execution Order

```
Phase 1 ──> Backend endpoint and lean contract
    │
    ▼
Phase 2 ──> Production deployment and endpoint verification
    │
    ▼
Phase 3 ──> Angular service and lean interfaces
    │
    ▼
Phase 4 ──> URL-driven Jobs list rewrite
    │
    ▼
Phase 5 ──> States, regression and validation
```

Each phase must satisfy its **Exit Criteria** before the next phase begins.
Phase 2 gates Phase 3: the Angular integration starts only after the live
endpoint is verified, keeping the old client call available for rollback.

---

## Target File Structure

```
multi-vendor-api/                      # backend repo (deploys via FileZilla)
├── api/job/
│   ├── get-admin-jobs.php             # new read-only endpoint
│   └── get-jobs.php                   # UNCHANGED (storefront contract)
└── models/Job.php                     # lean page query + count query

src/
├── app/admin/jobs/
│   ├── jobs.component.ts              # URL-driven, server-paginated
│   └── jobs.component.html            # lean rows + states (loading/empty/error)
└── services/job.service.ts            # new lean list method (getJobs() kept)
```

---

## Out of Scope

- **Tenant authorization / authentication hardening.** The client-supplied
  `CompanyId` exposure is real but is a separate security task; this sprint
  neither fixes nor masks it.
- **Changes to `get-jobs.php`.** Additive endpoint only; storefront
  profile-orders caller must not be affected.
- **Job add/edit payload changes.** All item editor contracts stay
  byte-identical.
- **Full-text search.** `LIKE '%…%'` is acceptable at hundreds-to-thousands
  scale; FT index is deferred.
- **Payment/order data in the list.** The minimal list does not render it.
- **Job detail page data loading.** Only the list path is server-paginated.
- **Angular upgrades, UI framework additions, DB engine changes.**

---

## Future Modules (Reserved)

- **Security hardening sprint** — server-side session/tenant authorization on
  all admin endpoints (`CompanyId` derived from the authenticated principal,
  not the query string), including the new endpoint.
- **Full-text search** — `FULLTEXT` index or search service if job volume
  grows beyond low thousands.
- **Customer join normalization** — backfilling legacy `job.CustomerName`
  rows with real customer links, enabling stricter joins.
- **Saved filters / URL share presets** — building on the canonical URL
  contract established here.

---

## Definition of Done

The implementation is complete when:

- [ ] All five phases are complete with every Exit Criterion satisfied.
- [ ] `get-admin-jobs.php` is live on production and verified against all
      parameter, search, status, and boundary cases.
- [ ] `get-jobs.php` and all job add/edit payload contracts are unchanged.
- [ ] `/store/admin/jobs` performs server-side pagination, search and status
      filtering with zero full-collection downloads; URL restores full state
      on refresh and back navigation.
- [ ] Debounced, cancelable search verified; pagination driven by API
      metadata; loading/empty/failure/Retry states present.
- [ ] Index changes applied only after `SHOW INDEX` review, recorded, with
      `Database.php` never uploaded.
- [ ] `npm run build` passes; `tsc` spec failure is limited to the known
      `AppComponent.title` baseline; `git diff --check` clean.
- [ ] Playwright matrix (Phase 5.5) passes with zero console errors.
- [ ] Docs updated; the security-hardening concern is recorded, not ignored.