import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss'],
})
export class OrderSummaryComponent {
  discountCode = '';
  @Input({ required: true }) job!: Job;
  @Input()showDiscountCode = false;
  get codeError(){
    return this.jobService.error;
  }
  constructor(private jobService : JobService) {}
  onDiscountCodeChange(){
    this.jobService.fetchDiscountCode(this.discountCode);
  }
}
