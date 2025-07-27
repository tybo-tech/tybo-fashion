import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';

@Component({
  selector: 'app-job-payments',
  templateUrl: './job-payments.component.html',
  styleUrls: ['./job-payments.component.scss'],
})
export class JobPaymentsComponent implements OnInit {
  @Input() job?: Job;
  @Output() jobUpdated = new EventEmitter<Job>();
  @Output() onClose = new EventEmitter<any>();
  shippingOptions = Constants.ShippingOptions;
  amount: any = '';
  show_add = false;
  constructor(private jobService: JobService) {}
  ngOnInit(): void {
    if (this.job && !this.job.Metadata.payments) {
      this.job.Metadata.payments = [];
      this.add();
    }
    if (this.job && !this.job.Metadata.paidAmount)
      this.job.Metadata.paidAmount = 0;
  }
  delete(index: number) {
    this.job && this.job.Metadata.payments?.splice(index, 1);
  }
  add() {
    this.show_add = true;
    this.amount = '';
  }
  done_add() {
    this.show_add = false;
    if (this.amount && this.job) {
      this.job.Metadata.payments?.push({
        Amount: this.amount,
        Date: new Date() + '',
        Type: 'Manual',
      });
      this.amount = '';
      this.job.Metadata.paidAmount = this.jobService.calculatePaidAmount(
        this.job
      );
      this.job.Metadata.dueAmount = this.jobService.calculateDueAmount(this.job); 
      this.jobUpdated.emit(this.job);
    }
  }
  onDone() {
    if (this.job) {
      this.jobUpdated.emit(this.job);
    }
  }
}
