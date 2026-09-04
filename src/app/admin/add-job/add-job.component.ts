import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CustomerListItem } from 'src/models/Customer';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-add-job',
  templateUrl: './add-job.component.html',
  styleUrls: ['./add-job.component.scss'],
})
export class AddJobComponent implements OnInit {
  job: Job;
  user = this.userService.getUser;
  @Output() jobAdded = new EventEmitter<Job>();
  @Output() onClose = new EventEmitter<any>();

  // When a customer is preselected (e.g. from the Customer Detail Create Job
  // action), the picker is skipped and an intentional confirmation is shown
  // before the job is created.
  @Input() preselectedCustomer?: CustomerListItem;

  // Busy state: true from the first confirmation until the job request
  // settles. Disables all controls and prevents duplicate job creation.
  creatingJob = false;

  constructor(
    private jobService: JobService,
    private router: Router,
    private userService: UserService,
    private uxService: UxService
  ) {
    const companyId = this.user?.CompanyId || '';
    const userId = this.user?.UserId || '';
    this.job = this.jobService.initJob(companyId, userId);
  }

  ngOnInit(): void {}

  selected(customer: CustomerListItem) {
    // One job request per selection: ignore any further clicks while one is
    // in flight.
    if (this.creatingJob) return;
    this.creatingJob = true;
    this.job.CustomerId = customer.CustomerId;
    this.jobService
      .add(this.job)
      .pipe(
        finalize(() => {
          // Always release the busy state, whether the request succeeds,
          // fails at HTTP/network level, or is cancelled. Without this a
          // failed creation would leave the picker permanently disabled.
          this.creatingJob = false;
        })
      )
      .subscribe({
        next: (data) => {
          if (data && data.JobId) {
            this.router.navigate(['/store/admin/job', data.JobId]);
          } else {
            this.uxService.show_toast('Failed to create job', 'Error', ['bg-danger']);
          }
        },
        error: () => {
          this.uxService.show_toast('Failed to create job', 'Error', ['bg-danger']);
        },
      });
  }

  close() {
    // Prevent closing while a job creation is in flight so a close/reopen
    // cannot spawn a second request.
    if (this.creatingJob) return;
    this.onClose.emit();
  }
}
