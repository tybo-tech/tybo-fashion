import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Job } from 'src/models/job.model';

@Component({
  selector: 'app-admin-job-total',
  templateUrl: './admin-job-total.component.html',
  styleUrls: ['./admin-job-total.component.scss']
})
export class AdminJobTotalComponent {
  @Input() job?: Job;
  @Output() showShipping = new EventEmitter<any>();
  @Output() showPayments = new EventEmitter<any>();
}
