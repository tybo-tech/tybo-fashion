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

- **Minimal Jobs list UI** — unboxed 61px rows displaying exactly: job number,
  customer name, status badge, chevron. No item summary, no stat cards, no
  side borders. Yellow accent tokens (`--admin-accent:#e6b505`).
- **URL filter contract** — canonical `/store/admin/jobs?status=&q=`;
  legacy `/jobs/:status` redirect; filters reset to page 1 on change;
  `trackByJobId`. This sprint extends the URL with `page` and moves filtering
  server-side; the canonical route stays.
- **Status semantics** — `job.Status` holds workflow values; `StatusId = 1` is
  the active-record flag only. The case-insensitive status matching fix from
  `b2414a9` remains.
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
| Server-side search | New backend | `q` matches `job.JobNo`, `customer.Name`, `customer.Surname`, combined full name, `customer.PhoneNumber`, and legacy `job.CustomerName` |
| Server-side status filter | New backend | `status` matches `job.Status` (never `StatusId`), case-insensitively; legacy `Complete` aliases `Completed` |
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
| Customer | Company | `CustomerId`, `CompanyId`, `Name`, `Surname`, `PhoneNumber` |

### Lookup Collections

| Collection | Values |
| --- | --- |
| Job workflow statuses (canonical) | `Not started`, `In Progress`, `Completed`, `Stuck`, `Terminated`, `Paused` |
| Legacy alias | `Complete` — treated as `Completed` everywhere (filter matches both; display normalizes to `Completed`) |
| Active-record flag | `StatusId = 1` — membership condition, never a display value |

### Collection Links

| Link | Cardinality | Implementation |
| --- | --- | --- |
| Company → Job | 1:N | `job.CompanyId` (every query restricted) |
| Job → Customer | N:1 | `LEFT JOIN customer ON customer.CustomerId = job.CustomerId AND customer.CompanyId = job.CompanyId` (legacy rows may have no match; join carries the company boundary) |

### Invariants

- Every endpoint query is bounded by `CompanyId` — including the customer
  join condition.
- `StatusId = 1` filters active records only; it never produces display text.
- `job.Status` is the single source of truth for filter matching and display;
  `Complete` is a legacy alias of `Completed`, never a separate state.
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
   mixed-case text). One canonical status set — `Not started`, `In Progress`,
   `Completed`, `Stuck`, `Terminated`, `Paused` — with legacy `Complete`
   aliased to `Completed` (a `completed` filter matches both stored values).
7. **Structured error contract, never silent empty results.** Unknown status →
   HTTP `400` `{"error":"Unsupported job status."}` so frontend defects are not
   disguised as "No jobs found". Missing `CompanyId` → HTTP `400`. Invalid
   `page`/`pageSize` → clamped (page < 1 → 1; pageSize < 1 → 20;
   pageSize > 100 → 100; non-integer → default). Database/query failure →
   HTTP `500` with a generic message. SQL or exception details are never
   returned.
8. **Parameter validation before use.** Trim `q`; cap search length at 100
   characters; cast `page`/`pageSize` to integers; bind `LIMIT`/`OFFSET` with
   `PDO::PARAM_INT`; only escaped/parameterized values reach SQL.
9. **Client-supplied `CompanyId` is accepted as-is.** Tenant authorization is
   a separate security-hardening task (see Future Modules); this sprint must
   not weaken or pretend to fix it.
10. **Schema changes are committed artifacts.** Every index change ships as a
    versioned SQL migration file with named indexes and rollback statements —
    FileZilla/phpMyAdmin execution is never the only record.
11. **Indexes are evidence-based, not assumed.** `SHOW INDEX` + `EXPLAIN` on
    production decide which indexes exist. `customer (CompanyId, CustomerId)`
    is presumed redundant (`CustomerId` is the PK) and must not be added
    without proof; `job (CompanyId, JobNo)` does not serve `LIKE '%term%'`
    search and is only justified by `EXPLAIN` of the job-number search
    (exact/prefix use cases). Overlapping job indexes pay write cost on every
    job write — add the minimum proven set.
12. **Backend deploys independently.** New endpoint + model changes upload
    first; Angular integration follows only after production endpoint
    verification. `Database.php` and any credentials never appear in the
    upload manifest or commit output.

---

## Routes

### Backend

```
GET /job/get-admin-jobs.php
    ?CompanyId={companyId}
    &page={n}            // default 1; invalid → 400 for missing CompanyId only, page itself clamped
    &pageSize={n}        // default 20, max 100, clamped
    &q={search text}     // optional, trimmed, max 100 chars
    &status={slug}       // optional: not-started | in-progress | completed | complete | terminated | stuck | paused
                         // empty = all statuses; unknown slug → HTTP 400
```

### Error contract

| Condition | Response |
| --- | --- |
| Missing `CompanyId` | HTTP `400` `{"error":"CompanyId is required."}` |
| Unknown `status` slug | HTTP `400` `{"error":"Unsupported job status."}` |
| Invalid `page`/`pageSize` | Clamped to valid range (never an error) |
| Database/query failure | HTTP `500` `{"error":"Unable to load jobs."}` — generic message only |
| Any SQL/exception detail | Never returned to the client |

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
      `StatusId = 1`, `LEFT JOIN customer ON customer.CustomerId =
      job.CustomerId AND customer.CompanyId = job.CompanyId`, deterministic
      `ORDER BY CreateDate DESC, JobId DESC`, `LIMIT`/`OFFSET` bound with
      `PDO::PARAM_INT`, and a matching `COUNT(*)` query with identical WHERE
      conditions.
- [ ] **1.2** Implement search in the WHERE clause as parameterized
      case-insensitive `LIKE '%q%'` matches against: `job.JobNo`,
      `customer.Name`, `customer.Surname`, the combined full name
      (`CONCAT_WS(' ', customer.Name, customer.Surname)`), `customer.PhoneNumber`,
      and legacy `job.CustomerName`. No string interpolation into SQL.
- [ ] **1.3** Implement status filtering against `job.Status`
      case-insensitively over the canonical set (`Not started`, `In Progress`,
      `Completed`, `Stuck`, `Terminated`, `Paused`) with legacy `Complete`
      aliased to `Completed` (a `completed` filter matches both). Reject
      `StatusId`-based status values. Map `status` slugs (`not-started`,
      `in-progress`, …) to stored values inside the endpoint.
- [ ] **1.4** Implement the error contract and parameter validation: missing
      `CompanyId` → 400; unknown status slug → 400
      `{"error":"Unsupported job status."}`; trim `q` and cap it at 100
      characters; cast `page`/`pageSize` to integers and clamp
      (`page < 1 → 1`, `pageSize < 1 → 20`, `pageSize > 100 → 100`); empty
      `q`/`status` treated as absent. Failures return HTTP `500` with a
      generic message; SQL/exception details never reach the client.
- [ ] **1.5** Return the lean contract:
      `{"items":[{"JobId","JobNo","CustomerName","Status"}],"pagination":{"page","pageSize","totalItems","totalPages","hasPrevious","hasNext"}}`
      with the customer-name SQL fallback (em-dash when no name resolves) and
      `Status` normalized for display (`Complete` → `Completed`).
- [ ] **1.6** Confirm the endpoint never loads customers into PHP arrays and
      never fetches order/payment data for the list.
- [ ] **1.7** Verify `get-jobs.php` is byte-identical to its current state
      (`git diff` on the backend repo must show no changes to it).
- [ ] **1.8** Run `php -l` on every changed PHP file (endpoint + model) and
      record the output; syntax must be clean without running the backend
      locally.

#### Exit Criteria

- [ ] `get-admin-jobs.php` returns the lean JSON object for page 1 with
      defaults when called with only `CompanyId`.
- [ ] `q=sibahle` returns only matching jobs (name, surname, full name, phone,
      job number all verified); `status=not-started` matches DB rows stored as
      `Not started`; `status=completed` matches both `Completed` and legacy
      `Complete` rows; `status=paused` matches `Paused`.
- [ ] `page=2` returns a different, non-overlapping set; `totalItems` matches
      a manual `COUNT(*)` on the same filters; a `page` beyond `totalPages`
      returns empty `items` with accurate metadata.
- [ ] Missing `CompanyId` and unknown `status` each return HTTP 400 with the
      specified error body; invalid `page`/`pageSize` are clamped, not fatal.
- [ ] `php -l` clean on all changed PHP files.
- [ ] `get-jobs.php` unchanged in version control.

---

### Phase 2 — Production deployment and endpoint verification

Deploy the new read-only endpoint and validate it against live data. Schema
changes ship as committed, reproducible migration artifacts and only indexes
proven by `EXPLAIN` are added.

#### Tasks

- [ ] **2.1** Run on production and record the full output:
      `SHOW INDEX FROM job;` and `SHOW INDEX FROM customer;` — this baseline
      decides everything that follows; no index is added on assumption.
- [ ] **2.2** Run `EXPLAIN` on production for the four query shapes: default
      paginated query, status-filtered query, job-number search, and
      customer-name search. Record the output alongside the `SHOW INDEX`
      baseline.
- [ ] **2.3** Commit a migration artifact before touching production schema:
      `multi-vendor-api/database/migrations/20260904_admin_jobs_query_indexes.sql`
      containing the named indexes proven useful by 2.2 (expected baseline:
      `CREATE INDEX idx_job_company_status_date ON job (CompanyId, StatusId,
      CreateDate)` — the only presumptive index), plus rollback statements
      (`DROP INDEX ...`) as comments. Indexes NOT added without EXPLAIN proof:
      `customer (CompanyId, CustomerId)` (redundant — `CustomerId` is the PK)
      and `job (CompanyId, JobNo)` (does not serve `LIKE '%term%'`; only
      justified if `EXPLAIN` shows exact/prefix job-number lookups matter).
- [ ] **2.4** Execute only the proven migration on production (phpMyAdmin or
      equivalent), then re-run `SHOW INDEX` and the four `EXPLAIN` queries to
      record the improvement.
- [ ] **2.5** Upload via FileZilla: the new endpoint file and required model
      changes only. The upload manifest is recorded in the phase notes and
      must never contain `Database.php`, credentials, or any secrets. Commit
      output and diffs must equally contain no credentials.
- [ ] **2.6** Test the live endpoint directly (browser/HTTP client): unfiltered
      pagination, customer search (name, surname, full name, phone),
      job-number search, every status slug including `paused` and the
      `completed`/`Complete` alias, invalid parameters, empty results,
      first/last page boundaries, missing `CompanyId`, and unknown status
      (must return the 400 error body).
- [ ] **2.7** Confirm the storefront profile-orders flow still works
      (regression proof that `get-jobs.php` is untouched).

#### Exit Criteria

- [ ] Live `get-admin-jobs.php` passes every Phase 1 verification against
      production data, with totals quoted as **the verified production total**
      (no assumed job counts).
- [ ] `SHOW INDEX` baseline + four `EXPLAIN` outputs recorded before and after
      index changes; every index addition traces to an `EXPLAIN` result.
- [ ] Migration SQL committed with named indexes and rollback statements;
      `phpMyAdmin` execution is not the only record of the schema change.
- [ ] Upload manifest recorded; `Database.php` and credentials absent from it,
      from commit output, and from any logs.
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
- [ ] **4.7** Align the status filter dropdown with the canonical set: one
      `Completed` option (server matches both `Completed` and legacy
      `Complete`), plus `Paused`; remove the separate `Complete` option.
      Render status badges from `JobListItem.Status` with the existing
      case-insensitive badge-class mapping; normalize `Complete` →
      `Completed` for display.
- [ ] **4.8** Retry must re-issue the HTTP request even when URL parameters
      have not changed (retry is an explicit user action, never a no-op).

#### Exit Criteria

- [ ] Network tab shows one lean request per page/filter/search change — no
      full-collection download.
- [ ] URL reflects `page`, `q`, `status`; refresh restores the exact page.
- [ ] Rapid typing issues exactly one request per settled input (debounce +
      `switchMap` verified).
- [ ] Pagination metadata comes from the API, not client arithmetic; a page
      beyond `totalPages` renders the empty state while keeping accurate
      metadata.
- [ ] Retry triggers a new network request with identical parameters.

---

### Phase 5 — States, regression and validation

Finish the list UX and prove no regressions.

#### Tasks

- [ ] **5.1** Add loading, empty (per filter/search), and failure states with
      a Retry control that repeats the failed request even when URL parameters
      have not changed.
- [ ] **5.2** Verify Previous/Next disable correctly at page boundaries per
      API metadata.
- [ ] **5.3** Regression-check the untouched flows: job detail, routed item
      add/edit (payloads byte-identical to `docs/job-workflow-baseline.md`),
      bottom-nav active states, brand colour, single More control.
- [ ] **5.4** Run `php -l` on any PHP files changed since Phase 1, plus
      `npm run build`, `npx tsc -p tsconfig.spec.json --noEmit`
      (document the known baseline `AppComponent.title` exit-2), and
      `git diff --check`.
- [ ] **5.5** Playwright verification of the full matrix: search, every status
      slug (`not-started`, `in-progress`, `completed`, `complete`, `terminated`,
      `stuck`, `paused`), pagination boundaries, refresh/back restore,
      debounce/cancel, failure + Retry (request re-issued with unchanged URL),
      empty states, and the HTTP 400 unknown-status path rendered as an error
      (not as "No jobs found").
- [ ] **5.6** Update `docs/admin-ui-patterns.md` and
      `docs/job-workflow-baseline.md` for the server-driven list, including
      the error contract and the canonical status set.

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
├── database/
│   └── migrations/
│       └── 20260904_admin_jobs_query_indexes.sql   # named indexes + rollback
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
      parameter, search, status, and boundary cases, including the error
      contract (400s, generic 500) and the canonical status set with the
      `Complete` alias.
- [ ] `get-jobs.php` and all job add/edit payload contracts are unchanged.
- [ ] `/store/admin/jobs` performs server-side pagination, search and status
      filtering with zero full-collection downloads; URL restores full state
      on refresh and back navigation.
- [ ] Debounced, cancelable search verified; pagination driven by API
      metadata; loading/empty/failure/Retry states present; Retry re-issues
      the request even with unchanged URL parameters.
- [ ] Schema changes shipped as a committed migration SQL with named indexes
      and rollback statements; every added index traces to a recorded
      `SHOW INDEX`/`EXPLAIN` result; `php -l` clean on all changed PHP files.
- [ ] `Database.php`, credentials, and secrets appear in no upload manifest,
      commit, diff, or log; totals quoted as the verified production total.
- [ ] `npm run build` passes; `tsc` spec failure is limited to the known
      `AppComponent.title` baseline; `git diff --check` clean.
- [ ] Playwright matrix (Phase 5.5) passes with zero console errors.
- [ ] Docs updated (patterns, baseline, error contract, status set); the
      security-hardening concern is recorded, not ignored.