import { Component } from '@angular/core';
import { JobItem } from 'src/models/job-item.model';
import { Job } from 'src/models/job.model';
import { ICheckoutNav, UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss'],
})
export class CartPageComponent {
  job?: Job;
  settings: ICheckoutNav = {
    back: '/',
    subTitle: 'Cart',
    title: 'Tybo Fashion',
  };
  constructor(private jobService: JobService, private uxService: UxService) {
    jobService.$job.subscribe((job) => {
      if (job) {
        this.job = job;
        this.settings.back = '/' + job.CompanyId;
      }
    });
  }
  delete_from_cart(jobItem: JobItem) {
    if (!this.job) return;
    this.jobService.delete_from_cart(this.job, jobItem);
  }
  update_qty(qty: number, item: JobItem) {
    if (!this.job) return;
    this.jobService.update_qty(this.job, qty, item);
  }
  checkout() {
    this.uxService.show_modal(UX_MODALS.delivery_method);
  }
  closeCart() {
    this.uxService.close_ux_modals();
  }
}
