import { Component } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { JobItem } from 'src/models/job-item.model';
import { Job } from 'src/models/job.model';
import { UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-delivery-method',
  templateUrl: './delivery-method.component.html',
  styleUrls: ['./delivery-method.component.scss'],
})
export class DeliveryMethodComponent {
  UX_MODALS = UX_MODALS;
  
  job?: Job;
  constructor(private jobService: JobService, private uxService: UxService) {
    jobService.$job.subscribe((job) => {
      if (job) this.job = job;
    });
  }
  continue_to_shipping() {
    if (!this.job?.Shipping) {
      this.uxService.show_toast('Please select a delivery method', 'error');
      return;
    }
    this.uxService.show_modal(UX_MODALS.customer_contact);
  }
  update_delivery() {
    //collection , delivery
    switch (this.job?.Shipping) {
      case 'collection':
        this.jobService.update_delivery(this.job, 'collection', 0);
        break;
      case 'delivery':
        this.jobService.update_delivery(
          this.job,
          'delivery',
          Constants.DeliveryFee
        );
        break;
      default:
        break;
    }
  }
  open(modal: string) {
    this.uxService.show_modal(modal);
  }
}
