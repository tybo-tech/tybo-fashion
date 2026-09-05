import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subject, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { JobListItem } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnInit, OnDestroy {
  show_add = false;
  // Customer handed back by the New Customer wizard (?return=picker flow);
  // passed to Add Job as a preselection requiring explicit confirmation.
  preselectedCustomer?: { CustomerId: string; CustomerName: string; PhoneNumber: string; Email: string };
  // Text currently shown in the search box (updates instantly as the user types)
  query = '';
  // Canonical status slug in the URL ('' = all statuses)
  selectedStatus = '';
  loading = true;
  error: string | null = null;
  user = this.userService.getUser;
  jobs: JobListItem[] = [];
  pagination = {
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  // Last request parameters — Retry re-issues exactly these
  private lastRequest?: { companyId: string; page: number; q: string; status: string; sort: string };

  // The Jobs screen orders by job number (numeric-aware, server side).
  private readonly jobSort = 'jobno';

  // Search debounce lives inside <app-search-input>. An external `value`
  // change (URL restore, Reset) cancels its pending timer, so a stale
  // search can never overwrite the URL after the user has moved on.
  //
  // Request driver: every URL change emits here; switchMap cancels
  // obsolete requests so an older response can never replace a newer one.
  private request$ = new Subject<{ companyId: string; page: number; q: string; status: string; sort: string }>();
  private requestSub?: Subscription;
  private userSub?: Subscription;

  pageSize = 20;

  constructor(
    private jobService: JobService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    if (!this.user) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.userSub = this.userService.userObservable?.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/sign-in']);
        return;
      }
    });
  }

  ngOnInit(): void {
    // Sprint 4 return flow: the New Customer wizard navigates here with
    // navigation state { addJobFor } after creating a customer from the
    // Add Job picker. Reopen Add Job with that customer preselected — the
    // preselected flow requires an explicit confirmation click, so no job
    // is ever created without user intent.
    const returnState = history.state?.addJobFor as
      | { CustomerId: string; CustomerName: string; PhoneNumber: string; Email: string }
      | undefined;
    if (returnState?.CustomerId) {
      this.preselectedCustomer = returnState;
      this.show_add = true;
      // Consume the one-shot state: without this, a later New Job click on
      // the same history entry would re-open the preselected dialog.
      this.location.replaceState(this.router.url);
    }

    // Wire the request pipeline FIRST: queryParamMap emits its current value
    // synchronously on subscribe, so a Subject subscriber must already exist
    // or that first emission is lost.
    //
    // One in-flight request at a time; a newer emission cancels the older
    // HTTP request and its response can never overwrite newer state.
    //
    // HTTP errors are caught INSIDE switchMap: an erroring inner observable
    // would otherwise terminate the whole stream, making Retry (a new
    // emission on request$) a silent no-op. With the inner catchError the
    // stream survives every failure and Retry re-issues the request.
    this.requestSub = this.request$
      .pipe(
        switchMap((req) => {
          this.lastRequest = req;
          this.loading = true;
          this.error = null;
          return this.jobService
            .getAdminJobsPage(
              req.companyId,
              req.page,
              this.pageSize,
              req.q,
              req.status,
              req.sort
            )
            .pipe(
              catchError((err) => {
                this.loading = false;
                // HTTP 400/500 is a failure, never "No jobs found".
                this.error =
                  err?.status === 400
                    ? 'This request is not valid. Please adjust the filters.'
                    : 'Failed to load jobs. Please try again.';
                return EMPTY;
              })
            );
        })
      )
      .subscribe({
        next: (res) => {
          this.jobs = res?.items || [];
          if (res?.pagination) {
            this.pagination = res.pagination;
          }
          this.loading = false;
          this.error = null;
        },
      });

    // Canonical interactive filter URL: /store/admin/jobs?page=&q=&status=
    // Legacy /store/admin/jobs/:status slugs are redirected at the router
    // level (Sprint 5 §1): known slugs via JobsStatusRedirectComponent,
    // everything else falls back to /jobs. The status param can no longer
    // appear here.

    // URL is the single source of truth: every query-param change drives one
    // request through switchMap. Restored values flow into
    // <app-search-input> via `query`, whose external-change handling cancels
    // any pending debounce so a stale search can never overwrite the
    // restored URL.
    this.route.queryParamMap.subscribe((params) => {
      this.selectedStatus = params.get('status') || '';
      // Show the restored query instantly (no debounce on restore).
      this.query = params.get('q') || '';

      // The URL carries the page. Search/status handlers strip `page` from
      // the URL when filters change, so a fresh URL with ?page=2&q=…&status=…
      // restores exactly that page (refresh/back), while in-app filter
      // changes reset to page 1 by removing `page`.
      this.requestNext(Math.max(1, parseInt(params.get('page') || '1', 10) || 1));
    });
  }

  ngOnDestroy(): void {
    this.requestSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  // Queue the next request; emissions replace each other via switchMap.
  private requestNext(page: number): void {
    const user = this.userService.getUser;
    if (!user?.CompanyId) return;
    const q = (this.query || '').trim();
    const req = { companyId: user.CompanyId, page, q, status: this.selectedStatus, sort: this.jobSort };
    this.request$.next(req);
  }

  // Debounced by <app-search-input>; the URL (and thus the request)
  // updates only after the input settles.
  onSearch(value: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: value || null, page: null },
      queryParamsHandling: 'merge',
    });
  }

  onStatusChange() {
    // Dropdown holds slugs; write straight to the URL (resets to page 1 via
    // the queryParamMap handler because the status value changes).
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: this.selectedStatus || null, page: null },
      queryParamsHandling: 'merge',
    });
  }

  resetFilters(): void {
    this.query = '';
    this.selectedStatus = '';
    // The shared search cancels its pending debounce when `value` changes
    // externally. Clean canonical URL: no page, q or status params.
    this.router.navigate(['/store/admin/jobs']);
  }

  prevPage() {
    if (this.pagination.hasPrevious) this.goToPage(this.pagination.page - 1);
  }

  nextPage() {
    if (this.pagination.hasNext) this.goToPage(this.pagination.page + 1);
  }

  private goToPage(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? String(page) : null },
      queryParamsHandling: 'merge',
    });
  }

  retry(): void {
    const req = this.lastRequest;
    if (!req) return;
    // Explicit user action: re-issue the identical request even though the
    // URL has not changed.
    this.request$.next({ ...req });
  }

  get pageStart(): number {
    if (!this.jobs.length) return 0;
    return (this.pagination.page - 1) * this.pagination.pageSize + 1;
  }

  get pageEnd(): number {
    if (!this.jobs.length) return 0;
    return (this.pagination.page - 1) * this.pagination.pageSize + this.jobs.length;
  }

  get totalPages(): number {
    return Math.max(1, this.pagination.totalPages);
  }

  get currentPage(): number {
    return this.pagination.page;
  }

  // Empty-state classification (see template):
  // - no jobs at all, no filters -> "Create your first job"
  // - no jobs at all, filters active -> filtered-empty state
  // - jobs exist but the current page is empty (page beyond totalPages)
  //   -> "No jobs on this page" with a safe return to page 1 / Previous
  get hasNoJobsAtAll(): boolean {
    return this.pagination.totalItems === 0;
  }

  get hasActiveFilters(): boolean {
    return !!(this.query || this.selectedStatus);
  }

  get isPageBeyondEnd(): boolean {
    return this.pagination.totalItems > 0 && this.jobs.length === 0;
  }

  get emptyStateTitle(): string {
    if (this.isPageBeyondEnd) return 'No jobs on this page';
    return 'No jobs found';
  }

  get emptyStateHint(): string {
    if (this.isPageBeyondEnd) {
      return 'This page is beyond the last page of results.';
    }
    if (this.hasActiveFilters) {
      return 'Try adjusting search or reset filters.';
    }
    return 'Create your first job to get started.';
  }

  get emptyStateActionLabel(): string {
    if (this.isPageBeyondEnd) return 'Go to page 1';
    if (this.hasActiveFilters) return 'Reset filters';
    return 'New Job';
  }

  emptyStateAction(): void {
    if (this.isPageBeyondEnd) {
      this.goToPage(1);
    } else if (this.hasActiveFilters) {
      this.resetFilters();
    } else {
      this.openAddJob();
    }
  }

  // A normal New Job click must never inherit the wizard's preselection:
  // clear any leftover preselected customer before opening the picker.
  openAddJob(): void {
    this.preselectedCustomer = undefined;
    this.show_add = true;
  }

  closeAddJob(): void {
    this.show_add = false;
    // Clear the preselection on close so the next New Job opens the normal
    // picker instead of staying locked to the wizard's customer.
    this.preselectedCustomer = undefined;
  }

  trackByJobId(_index: number, job: JobListItem): string {
    return job.JobId;
  }
}