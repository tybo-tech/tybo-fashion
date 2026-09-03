import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from 'src/models/job.model';
import { JobItem } from 'src/models/job-item.model';
import { User } from 'src/models/user.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

/**
 * Routed page for creating and editing a job item.
 *
 * Routes:
 *   /store/admin/job/:jobId/items/new
 *   /store/admin/job/:jobId/items/:jobItemId/edit
 *
 * Owns loading, persistence, errors and navigation. Form presentation lives
 * in JobItemFormComponent. Replaces the former overlay/modal workflow while
 * preserving the existing service payloads and totals recalculation
 * (see docs/job-workflow-baseline.md).
 */
@Component({
  selector: 'app-job-item-page',
  templateUrl: './job-item-page.component.html',
  styleUrls: ['./job-item-page.component.scss'],
})
export class JobItemPageComponent implements OnInit, OnDestroy {
  mode: 'new' | 'edit' = 'new';
  jobId = '';
  jobItemId = '';
  job?: Job;
  jobItem?: JobItem;
  user?: User;
  loading = true;
  saving = false;
  error: string | null = null;
  backTo = 'jobs';

  private userSub?: { unsubscribe(): void };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private userService: UserService,
    private uxService: UxService
  ) {
    this.user = this.userService.getUser;
    this.userSub = this.userService.userObservable?.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.paramMap;
    this.jobId = params.get('jobId') || '';
    this.jobItemId = params.get('jobItemId') || '';
    this.mode = this.jobItemId ? 'edit' : 'new';
    this.load();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  private load(): void {
    this.loading = true;
    this.error = null;

    this.jobService.getjob(this.jobId).subscribe({
      next: (job) => {
        if (!job || !job.JobId) {
          this.fail('Job not found.');
          return;
        }
        this.job = job;

        if (this.mode === 'new') {
          this.jobItem = this.jobService.initJobItem(
            job.JobId,
            job.CompanyId,
            job.CreateUserId || this.user?.UserId || ''
          );
          this.loading = false;
          return;
        }

        // Edit: locate the item inside the loaded job and verify ownership.
        const item = (job.JobItems || []).find(
          (x) => x.JobItemId === this.jobItemId
        );
        if (!item) {
          this.fail('This item does not belong to this job.');
          return;
        }
        this.jobItem = item;
        this.loading = false;
      },
      error: () => {
        this.fail('Failed to load this job item.');
      },
    });
  }

  private fail(message: string): void {
    this.error = message;
    this.loading = false;
  }

  get jobNo(): string {
    return this.job?.JobNo || '';
  }

  get jobDetailsLink(): string {
    return `/store/admin/job/${this.jobId}/jobs`;
  }

  get pageTitle(): string {
    return this.mode === 'new' ? 'Add item' : 'Edit item';
  }

  cancel(): void {
    this.router.navigate([this.jobDetailsLink]);
  }

  save(item: JobItem): void {
    if (!this.job || !item || this.saving) return; // duplicate-submission guard
    this.saving = true;
    this.error = null;

    const done = (updated: Job) => {
      this.saving = false;
      this.uxService.show_toast(
        this.mode === 'new' ? 'Job item created successfully' : 'Item updated successfully',
        'success'
      );
      this.router.navigate([this.jobDetailsLink]);
    };

    const persistTotals = (failMsg: string) => {
      // Recalculate and persist parent totals (same contract as the
      // previous modal workflow's add path; edit now also persists).
      this.job!.TotalCost = this.jobService.cart_total(this.job!);
      if (this.job!.Metadata) {
        this.job!.Metadata.paidAmount = this.jobService.calculatePaidAmount(this.job!);
        this.job!.Metadata.dueAmount = this.jobService.calculateDueAmount(this.job!);
      }
      this.jobService.update(this.job!).subscribe({
        next: () => done(this.job!),
        error: () => {
          this.saving = false;
          this.uxService.show_toast(failMsg, 'warning');
          this.router.navigate([this.jobDetailsLink]);
        },
      });
    };

    if (this.mode === 'new') {
      this.jobService.addJobItem(item).subscribe({
        next: (saved) => {
          if (!saved || !saved.JobItemId) {
            this.saving = false;
            this.fail('Failed to create the item. Please try again.');
            return;
          }
          this.job!.JobItems = this.job!.JobItems || [];
          this.job!.JobItems.push(saved);
          persistTotals('Item created but job update failed');
        },
        error: () => {
          this.saving = false;
          this.fail('Failed to create the item. Please try again.');
        },
      });
      return;
    }

    // Edit: verify ownership, replace in the parent collection, persist.
    const index = (this.job!.JobItems || []).findIndex(
      (x) => x.JobItemId === item.JobItemId
    );
    if (index === -1) {
      this.saving = false;
      this.fail('This item does not belong to this job.');
      return;
    }
    this.jobService.updateJobItem(item).subscribe({
      next: (saved) => {
        if (this.job!.JobItems && saved?.JobItemId) {
          this.job!.JobItems[index] = saved;
        }
        persistTotals('Item updated but job update failed');
      },
      error: () => {
        this.saving = false;
        this.fail('Failed to update the item. Please try again.');
      },
    });
  }
}