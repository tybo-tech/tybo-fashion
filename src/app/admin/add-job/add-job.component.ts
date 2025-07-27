import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Customer } from 'src/models/Customer';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';

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
  constructor(
    private jobService: JobService,
    private router: Router,
    private userService: UserService
  ) {
    const companyId = this.user?.CompanyId || '';
    const userId = this.user?.UserId || '';
    this.job = this.jobService.initJob(companyId, userId);
  }

  ngOnInit(): void {}
  selected(customer: Customer) {
    this.job.CustomerId = customer.CustomerId;
    this.jobService.add(this.job).subscribe((data) => {
      if(data && data.JobId){
        ///store/admin/job/:id
        this.router.navigate(['/store/admin/job', data.JobId]);
      }
    });
  }
}
