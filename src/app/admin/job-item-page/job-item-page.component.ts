import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from 'src/models/job.model';
import { JobItem } from 'src/models/job-item.model';
import { User } from 'src/models/user.model';
import { JobService, isValidGarmentMutationResponse } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

/**
 * Sprint 5 §5 — Item details: the ONLY editing surface for an item.
 *
 * Route: /store/admin/jobs/:jobId/items/:itemId
 * (legacy /job/:jobId/items/... links arrive via redirect).
 *
 * - Edit mode reads the item through the scoped item endpoint
 *   (CompanyId + JobId + JobItemId) — no full-job load with client-side
 *   lookup. The response carries minimal parent context (JobId + JobNo)
 *   for the breadcrumb. New mode still needs the job record for context.
 * - Save/remove use the transactional endpoints (Sprint 5 §6): the server
 *   persists the item mutation and job totals in one transaction and
 *   returns both. Success requires a valid item (matching ID on edit)
 *   AND complete totals — never a partial response.
 * - Unsaved-change protection: snapshot/dirty tracking, a route
 *   canDeactivate guard and a beforeunload handler (Sprint 5 §5).
 * - Remove from job is a quiet danger action at the bottom, with a
 *   confirmation naming the item; duplicate submissions are blocked.
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
  parentJobNo = '';

  private savedSnapshot = '';

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
    // Sprint 5 §1: canonical route param is `itemId`; the legacy
    // `/job/:jobId/items/:jobItemId/edit` redirect also lands here.
    this.jobItemId = params.get('itemId') || params.get('jobItemId') || '';
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
      // Context only: the job supplies CompanyId/JobId for the new item.
      this.jobService.getjob(this.jobId).subscribe({
        next: (job) => {
          if (!job || !job.JobId) {
            this.fail('Job not found.');
            return;
          }
          this.job = job;
          this.parentJobNo = job.JobNo || '';
          this.jobItem = this.jobService.initJobItem(
            job.JobId,
            job.CompanyId,
            job.CreateUserId || this.user?.UserId || ''
          );
          this.savedSnapshot = this.snapshot();
          this.loading = false;
        },
        error: () => {
          this.fail('Failed to load this job. Please try again.');
        },
      });
      return;
    }

    // Edit: scoped read — the server enforces that the item belongs to
    // this job and this company. (Identifier scoping per Sprint 5 §7;
    // authentication is a separate security sprint.)
    const companyId = this.user?.CompanyId || '';
    if (!companyId) {
      this.fail('Your session is missing company information. Please sign in again.');
      return;
    }
    this.jobService.getJobItemScoped(companyId, this.jobId, this.jobItemId).subscribe({
      next: (res) => {
        const item = res?.garment;
        if (!item || !item.JobItemId) {
          this.fail('This item was not found in this job.');
          return;
        }
        this.jobItem = item;
        this.parentJobNo = res.job?.JobNo || '';
        this.savedSnapshot = this.snapshot();
        this.loading = false;
      },
      error: (err) => {
        if (err?.status === 404) {
          this.fail('This item was not found in this job.');
        } else {
          this.fail('Failed to load this item. Please try again.');
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

  // ── Unsaved-change protection (Sprint 5 §5) ───────────────────────────

  private snapshot(): string {
    return JSON.stringify(this.jobItem || null);
  }

  get isDirty(): boolean {
    return !!this.jobItem && this.snapshot() !== this.savedSnapshot;
  }

  canDeactivate(): boolean {
    return !this.isDirty || confirm('Discard unsaved changes?');
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadWarning($event: BeforeUnloadEvent): void {
    if (this.isDirty) {
      $event.preventDefault();
      $event.returnValue = true;
    }
  }

  // ── Presentation ──────────────────────────────────────────────────────

  get jobNo(): string {
    return this.parentJobNo || this.job?.JobNo || '';
  }

  get jobDetailsLink(): string {
    // Sprint 5 §1 canonical job overview route.
    return `/store/admin/jobs/${this.jobId}`;
  }

  get contextLabel(): string {
    return this.mode === 'new' ? 'Add item' : 'Item details';
  }

  get itemName(): string {
    return this.jobItem?.ItemName || 'Unnamed item';
  }

  get removeConfirmMessage(): string {
    const lastNote =
      this.mode === 'edit'
        ? ' If this is the last item, the invoice, payments and shipping are kept and the total becomes the remaining shipping charge.'
        : '';
    return `Remove "${this.itemName}" from this job? The job totals will be recalculated.${lastNote}`;
  }

  cancel(): void {
    // Navigate directly — the canDeactivate route guard owns the single
    // discard confirmation (avoids double prompting).
    this.router.navigate([this.jobDetailsLink]);
  }

  // ── Mutations ─────────────────────────────────────────────────────────

  save(item: JobItem): void {
    if (!item || this.saving || this.removing) return; // duplicate-submission guard
    const companyId = this.user?.CompanyId || '';
    if (!companyId) {
      this.fail('Your session is missing company information. Please sign in again.');
      return;
    }

    this.saving = true;
    this.error = null;

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
      next: (res) => {
        // Success only for the complete contract: garment (+ matching ID
        // on edit), removedJobItemId null and every totals field present
        // (Sprint 5 §6).
        if (!isValidGarmentMutationResponse(res, this.mode === 'new' ? 'add' : 'edit', this.jobItemId)) {
          this.saving = false;
          this.fail('The change was not saved as expected. Please try again.');
          return;
        }
        // Saved: align the snapshot so the route guard lets us leave.
        this.jobItem = res.garment || undefined;
        this.savedSnapshot = this.snapshot();
        this.saving = false;
        this.uxService.show_toast(
          this.mode === 'new' ? 'Item added successfully' : 'Item saved successfully',
          'success'
        );
        this.router.navigate([this.jobDetailsLink]);
      },
      error: () => {
        this.saving = false;
        this.uxService.show_toast(
          'Failed to save the item. Please try again.',
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
          // Success only for the complete remove contract: garment null,
          // the removed ID matching the requested item, complete totals.
          if (!isValidGarmentMutationResponse(res, 'remove', this.jobItem?.JobItemId)) {
            this.removing = false;
            this.fail('The item was not removed as expected. Please try again.');
            return;
          }
          this.removing = false;
          // Removed: align the snapshot so the route guard lets us leave.
          this.savedSnapshot = this.snapshot();
          this.uxService.show_toast('Item removed from job', 'success');
          this.router.navigate([this.jobDetailsLink]);
        },
        error: () => {
          this.removing = false;
          this.uxService.show_toast(
            'Failed to remove the item. Please try again.',
            'error'
          );
        },
      });
  }
}
