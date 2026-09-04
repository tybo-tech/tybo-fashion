import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from 'src/models/job.model';
import { JobItem } from 'src/models/job-item.model';
import { User } from 'src/models/user.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

/**
 * Sprint 5 §5 — Garment details: the ONLY editing surface for a garment.
 *
 * Route: /store/admin/jobs/:jobId/garments/:garmentId
 * (legacy /job/:jobId/items/... links arrive via redirect).
 *
 * - Edit mode reads the garment through the scoped item endpoint
 *   (CompanyId + JobId + JobItemId) — no full-job load with client-side
 *   lookup. New mode still needs the job record for context only.
 * - Save/remove use the transactional endpoints (Sprint 5 §6): the server
 *   persists the item mutation and job totals in one transaction and
 *   returns both, so the client never chains a parent-totals update and
 *   never reports false success.
 * - Remove from job is a quiet danger action at the bottom, with a
 *   confirmation naming the garment; duplicate submissions are blocked.
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
  removing = false;
  error: string | null = null;

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
    // Sprint 5 §1: canonical route param is `garmentId`; the legacy
    // `/job/:jobId/items/:jobItemId/edit` redirect also lands here.
    this.jobItemId = params.get('garmentId') || params.get('jobItemId') || '';
    this.mode = this.jobItemId ? 'edit' : 'new';
    this.load();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  private load(): void {
    this.loading = true;
    this.error = null;

    if (this.mode === 'new') {
      // Context only: the job supplies CompanyId/JobId for the new garment.
      this.jobService.getjob(this.jobId).subscribe({
        next: (job) => {
          if (!job || !job.JobId) {
            this.fail('Job not found.');
            return;
          }
          this.job = job;
          this.jobItem = this.jobService.initJobItem(
            job.JobId,
            job.CompanyId,
            job.CreateUserId || this.user?.UserId || ''
          );
          this.loading = false;
        },
        error: () => {
          this.fail('Failed to load this job. Please try again.');
        },
      });
      return;
    }

    // Edit: scoped read — the server enforces that the garment belongs to
    // this job and this company. (Identifier scoping per Sprint 5 §7;
    // authentication is a separate security sprint.)
    const companyId = this.user?.CompanyId || '';
    if (!companyId) {
      this.fail('Your session is missing company information. Please sign in again.');
      return;
    }
    this.jobService.getJobItemScoped(companyId, this.jobId, this.jobItemId).subscribe({
      next: (res) => {
        const garment = res?.garment;
        if (!garment || !garment.JobItemId) {
          this.fail('This garment was not found in this job.');
          return;
        }
        this.jobItem = garment;
        this.loading = false;
      },
      error: (err) => {
        if (err?.status === 404) {
          this.fail('This garment was not found in this job.');
        } else {
          this.fail('Failed to load this garment. Please try again.');
        }
      },
    });
  }

  retry(): void {
    this.load();
  }

  private fail(message: string): void {
    this.error = message;
    this.loading = false;
  }

  get jobNo(): string {
    return this.job?.JobNo || this.jobItem?.JobId || '';
  }

  get jobDetailsLink(): string {
    // Sprint 5 §1 canonical job overview route.
    return `/store/admin/jobs/${this.jobId}`;
  }

  get contextLabel(): string {
    return this.mode === 'new' ? 'Add garment' : 'Garment details';
  }

  get garmentName(): string {
    return this.jobItem?.ItemName || 'Unnamed garment';
  }

  get removeConfirmMessage(): string {
    const lastNote =
      this.mode === 'edit'
        ? ' If this is the last garment, the invoice, payments and shipping are kept and the total becomes the remaining shipping charge.'
        : '';
    return `Remove "${this.garmentName}" from this job? The job totals will be recalculated.${lastNote}`;
  }

  cancel(): void {
    this.router.navigate([this.jobDetailsLink]);
  }

  save(item: JobItem): void {
    if (!item || this.saving || this.removing) return; // duplicate-submission guard
    const companyId = this.user?.CompanyId || '';
    if (!companyId) {
      this.fail('Your session is missing company information. Please sign in again.');
      return;
    }

    this.saving = true;
    this.error = null;

    const handle = (res: { garment: JobItem | null; totals?: unknown }) => {
      // The server returns the saved garment plus recalculated totals only
      // when the whole transaction committed (Sprint 5 §6).
      if (!res || (!res.garment && !('totals' in res))) {
        this.saving = false;
        this.fail('The change was not saved as expected. Please try again.');
        return;
      }
      this.saving = false;
      this.uxService.show_toast(
        this.mode === 'new' ? 'Garment added successfully' : 'Garment saved successfully',
        'success'
      );
      this.router.navigate([this.jobDetailsLink]);
    };

    const request =
      this.mode === 'new'
        ? this.jobService.addJobItemTransactional(companyId, this.jobId, item)
        : this.jobService.updateJobItemTransactional(
            companyId,
            this.jobId,
            this.jobItemId,
            item
          );

    request.subscribe({
      next: handle,
      error: () => {
        this.saving = false;
        this.uxService.show_toast(
          'Failed to save the garment. Please try again.',
          'error'
        );
      },
    });
  }

  removeFromJob(): void {
    if (!this.jobItem?.JobItemId || this.removing || this.saving) return;
    if (!this.user?.CompanyId) {
      this.fail('Your session is missing company information. Please sign in again.');
      return;
    }
    if (!confirm(this.removeConfirmMessage)) return;

    this.removing = true;
    this.jobService
      .removeJobItemTransactional(this.user.CompanyId, this.jobId, this.jobItem.JobItemId)
      .subscribe({
        next: (res) => {
          // Success only when the transaction (removal + totals) committed.
          if (!res || !res.removedJobItemId) {
            this.removing = false;
            this.fail('The garment was not removed as expected. Please try again.');
            return;
          }
          this.removing = false;
          this.uxService.show_toast('Garment removed from job', 'success');
          this.router.navigate([this.jobDetailsLink]);
        },
        error: () => {
          this.removing = false;
          this.uxService.show_toast(
            'Failed to remove the garment. Please try again.',
            'error'
          );
        },
      });
  }
}
