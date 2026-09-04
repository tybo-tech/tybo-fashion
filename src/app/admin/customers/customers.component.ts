import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subject, Subscription, merge, timer } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { Customer, CustomerListItem, initCustomer } from 'src/models/Customer';
import { CustomerService } from 'src/services/customer.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit, OnDestroy {
  show_add = false;
  // Text currently shown in the search box (updates instantly as the user types)
  query = '';
  loading = true;
  error: string | null = null;
  user = this.userService.getUser;
  customers: CustomerListItem[] = [];
  pagination = {
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  // New Customer form state
  newCustomer?: Customer;

  // Last request parameters — Retry re-issues exactly these
  private lastRequest?: { companyId: string; page: number; q: string };

  // Search debounce: ngModel pushes here; the URL (and thus the request)
  // updates only after ~300ms of settled input. A pending debounce is
  // cancelled (takeUntil) whenever the URL state changes (Reset, Back/Forward)
  // or the component is destroyed, so a stale search can never overwrite the
  // URL after the user has already navigated away.
  private searchInput$ = new Subject<string>();
  private cancelSearch$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  // Request driver: every URL change emits here; switchMap cancels obsolete
  // requests so an older response can never replace a newer one.
  private request$ = new Subject<{ companyId: string; page: number; q: string }>();
  private requestSub?: Subscription;
  private searchSub?: Subscription;
  private userSub?: Subscription;

  pageSize = 20;

  constructor(
    private customerService: CustomerService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
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
          return this.customerService
            .getAdminCustomersPage(req.companyId, req.page, this.pageSize, req.q)
            .pipe(
              catchError((err) => {
                this.loading = false;
                // HTTP 400/500 is a failure, never "No customers found".
                this.error =
                  err?.status === 400
                    ? 'This request is not valid. Please adjust the search.'
                    : 'Failed to load customers. Please try again.';
                return EMPTY;
              })
            );
        })
      )
      .subscribe({
        next: (res) => {
          this.customers = res?.items || [];
          if (res?.pagination) {
            this.pagination = res.pagination;
          }
          this.loading = false;
          this.error = null;
        },
      });

    // URL is the single source of truth: every query-param change drives one
    // request through switchMap. Any URL change also cancels a pending search
    // debounce so a stale search can never overwrite the restored URL.
    this.route.queryParamMap.subscribe((params) => {
      this.cancelSearch$.next();
      // Show the restored query instantly (no debounce on restore).
      this.query = params.get('q') || '';

      // The URL carries the page. Search handlers strip `page` from the URL
      // when the filter changes, so a fresh URL with ?page=2&q=… restores
      // exactly that page (refresh/back), while in-app filter changes reset
      // to page 1 by removing `page`.
      this.requestNext(Math.max(1, parseInt(params.get('page') || '1', 10) || 1));
    });

    // Debounced search: URL updates only after the input settles. No
    // distinctUntilChanged here — the URL cycle can legitimately repeat a
    // query (type → reset → type the same text again), and debounceTime
    // already collapses rapid typing into one emission.
    //
    // Cancellation: a cancel signal switches the stream to EMPTY, which
    // aborts the pending debounce timer without killing the stream, so a
    // stale search can never overwrite the URL after Reset or Back/Forward.
    this.searchSub = merge(
      this.searchInput$.pipe(map((value) => ({ kind: 'search' as const, value }))),
      this.cancelSearch$.pipe(map(() => ({ kind: 'cancel' as const, value: '' })))
    )
      .pipe(
        switchMap((evt) =>
          evt.kind === 'cancel'
            ? EMPTY
            : timer(300).pipe(map(() => evt.value))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { q: value || null, page: null },
          queryParamsHandling: 'merge',
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.requestSub?.unsubscribe();
    this.searchSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  // Queue the next request; emissions replace each other via switchMap.
  private requestNext(page: number): void {
    const user = this.userService.getUser;
    if (!user?.CompanyId) return;
    const q = (this.query || '').trim();
    const req = { companyId: user.CompanyId, page, q };
    this.request$.next(req);
  }

  onSearchInput() {
    this.searchInput$.next(this.query);
  }

  resetFilters(): void {
    this.query = '';
    // Cancel any pending search debounce explicitly: Reset navigates to the
    // clean canonical URL, which may be the SAME URL as the current one, so
    // queryParamMap would not emit and the URL-change cancel would not fire.
    this.cancelSearch$.next();
    // Clean canonical URL: no page or q params.
    this.router.navigate(['/store/admin/customers']);
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
    if (!this.customers.length) return 0;
    return (this.pagination.page - 1) * this.pagination.pageSize + 1;
  }

  get pageEnd(): number {
    if (!this.customers.length) return 0;
    return (this.pagination.page - 1) * this.pagination.pageSize + this.customers.length;
  }

  get totalPages(): number {
    return Math.max(1, this.pagination.totalPages);
  }

  get currentPage(): number {
    return this.pagination.page;
  }

  // Empty-state classification (see template):
  // - no customers at all, no search -> "Add your first customer"
  // - no customers at all, search active -> filtered-empty state
  // - customers exist but the current page is empty (page beyond totalPages)
  //   -> "No customers on this page" with a safe return to page 1 / Previous
  get hasNoCustomersAtAll(): boolean {
    return this.pagination.totalItems === 0;
  }

  get hasActiveSearch(): boolean {
    return !!this.query;
  }

  get isPageBeyondEnd(): boolean {
    return this.pagination.totalItems > 0 && this.customers.length === 0;
  }

  get emptyStateTitle(): string {
    if (this.isPageBeyondEnd) return 'No customers on this page';
    return 'No customers found';
  }

  get emptyStateHint(): string {
    if (this.isPageBeyondEnd) {
      return 'This page is beyond the last page of results.';
    }
    if (this.hasActiveSearch) {
      return 'Try adjusting your search.';
    }
    return 'Add your first customer to get started.';
  }

  get emptyStateActionLabel(): string {
    if (this.isPageBeyondEnd) return 'Go to page 1';
    if (this.hasActiveSearch) return 'Clear search';
    return 'New Customer';
  }

  emptyStateAction(): void {
    if (this.isPageBeyondEnd) {
      this.goToPage(1);
    } else if (this.hasActiveSearch) {
      this.resetFilters();
    } else {
      this.openNewCustomer();
    }
  }

  openNewCustomer(): void {
    this.newCustomer = initCustomer(this.user?.CompanyId || '');
    this.show_add = true;
  }

  onCustomerSaved(saved: Customer): void {
    this.show_add = false;
    this.newCustomer = undefined;
    // Refresh the active query/page safely: re-issue the current request so
    // the newly added customer is reflected without losing the user's place.
    const req = this.lastRequest;
    if (req) this.request$.next({ ...req });
  }

  trackByCustomerId(_index: number, customer: CustomerListItem): string {
    return customer.CustomerId;
  }
}
