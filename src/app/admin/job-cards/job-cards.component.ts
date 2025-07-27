import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JobCard, JobItem } from 'src/models/job-item.model';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-job-cards',
  templateUrl: './job-cards.component.html',
  styleUrls: ['./job-cards.component.scss'],
})
export class JobCardsComponent {
  show_add = false;
  query = '';
  jobItemId = '';
  user = this.userService.getUser;
  jobCards?: JobCard[];
  jobCard?: JobCard;
  allJobCards: JobCard[] | undefined;
  constructor(
    private jobService: JobService,
    private userService: UserService,
    private router: Router
  ) {
    if (!this.user) {
      this.router.navigate(['/sign-in']);
    }
  this.get()
  }
  get(){
    this.user &&
    this.jobService.getJobItemsByStatus(1).subscribe((data) => {
      this.jobCards = data || [];
      this.allJobCards = data || [];
    });
  }
  filter() {
    if (!this.query) {
      this.jobCards = this.allJobCards;
      return;
    }
    this.query = this.query.toLowerCase();
    this.jobCards = this.allJobCards?.filter((jobItem) => {
      return (
        jobItem.JobNo?.toLowerCase()?.includes(this.query) ||
        jobItem.ItemName?.toLowerCase().includes(this.query) ||
        jobItem.CustomerName?.toLowerCase().includes(this.query)
      );
    });
  }
}
