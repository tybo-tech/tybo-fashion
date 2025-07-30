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

  // Safe getters for better null handling
  get itemName(): string {
    return this.jobItem?.ItemName || 'Unnamed Item';
  }

  get featuredImageUrl(): string | null {
    return this.jobItem?.FeaturedImageUrl || null;
  }

  get itemSize(): string {
    return this.jobItem?.Size || 'One Size';
  }

  get assignedTo(): string | null {
    return this.jobItem?.Metadata?.AssignedTo || null;
  }

  get itemTotal(): number {
    if (!this.jobItem) return 0;
    return (this.jobItem.UnitPrice || 0) * (this.jobItem.Quantity || 1);
  }

  get itemQuantity(): number {
    return this.jobItem?.Quantity || 1;
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  onJobItemUpdated($event: JobItem): void {
    if (!$event?.JobItemId) return;

    this.jobService.updateJobItem($event).subscribe({
      next: (data) => {
        if (data?.JobItemId) {
          this.jobItem = data;
          this.editMode = false;
          this.uxService.show_toast('Item updated successfully', 'success');
          this.updateJobTotals();
        }
      },
      error: (error) => {
        console.error('Error updating job item:', error);
        this.uxService.show_toast('Failed to update item', 'error');
      }
    });
  }

  delete_from_cart(jobItem: JobItem): void {
    if (!this.job || !jobItem?.JobItemId) return;

    if (!confirm('Are you sure you want to remove this item?')) return;

    this.jobService.deleteJobItem(jobItem.JobItemId).subscribe({
      next: (is_deleted) => {
        if (is_deleted && this.job) {
          this.jobService.delete_from_cart(this.job, jobItem);
          this.updateJobTotals();
          this.jobService.update(this.job).subscribe();
          this.uxService.show_toast('Item removed successfully', 'success');
        }
      },
      error: (error) => {
        console.error('Error deleting job item:', error);
        this.uxService.show_toast('Failed to remove item', 'error');
      }
    });
  }

  update_qty(qty: number, item: JobItem): void {
    if (!this.job || !item || qty < 1) return;

    this.jobService.update_qty(this.job, qty, item);
    this.jobService.updateJobItem(item).subscribe({
      next: (data) => {
        if (data?.JobItemId && this.job) {
          this.jobItem = data;
          this.uxService.show_toast('Quantity updated', 'success');
          this.updateJobTotals();
          this.jobService.update(this.job).subscribe();
        }
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.uxService.show_toast('Failed to update quantity', 'error');
      }
    });
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
