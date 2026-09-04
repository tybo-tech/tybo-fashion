import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { EMPTY, Subject, Subscription, merge, timer } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { Customer, CustomerListItem, initCustomer } from 'src/models/Customer';
import { CustomerService } from 'src/services/customer.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-customer-list-view',
  templateUrl: './customer-list-view.component.html',
  styleUrls: ['./customer-list-view.component.scss'],
})
export class CustomerListViewComponent implements OnDestroy {
  @Output() onSelect = new EventEmitter<CustomerListItem>();
  @Output() onAdd = new EventEmitter<CustomerListItem>();
  // When true (a job is being created), all selection rows are disabled.
  @Input() busy = false;
  newCustomer?: Customer;
  user = this.userService.getUser;
  query = '';
  show_add = false;
  loading = true;
  error: string | null = null;

  customers: CustomerListItem[] = [];
  pagination = {
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  // Last request parameters — Retry re-issues exactly these
  private lastRequest?: { companyId: string; page: number; q: string };

  // Search debounce: ngModel pushes here; the request updates only after
  // ~300ms of settled input. A pending debounce is cancelled whenever the
  // picker resets or is destroyed.
  private searchInput$ = new Subject<string>();
  private cancelSearch$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  // Request driver: every page/search change emits here; switchMap cancels
  // obsolete requests so an older response can never replace a newer one.
  private request$ = new Subject<{ companyId: string; page: number; q: string }>();
  private requestSub?: Subscription;
  private searchSub?: Subscription;

  pageSize = 20;

  constructor(
    private customerService: CustomerService,
    private userService: UserService
  ) {
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

    // Debounced search: request updates only after the input settles.
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
        this.query = value;
        this.requestNext(1);
      });

    this.load_customers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.requestSub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  initCustomer() {
    this.newCustomer = initCustomer();
    this.newCustomer.CompanyId = this.user?.CompanyId || '';
  }

  load_customers() {
    this.requestNext(1);
  }

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

  resetSearch() {
    this.query = '';
    this.cancelSearch$.next();
    this.requestNext(1);
  }

  prevPage() {
    if (this.pagination.hasPrevious) this.requestNext(this.pagination.page - 1);
  }

  nextPage() {
    if (this.pagination.hasNext) this.requestNext(this.pagination.page + 1);
  }

  retry(): void {
    const req = this.lastRequest;
    if (!req) return;
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
    return 'No customers in this company yet.';
  }

  get emptyStateActionLabel(): string {
    if (this.isPageBeyondEnd) return 'Go to page 1';
    if (this.hasActiveSearch) return 'Clear search';
    return 'New Customer';
  }

  emptyStateAction(): void {
    if (this.isPageBeyondEnd) {
      this.requestNext(1);
    } else if (this.hasActiveSearch) {
      this.resetSearch();
    } else {
      this.show_add = true;
      this.initCustomer();
    }
  }

  onCustomerSaved(saved: Customer): void {
    this.show_add = false;
    this.newCustomer = undefined;
    // Continue directly into the existing job-creation behavior.
    this.onAdd.emit({
      CustomerId: saved.CustomerId,
      CustomerName: saved.FullName || saved.Name,
      PhoneNumber: saved.PhoneNumber,
      Email: saved.Email,
    });
  }

  trackByCustomerId(_index: number, customer: CustomerListItem): string {
    return customer.CustomerId;
  }
}
