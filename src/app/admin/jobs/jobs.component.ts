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
        this.applyRouteState();
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
    // Canonical interactive filter URL: /store/admin/jobs?status=&q=
    // Legacy /store/admin/jobs/:status links redirect here.
    this.route.queryParamMap.subscribe((params) => {
      this.selectedStatus = this.normalizeStatus(params.get('status') || '');
      this.query = params.get('q') || '';
      if (this.all_jobs) this.filter(false);
    });

    this.route.paramMap.subscribe((params) => {
      // Migrate legacy /jobs/:status path to the canonical query-param URL
      const legacy = params.get('status');
      if (legacy) {
        this.router.navigate(['/store/admin/jobs'], {
          queryParams: { status: this.slugify(legacy) },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  private normalizeStatus(raw: string): string {
    if (!raw) return '';
    const m: Record<string, string> = {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      'stuck': 'Stuck',
      'complete': 'Complete',
      'completed': 'Completed',
      'terminated': 'Terminated',
    };
    const key = raw.toLowerCase().trim();
    return m[key] || raw;
  }

  private slugify(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  // Sync current search + status into the URL; refresh restores filters.
  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: this.selectedStatus ? this.slugify(this.selectedStatus) : null, q: this.query || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private applyRouteState(): void {
    // Apply filters once data has arrived (queryParamMap subscription also fires)
    this.filter(false);
  }

  // Enhanced filtering; writeUrl controls whether the URL is updated
  filter(writeUrl = true) {
    this.currentPage = 1;
    if (!this.query && !this.selectedStatus) {
      this.jobs = this.all_jobs;
      if (writeUrl) this.syncUrl();
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

    // Filter by status — compare case-insensitively because the database
    // and Job Details use "Not started" while the filter options use
    // "Not Started".
    if (this.selectedStatus) {
      const wanted = this.selectedStatus.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          (job.Status || '').toLowerCase() === wanted ||
          (job.StatusDisplay || '').toLowerCase() === wanted
      );
    }

    this.jobs = filteredJobs;
    if (writeUrl) this.syncUrl();
  }

  onSearchInput() {
    this.filter();
  }

  onStatusChange() {
    this.filter();
  }

  resetFilters(): void {
    this.query = '';
    this.selectedStatus = '';
    // Clear path status + query params by returning to the canonical URL
    this.router.navigate(['/store/admin/jobs'], { replaceUrl: true });
    this.filter(false);
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

  trackByJobId(_index: number, job: Job): string {
    return job.JobId;
  }

  statusBadgeClass(status: string): string {
    // Case-insensitive: the database uses "Not started", the UI "Not Started".
    const map: Record<string, string> = {
      'not started': 'bg-light text-dark',
      'in progress': 'bg-dark-subtle text-dark',
      'completed': 'bg-success-subtle text-success',
      'complete': 'bg-success-subtle text-success',
      'terminated': 'bg-danger-subtle text-danger',
      'stuck': 'bg-warning-subtle text-dark',
    };
    return map[(status || '').toLowerCase()] || 'bg-light text-dark';
  }
}