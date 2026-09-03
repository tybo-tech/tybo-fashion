import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobItem } from 'src/models/job-item.model';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';

@Component({
  selector: 'app-job-items',
  templateUrl: './job-items.component.html',
  styleUrls: ['./job-items.component.scss'],
})
export class JobItemsComponent implements OnInit {
  @Input() job?: Job;
  @Input({required: true}) user!: User;

  constructor(private router: Router) {}

  ngOnInit(): void {
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
    return this.jobItems.reduce((sum, item) => sum + (Number(item.Quantity) || 0), 0);
  }

  // Complex editing happens on dedicated routed pages
  addItem(): void {
    if (this.job) {
      this.router.navigate(['/store/admin/job', this.job.JobId, 'items', 'new']);
    }
  }
}