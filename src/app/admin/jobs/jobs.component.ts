import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent {
  show_add = false;
  query = '';
  user = this.userService.getUser;
  jobs?: Job[];
  all_jobs: Job[] | undefined;

  constructor(
    private jobService: JobService,
    private userService: UserService,
    private router: Router
  ) {
    if (!this.user) {
      this.router.navigate(['/sign-in']);
    }
    this.user &&
      this.jobService.getJobs(this.user.CompanyId).subscribe((data) => {
        this.jobs = data || [];
        this.all_jobs = data || [];
      });
  }

  filter() {
    if (!this.query) {
      this.jobs = this.all_jobs;
      return;
    }
    this.jobs = this.all_jobs?.filter((job) => {
      return (
        job.Customer?.Name.toLowerCase().includes(this.query.toLowerCase()) ||
        job.Customer?.PhoneNumber?.includes(this.query) ||
        job.JobNo?.includes(this.query)
      );
    });
  }

  isPastDue(dueDate: string | Date): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }
}
