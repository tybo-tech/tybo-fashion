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
  selectedStatus = '';
  loading = true;
  error: string | null = null;
  user = this.userService.getUser;
  jobs?: Job[];
  all_jobs: Job[] | undefined;
  Math = Math; // Expose Math to template

  constructor(
    private jobService: JobService,
    private userService: UserService,
    private router: Router
  ) {
    if (!this.user) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.jobService.getJobs(this.user.CompanyId).subscribe({
      next: (data) => {
        this.jobs = data || [];
        this.all_jobs = data || [];
        this.loading = false;
        this.error = null;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.error = 'Failed to load jobs. Please try again.';
        this.jobs = [];
        this.all_jobs = [];
        this.loading = false;
      },
    });
  }

  // Enhanced filtering
  filter() {
    if (!this.query && !this.selectedStatus) {
      this.jobs = this.all_jobs;
      return;
    }

    let filteredJobs = this.all_jobs || [];

    // Filter by search query
    if (this.query) {
      filteredJobs = filteredJobs.filter((job) => {
        const searchTerm = this.query.toLowerCase();
        return (
          job.Customer?.Name?.toLowerCase().includes(searchTerm) ||
          job.Customer?.PhoneNumber?.includes(this.query) ||
          job.JobNo?.toLowerCase().includes(searchTerm) ||
          job.Metadata?.InvoiceNo?.toLowerCase().includes(searchTerm) ||
          job.Tittle?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Filter by status
    if (this.selectedStatus) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.Status === this.selectedStatus ||
          job.StatusDisplay === this.selectedStatus
      );
    }

    this.jobs = filteredJobs;
  }

  filterByStatus() {
    this.filter();
  }

  clearSearch() {
    this.query = '';
    this.filter();
  }

  toggleAdvancedFilters() {
    // Implement advanced filters modal/dropdown
    console.log('Advanced filters clicked');
  }

  // Statistics methods
  getTotalRevenue(): number {
    if (!this.all_jobs) return 0;
    return this.all_jobs.reduce(
      (total, job) => total + (Number(job.TotalCost || '0') || 0),
      0
    );
  }

  getOverdueCount(): number {
    if (!this.all_jobs) return 0;
    return this.all_jobs.filter((job) => job.IsOverdue === true).length;
  }

  getPendingPayments(): number {
    if (!this.all_jobs) return 0;
    return this.all_jobs.reduce((total, job) => {
      const dueAmount = job.Metadata?.dueAmount || 0;
      return total + dueAmount;
    }, 0);
  }

  // Status styling methods
  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Not Started': 'status-pending',
      'In Progress': 'status-progress',
      Completed: 'status-success',
      Complete: 'status-success',
      Terminated: 'status-danger',
      Stuck: 'status-warning',
    };
    return statusMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'Not Started': 'bi-play-circle',
      'In Progress': 'bi-arrow-clockwise',
      Completed: 'bi-check-circle-fill',
      Complete: 'bi-check-circle-fill',
      Terminated: 'bi-x-circle-fill',
      Stuck: 'bi-exclamation-triangle-fill',
    };
    return iconMap[status] || 'bi-circle';
  }

  // Payment calculation
  getPaymentPercentage(job: Job): number {
    if (!job.TotalCost || job.TotalCost === 0) return 0;
    const paidAmount = job.Metadata?.paidAmount || 0;
    return Math.round((paidAmount / job.TotalCost) * 100);
  }

  // Safe metadata accessors
  hasPaidAmount(job: Job): boolean {
    return !!(job.Metadata?.paidAmount && job.Metadata.paidAmount > 0);
  }

  hasDueAmount(job: Job): boolean {
    return !!(job.Metadata?.dueAmount && job.Metadata.dueAmount > 0);
  }

  getPaidAmount(job: Job): number {
    return job.Metadata?.paidAmount || 0;
  }

  getDueAmount(job: Job): number {
    return job.Metadata?.dueAmount || 0;
  }

  hasPaymentProgress(job: Job): boolean {
    return !!(job.Metadata?.paidAmount !== undefined && job.TotalCost > 0);
  }

  // Safe days remaining calculation
  getDaysRemainingText(job: Job): string {
    if (job.DaysRemaining === null || job.DaysRemaining === undefined) {
      return '';
    }
    const days = job.DaysRemaining;
    return days > 0 ? `${days} days left` : `${Math.abs(days)} days overdue`;
  }

  hasDaysRemaining(job: Job): boolean {
    return job.DaysRemaining !== null && job.DaysRemaining !== undefined;
  }

  // Action methods
  editJob(event: Event, job: Job) {
    event.stopPropagation();
    this.router.navigate(['/store/admin/job', job.JobId, 'edit']);
  }

  recordPayment(event: Event, job: Job) {
    event.stopPropagation();
    // Implement payment recording modal
    console.log('Record payment for job:', job.JobNo);
  }

  viewJob(event: Event, job: Job) {
    event.stopPropagation();
    this.router.navigate(['/store/admin/job', job.JobId, 'jobs']);
  }

  showMoreActions(event: Event, job: Job) {
    event.stopPropagation();
    // Implement action menu
    console.log('More actions for job:', job.JobNo);
  }

  // Legacy method for compatibility
  isPastDue(dueDate: string | Date): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }
}
