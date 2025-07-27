import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Customer } from 'src/models/Customer';
import { CustomerService } from 'src/services/customer.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent {
  customer?: Customer
  id = '';
  constructor(private cus: CustomerService,     private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.id = r['id'];
      this.get();
    });
  }
  get() {
   if(!this.id) return;
    this.cus.getCustomer(this.id).subscribe((data) => {
      this.customer = data;
    });
  }

}
