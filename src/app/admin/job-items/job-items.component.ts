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
  @Input({required: true}) user!: User;

  addMode = false;
  jobItem?: JobItem;
  isLoading = false;

  constructor(private jobService: JobService, private uxService: UxService) {}

  ngOnInit(): void {
    this.initializeJobItem();
  }

  // Safe getters
  get jobItems(): JobItem[] {
    return this.job?.JobItems || [];
  }

  get hasItems(): boolean {
    return this.jobItems.length > 0;
  }

  get totalItems(): number {
    return this.jobItems.length;
  }

  get totalQuantity(): number {
    return this.jobItems.reduce((sum, item) => sum + (item.Quantity || 0), 0);
  }

  toggleAddMode(): void {
    this.addMode = !this.addMode;
    if (this.addMode) {
      this.initializeJobItem();
    }
  }

  onJobItemUpdated(item: JobItem): void {
    if (!item?.CompanyId || !this.job) return;

    this.isLoading = true;

    this.jobService.addJobItem(item).subscribe({
      next: (data) => {
        if (data?.CompanyId && this.job) {
          // Add the new item to the job
          if (!this.job.JobItems) {
            this.job.JobItems = [];
          }
          this.job.JobItems.push(data);

          // Update job totals
          this.updateJobTotals();

          // Update the job in backend
          this.jobService.update(this.job).subscribe({
            next: () => {
              this.addMode = false;
              this.isLoading = false;
              this.uxService.show_toast('Job item created successfully', 'success');
            },
            error: (error) => {
              console.error('Error updating job:', error);
              this.isLoading = false;
              this.uxService.show_toast('Item created but job update failed', 'warning');
            }
          });
        }
      },
      error: (error) => {
        console.error('Error creating job item:', error);
        this.isLoading = false;
        this.uxService.show_toast('Failed to create job item', 'error');
      }
    });
  }

  private initializeJobItem(): void {
    if (this.job) {
      this.jobItem = this.jobService.initJobItem(
        this.job.JobId,
        this.job.CompanyId,
        this.job.CreateUserId
      );
    }
  }

  private updateJobTotals(): void {
    if (!this.job) return;

    this.job.TotalCost = this.jobService.cart_total(this.job);
    if (this.job.Metadata) {
      this.job.Metadata.paidAmount = this.jobService.calculatePaidAmount(this.job);
      this.job.Metadata.dueAmount = this.jobService.calculateDueAmount(this.job);
    }
  }
}
