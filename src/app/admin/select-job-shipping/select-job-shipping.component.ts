import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-select-job-shipping',
  templateUrl: './select-job-shipping.component.html',
  styleUrls: ['./select-job-shipping.component.scss'],
})
export class SelectJobShippingComponent {
  @Input() job?: Job;
  @Output() jobUpdated = new EventEmitter<Job>();
  @Output() onClose = new EventEmitter<any>();
  shippingOptions = Constants.ShippingOptions
  constructor(private jobService: JobService) {}
  update_delivery() {
    switch (this.job?.Shipping) {
      case 'collection':
        this.jobService.update_delivery(this.job, 'collection', 0);
        break;
      case 'delivery':
        this.jobService.update_delivery(this.job, 'delivery', Constants.DeliveryFee);
        break;
      default:
        break;
    }
    this.jobUpdated.emit(this.job);
  }
}
