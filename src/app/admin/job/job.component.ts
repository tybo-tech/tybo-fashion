import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/constants/Constants';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
})
export class JobComponent {
  id = '';
  backTo = '';
  tempStatus = '';
  statuses = [
    'Not started',
    'In Progress',
    'Completed',
    'Stuck',
    'Terminated',
    'Paused',
  ];
  job?: Job;
  showShipping = false;
  show_customer = false;
  show_capture_payment = false;
  user?: User;
  constructor(
    private jobService: JobService,
    private userService: UserService,
    private uxService: UxService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.id = r['id'];
      this.backTo = r['backTo'] || 'jobs';
      this.get();
    });

    this.userService.userObservable?.subscribe((user) => {
      this.user = user;
    });
  }
  get() {
    this.uxService.load(true);
    this.jobService.getjob(this.id).subscribe((data) => {
      this.job = data;
      this.tempStatus = this.job.Status;
      if (!this.job.Metadata) {
        this.job.Metadata = {
          InvoiceNo: this.job.JobNo.replace('JOB', 'INV'),
          Source: '',
        };
        console.log(this.job.Metadata);
        this.jobService.update(this.job).subscribe();
      }
      if (!this.job.Metadata.Special_instructions)
        this.job.Metadata.Special_instructions = [];
      this.jobService.check_total(this.job);
      this.uxService.load(false);
    });
  }
  updateJob() {
    this.uxService.load(true);
    this.job &&
      this.jobService.update(this.job).subscribe((data) => {
        this.uxService.load(false);
        this.uxService.show_toast('Job updated successfully', 'Success', [
          'bg-success',
        ]);
      });
  }
  get invoice() {
    return Constants.PrintInvoice + this.job?.JobId;
  }
}
