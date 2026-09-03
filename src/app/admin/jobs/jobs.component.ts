import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnInit {
  show_add = false;
  query = '';
  selectedStatus = '';
  routeStatus = '';
  loading = true;
  error: string | null = null;
  user = this.userService.getUser;
  jobs?: Job[];
  all_jobs: Job[] | undefined;
  Math = Math;

  pageSize = 20;
  currentPage = 1;

  constructor(
    private jobService: JobService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
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
        this.applyRouteStatus();
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

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const s = params.get('status') || '';
      this.routeStatus = this.normalizeStatus(s);
      if (this.routeStatus) this.selectedStatus = this.routeStatus;
      if (this.all_jobs) this.filter();
    });
  }

  private normalizeStatus(raw: string): string {
    if (!raw) return '';
    const m: Record<string,string> = {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      'stuck': 'Stuck',
      'complete': 'Complete',
      'completed': 'Completed',
      'terminated': 'Terminated'
    };
    const key = raw.toLowerCase().trim();
    return m[key] || raw;
  }

  private applyRouteStatus(): void {
    if (this.routeStatus) {
      this.selectedStatus = this.routeStatus;
      this.filter();
    }
  }

  // Enhanced filtering
  filter() {
    this.currentPage = 1;
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
    this.routeStatus = '';
    this.filter();
  }

  clearSearch() {
    this.query = '';
    this.filter();
  }

  clearFilters(): void {
    this.query = '';
    this.selectedStatus = '';
    this.routeStatus = '';
    this.router.navigate(['/store/admin/jobs']);
    this.filter();
  }

  // Pagination over the filtered collection
  get totalPages(): number {
    return Math.max(1, Math.ceil((this.jobs?.length || 0) / this.pageSize));
  }

  get pagedJobs(): Job[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return (this.jobs || []).slice(start, start + this.pageSize);
  }

  get pageStart(): number {
    if (!this.jobs || this.jobs.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    if (!this.jobs || this.jobs.length === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, this.jobs.length);
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  prevPage() {
    if (this.hasPreviousPage) this.currentPage--;
  }

  nextPage() {
    if (this.hasNextPage) this.currentPage++;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  trackByJobId(_index: number, job: Job): string {
    return job.JobId;
  }

  statusBadgeClass(status: string): string {
    const map: Record<string,string> = {
      'Not Started': 'bg-light text-dark',
      'In Progress': 'bg-primary-subtle text-primary',
      'Completed': 'bg-success-subtle text-success',
      'Complete': 'bg-success-subtle text-success',
      'Terminated': 'bg-danger-subtle text-danger',
      'Stuck': 'bg-warning-subtle text-dark'
    };
    return map[status] || 'bg-light text-dark';
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

  // Money formatting — "ZAR 900.00" with visible spacing
  formatMoney(value: number | null | undefined): string {
    const n = Number(value || 0);
    return 'ZAR ' + n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Payment calculation — capped 0..100, safe division
  getPaymentPercentage(job: Job): number {
    if (!job.TotalCost || job.TotalCost === 0) return 0;
    const paidAmount = job.Metadata?.paidAmount || 0;
    const pct = Math.round((paidAmount / job.TotalCost) * 100);
    return Math.max(0, Math.min(100, pct));
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
    if (days === 0) return 'Due today';
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

  viewJob(event: Event, job: Job) {
    event.stopPropagation();
    this.router.navigate(['/store/admin/job', job.JobId, 'jobs']);
  }
}
