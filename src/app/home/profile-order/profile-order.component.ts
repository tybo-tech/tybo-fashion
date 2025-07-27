import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';
import { BaseProfileComponent } from '../BaseProfileComponent';
import { Constants } from 'src/constants/Constants';

@Component({
  selector: 'app-profile-order',
  templateUrl: './profile-order.component.html',
  styleUrls: ['./profile-order.component.scss'],
})
export class ProfileOrderComponent
  extends BaseProfileComponent
  implements OnInit
{
  job?: Job;
  constructor(
    userService: UserService,
    router: Router,
    uxService: UxService,
    private jobService: JobService
  ) {
    super(userService, router, uxService);
  }
  ngOnInit(): void {
    this.get_jobs();
  }
  get_jobs() {
    const data_id = this.uxService?.ux?.data_id;
    data_id &&
      this.jobService.getjob(data_id).subscribe((response) => {
        if (response && response.JobId) {
          this.job = response;
          this.job.deliveryDate = this.deliveryDate(this.job);
        }
      });
  }
  deliveryDate(job:Job){
    //Add 7 days to the job created date
    const date = new Date(job.CreateDate || '');
    date.setDate(date.getDate() + 7);
    return date;
  }
  get invoice() {
    return Constants.PrintInvoice + this.job?.JobId;
  }
}
