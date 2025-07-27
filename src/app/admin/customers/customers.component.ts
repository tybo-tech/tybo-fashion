import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Customer, initCustomer } from 'src/models/Customer';
import { CustomerService } from 'src/services/customer.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent {
  constructor(private router: Router) {}
  selected(event: Customer) {
    this.router.navigate(['/store/admin/customer', event.CustomerId]);
  }
}
