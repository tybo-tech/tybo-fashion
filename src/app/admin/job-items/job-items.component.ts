import { Component, Input, OnInit } from '@angular/core';
import { JobItem } from 'src/models/job-item.model';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { JobService } from 'src/services/job.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-job-items',
  templateUrl: './job-items.component.html',
  styleUrls: ['./job-items.component.scss'],
})
export class JobItemsComponent implements OnInit {
  @Input() job?: Job;
  addMode = false;
  jobItem?: JobItem;
  @Input({required: true}) user!: User;
  constructor(private jobService: JobService, private uxService: UxService) {}
  ngOnInit(): void {
    if (this.job)
      this.jobItem = this.jobService.initJobItem(
        this.job.JobId,
        this.job.CompanyId,
        this.job.CreateUserId
      );
  }
  onJobItemUpdated(item: JobItem) {
    console.log(item);
    this.jobService.addJobItem(item).subscribe((data) => {
      if (data && data.CompanyId && this.job) {
        this.job?.JobItems?.push(data);
        this.addMode = false;
        this.job.TotalCost = this.jobService.cart_total(this.job);
        this.job.Metadata.paidAmount = this.jobService.calculatePaidAmount(this.job);
        this.job.Metadata.dueAmount = this.jobService.calculateDueAmount(this.job);
        this.jobService.update(this.job).subscribe();
        this.uxService.show_toast('Job item created', 'success', [
          'bg-success',
        ]);
      }
    });
  }
}
