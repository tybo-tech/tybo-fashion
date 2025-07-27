import { Component, Input } from '@angular/core';
import { JobItem } from 'src/models/job-item.model';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { JobService } from 'src/services/job.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-job-item',
  templateUrl: './job-item.component.html',
  styleUrls: ['./job-item.component.scss'],
})
export class JobItemComponent {
  editMode = false;
  @Input() jobItem?: JobItem;
  @Input() job?: Job;
  @Input({required: true}) user!: User;
  constructor(private jobService: JobService, private uxService: UxService) {}
  onJobItemUpdated($event: JobItem) {
    this.jobService.updateJobItem($event).subscribe((data) => {
      if (data && data.JobItemId) {
        this.jobItem = data;
        this.editMode = false;
        this.uxService.show_toast('Item updated', 'success');
      }
    });
  }

  delete_from_cart(jobItem: JobItem) {
    if (!this.job) return;
    this.jobService.deleteJobItem(jobItem.JobItemId).subscribe((is_deleted) => {
      if (is_deleted && this.job) {
        this.jobService.delete_from_cart(this.job, jobItem);
        this.jobService.update(this.job).subscribe();
        this.uxService.show_toast('Item removed from cart', 'success');
      }
    });
  }
  update_qty(qty: number, item: JobItem) {
    if (!this.job) return;
    this.jobService.update_qty(this.job, qty, item);
    this.jobService.updateJobItem(item).subscribe((data) => {
      if (data && data.JobItemId && this.job) {
        this.jobItem = data;
        this.uxService.show_toast('Item updated', 'success');
        this.job.TotalCost = this.jobService.cart_total(this.job);
        this.job.Metadata.paidAmount = this.jobService.calculatePaidAmount(this.job);
        this.job.Metadata.dueAmount = this.jobService.calculateDueAmount(this.job);
        this.jobService.update(this.job).subscribe();
      }
    });
  }
}
