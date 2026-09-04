import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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

  // Busy state: true from the first selection until the job request settles.
  // Disables all customer rows and prevents duplicate job creation.
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
}
