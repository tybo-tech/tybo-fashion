import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from 'src/models/Customer';
import { CustomerService } from 'src/services/customer.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent {
  customer?: Customer;
  id = '';
  activeTab: 'overview' | 'jobs' | 'measurements' | 'activity' = 'overview';
  showEditForm = false;

  constructor(
    private cus: CustomerService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private uxService: UxService
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.id = r['id'];
      this.get();
    });
  }

  get() {
    if (!this.id) return;
    this.cus.getCustomer(this.id).subscribe((data) => {
      this.customer = data;
    });
  }

  // Helper Methods
  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  }

  // Action Methods
  createJob() {
    if (this.customer) {
      // Navigate to job creation with customer pre-selected
      this.router.navigate(['/store/admin/jobs/new'], {
        queryParams: { customerId: this.customer.CustomerId }
      });
    }
  }

  editCustomer() {
    this.showEditForm = true;
  }

  editMeasurements() {
    this.showEditForm = true;
    // Could be enhanced to focus on measurements section
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
  }
}
