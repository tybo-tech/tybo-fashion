import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IComment } from 'src/models/comment.model';
import { CustomerListItem } from 'src/models/Customer';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';
import { UxService } from 'src/services/ux.service';

/**
 * Sprint 5 §3 — dedicated job editor at /jobs/:jobId/edit.
 *
 * Owns exactly three things: customer, due date and special instructions.
 * Status is NOT editable here — it stays the overview quick action.
 *
 * Customer is a controlled draft: the picker only updates the job's
 * CustomerId/CustomerName locally; the association is persisted through
 * this editor's single Save. The customer entity itself is edited on the
 * customer detail page (linked), not here.
 *
 * Save/cancel with an unsaved-change guard, inline error + Retry on save,
 * loading/error+Retry states and duplicate-submit protection. The overview
 * page itself is read-first.
 */
@Component({
  selector: 'app-job-editor',
  templateUrl: './job-editor.component.html',
  styleUrls: ['./job-editor.component.scss'],
})
export class JobEditorComponent {
  jobId = '';
  job?: Job;
  loading = true;
  loadError: string | null = null;
  saveError: string | null = null;

  dueDate = '';
  instructions: IComment[] = [];
  customerPickerOpen = false;

  saving = false;
  private dirty = false;
  private savedSnapshot = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private uxService: UxService
  ) {
    this.jobId = this.route.snapshot.paramMap.get('jobId') || '';
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.jobService.getjob(this.jobId).subscribe({
      next: (job) => {
        if (!job || !job.JobId) {
          this.loadError = 'Job not found.';
          this.loading = false;
          return;
        }
        this.job = job;
        this.dueDate = this.toDateInput(job.DueDate);
        this.instructions = job.Metadata?.Special_instructions || [];
        this.savedSnapshot = this.snapshot();
        this.dirty = false;
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Failed to load this job. Please try again.';
        this.loading = false;
      },
    });
  }

  retry(): void {
    this.load();
  }

  onDueDateChange(): void {
    this.dirty = true;
  }

  onInstructionsChange(comments: IComment[]): void {
    this.instructions = comments;
    this.dirty = true;
  }

  openCustomerPicker(): void {
    this.customerPickerOpen = true;
  }

  closeCustomerPicker(): void {
    this.customerPickerOpen = false;
  }

  /** Controlled draft: persist only through Save (Sprint 5 §3). */
  onCustomerPicked(customer: CustomerListItem): void {
    if (!this.job || !customer?.CustomerId) return;
    this.job.CustomerId = customer.CustomerId;
    this.job.CustomerName = customer.CustomerName;
    this.customerPickerOpen = false;
    this.dirty = true;
  }

  get customerDetailLink(): string | null {
    const id = this.job?.CustomerId;
    return id ? `/store/admin/customer/${id}` : null;
  }

  get overviewLink(): string {
    return `/store/admin/jobs/${this.jobId}`;
  }

  get isDirty(): boolean {
    return this.dirty && this.snapshot() !== this.savedSnapshot;
  }

  save(): void {
    if (this.saving || !this.job) return;
    this.saving = true;
    this.saveError = null;
    this.job.DueDate = this.dueDate;
    this.job.Metadata.Special_instructions = this.instructions;
    this.jobService.update(this.job).subscribe({
      next: () => {
        this.saving = false;
        this.dirty = false;
        this.uxService.show_toast('Job updated successfully', 'Success', [
          'bg-success',
        ]);
        this.router.navigate([this.overviewLink]);
      },
      error: () => {
        this.saving = false;
        this.saveError =
          'Failed to save the job. Nothing was changed — please try again.';
      },
    });
  }

  cancel(): void {
    if (this.isDirty && !confirm('Discard unsaved changes?')) return;
    this.router.navigate([this.overviewLink]);
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

  private snapshot(): string {
    return JSON.stringify({
      dueDate: this.dueDate,
      instructions: this.instructions,
      CustomerId: this.job?.CustomerId,
      CustomerName: this.job?.CustomerName,
    });
  }

  private toDateInput(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().substring(0, 10);
  }
}
