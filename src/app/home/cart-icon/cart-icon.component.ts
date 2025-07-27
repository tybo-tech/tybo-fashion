import { Component } from '@angular/core';
import { JobService } from 'src/services/job.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-cart-icon',
  templateUrl: './cart-icon.component.html',
  styleUrls: ['./cart-icon.component.scss'],
})
export class CartIconComponent {
  cartCount = 0;
  constructor(public uxService: UxService, private jobService: JobService) {}

  getCartCount() {
    this.jobService.$job.subscribe((job) => {
      if (job) {
        this.cartCount = this.jobService.cart_count(job);
      } else {
        this.cartCount = 0;
      }
    });
  }
}
