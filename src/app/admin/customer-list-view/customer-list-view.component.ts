import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Customer, initCustomer } from 'src/models/Customer';
import { CustomerService } from 'src/services/customer.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-customer-list-view',
  templateUrl: './customer-list-view.component.html',
  styleUrls: ['./customer-list-view.component.scss'],
})
export class CustomerListViewComponent {
  @Output() onSelect = new EventEmitter<Customer>();
  @Output() onAdd = new EventEmitter<Customer>();
  newCustomer?: Customer;
  all_customers?: Customer[];
  customers?: Customer[];
  user = this.userService.getUser;
  query = '';
  show_add = false;

  constructor(
    private customerService: CustomerService,
    private userService: UserService,
    private router: Router
  ) {
    this.load_customers();
  }

  initCustomer() {
    this.newCustomer = initCustomer();
    this.newCustomer.CompanyId = this.user?.CompanyId || '';
  }

  load_customers() {
    this.user &&
      this.customerService
        .getCustomers(this.user.CompanyId)
        .subscribe((data) => {
          this.customers = data;
          this.all_customers = data;
        });
  }

  filter() {
    if (!this.query) {
      this.customers = this.all_customers;
      return;
    }
    // Enhanced filter with more fields
    this.customers = this.all_customers?.filter((customer) => {
      const searchTerm = this.query.toLowerCase();
      return (
        customer.Name?.toLowerCase().includes(searchTerm) ||
        customer.Surname?.toLowerCase().includes(searchTerm) ||
        customer.FullName?.toLowerCase().includes(searchTerm) ||
        customer.PhoneNumber?.includes(this.query) ||
        customer.Email?.toLowerCase().includes(searchTerm) ||
        customer.CustomerStatus?.toLowerCase().includes(searchTerm) ||
        customer.CustomerPriority?.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Helper methods for template
  getActiveCustomers(): number {
    return this.customers?.filter(c => c.ActiveJobs && c.ActiveJobs > 0).length || 0;
  }

  getOutstandingCustomers(): number {
    return this.customers?.filter(c => c.OutstandingBalance && c.OutstandingBalance > 0).length || 0;
  }

  getTotalOutstanding(): number {
    return this.customers?.reduce((total, c) => total + (c.OutstandingBalance || 0), 0) || 0;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  }

  callCustomer(customer: Customer, event: Event) {
    event.stopPropagation();
    if (customer.PhoneNumber) {
      window.open(`tel:${customer.PhoneNumber}`, '_self');
    }
  }

  emailCustomer(customer: Customer, event: Event) {
    event.stopPropagation();
    if (customer.Email && customer.Email !== 'Na') {
      window.open(`mailto:${customer.Email}`, '_self');
    }
  }
}
