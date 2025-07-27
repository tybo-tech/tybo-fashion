import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';
import { BaseProfileComponent } from '../BaseProfileComponent';
import { JobService } from 'src/services/job.service';
import { Job } from 'src/models/job.model';

@Component({
  selector: 'app-profile-orders',
  templateUrl: './profile-orders.component.html',
  styleUrls: ['./profile-orders.component.scss']
})
export class ProfileOrdersComponent extends BaseProfileComponent implements OnInit {
  jobs?:Job[];
  constructor(userService: UserService, router: Router, uxService: UxService, private jobService: JobService) {
    super(userService, router, uxService);
  }
  ngOnInit(): void {
    this.get_jobs();
  }
  get_jobs() {
    this.user && this.jobService.getJobs(this.user.UserId,'CreateUserId').subscribe((response) => {
      console.log(response);
      if(response && response.length){
        
        this.jobs = response;
        this.jobs.map(j=> j.images = this.images(j));
        this.jobs.map(j=> j.deliveryDate = this.deliveryDate(j));
      }
    });
  }
  deliveryDate(job:Job){
    //Add 7 days to the job created date
    const date = new Date(job.CreateDate || '');
    date.setDate(date.getDate() + 7);
    return date;
  }
  images(job:Job){
    return job.JobItems?.map(x=>x.FeaturedImageUrl) || []
  }
}
