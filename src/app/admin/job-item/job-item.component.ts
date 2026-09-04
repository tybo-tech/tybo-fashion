import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { JobItem } from 'src/models/job-item.model';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';

/**
 * Sprint 5 §4 — plain garment row for the job overview list.
 * Read-only: the entire row navigates to the garment details page, the
 * only editing surface (Sprint 5 §5). No quantity stepper and no inline
 * delete here.
 */
@Component({
  selector: 'app-job-item',
  templateUrl: './job-item.component.html',
  styleUrls: ['./job-item.component.scss'],
})
export class JobItemComponent {
  @Input() jobItem?: JobItem;
  @Input() job?: Job;
  @Input({required: true}) user!: User;

  constructor(private router: Router) {}

  // Safe getters for better null handling
  get itemName(): string {
    return this.jobItem?.ItemName || 'Unnamed garment';
  }

  get featuredImageUrl(): string | null {
    return this.jobItem?.FeaturedImageUrl || null;
  }

  get itemSize(): string {
    return this.jobItem?.Size || 'One Size';
  }

  get itemColour(): string {
    return this.jobItem?.Colour || '';
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

  get garmentLink(): string | null {
    if (!this.job || !this.jobItem?.JobItemId) return null;
    // Sprint 5 §1 canonical route.
    return `/store/admin/jobs/${this.job.JobId}/garments/${this.jobItem.JobItemId}`;
  }
}
