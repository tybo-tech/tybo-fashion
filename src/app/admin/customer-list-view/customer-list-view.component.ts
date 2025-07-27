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
    // Filter customers by name & Phone number
    this.customers = this.all_customers?.filter((customer) => {
      return (
        customer.Name.toLowerCase().includes(this.query.toLowerCase()) ||
        customer.PhoneNumber?.includes(this.query)
      );
    });
  }
}
