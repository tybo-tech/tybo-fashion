import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subject, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Customer, CustomerDetailAnalytics } from 'src/models/Customer';
import { CustomerService } from 'src/services/customer.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent implements OnDestroy {
  customer?: Customer;
  analytics?: CustomerDetailAnalytics;
  id = '';
  loading = true;
  error: string | null = null;
  notFound = false;
  showEditForm = false;
  showAddJob = false;

  // Last request parameters — Retry re-issues exactly these
  private lastRequest?: { companyId: string; customerId: string };
  private request$ = new Subject<{ companyId: string; customerId: string }>();
  private requestSub?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private cus: CustomerService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private uxService: UxService
  ) {
    this.requestSub = this.request$
      .pipe(
        switchMap((req) => {
          this.lastRequest = req;
          this.loading = true;
          this.error = null;
          this.notFound = false;
          return this.cus.getAdminCustomerDetail(req.companyId, req.customerId).pipe(
            catchError((err) => {
              this.loading = false;
              if (err?.status === 404) {
                this.notFound = true;
              } else {
                this.error =
                  err?.status === 400
                    ? 'This request is not valid.'
                    : 'Failed to load this customer. Please try again.';
              }
              return EMPTY;
            })
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.customer = res?.customer;
          this.analytics = res?.analytics;
          this.loading = false;
          this.error = null;
          this.notFound = false;
        },
      });

    this.activatedRoute.params.subscribe((r) => {
      this.id = r['id'];
      this.get();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.requestSub?.unsubscribe();
  }

  get() {
    if (!this.id) return;
    const user = this.userService.getUser;
    if (!user?.CompanyId) {
      // No session/company: never spin forever. Route through the sign-in flow.
      this.loading = false;
      this.router.navigate(['/home/sign-in']);
      return;
    }
    this.request$.next({ companyId: user.CompanyId, customerId: this.id });
  }

  retry(): void {
    const req = this.lastRequest;
    if (!req) return;
    this.request$.next({ ...req });
  }

  goToCustomers(): void {
    this.router.navigate(['/store/admin/customers']);
  }

  // Action Methods
  createJob() {
    if (this.customer) {
      // Open the Add Job modal with this customer preselected. The modal
      // requires an intentional confirmation before creating the job.
      this.showAddJob = true;
    }
  }

  onAddJobClose() {
    this.showAddJob = false;
  }

  editCustomer() {
    this.showEditForm = true;
  }

  editMeasurements() {
    this.showEditForm = true;
  }

  callCustomer() {
    if (this.customer?.PhoneNumber) {
      window.open(`tel:${this.customer.PhoneNumber}`, '_self');
    }
  }

  emailCustomer() {
    if (this.customer?.Email && this.customer.Email !== 'Na') {
      window.open(`mailto:${this.customer.Email}`, '_self');
    }
  }

  onCustomerUpdate(updatedCustomer: Customer) {
    this.customer = updatedCustomer;
    this.showEditForm = false;
    this.uxService.show_toast('Customer updated successfully', 'Success');
    // Refresh the detail read model after a successful update.
    this.get();
  }

  // Helper methods
  get hasValidPhone(): boolean {
    return !!this.customer?.PhoneNumber;
  }

  get hasValidEmail(): boolean {
    return !!this.customer?.Email && this.customer.Email !== 'Na';
  }

  get hasAddress(): boolean {
    const c = this.customer;
    if (!c) return false;
    return !!(
      c.AddressLineHome ||
      c.AddressLine2 ||
      c.Suburb ||
      c.City ||
      c.PostalCode
    );
  }

  get hasProfileCompleteness(): boolean {
    return this.analytics?.ProfileCompleteness != null;
  }

  get hasLastActivity(): boolean {
    return !!this.analytics?.LastActivityDate;
  }

  get hasPaymentRate(): boolean {
    return this.analytics?.PaymentCompletionRate != null;
  }

  get hasMeasurements(): boolean {
    return !!this.customer?.Measurements?.length;
  }

  get visibleMeasurements() {
    return (this.customer?.Measurements || []).filter(
      (m) => m.Name && m.Name.trim() && m.Value !== '' && m.Value != null
    );
  }
}
