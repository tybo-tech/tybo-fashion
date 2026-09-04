import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IComment } from 'src/models/comment.model';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';
import { UxService } from 'src/services/ux.service';

/**
 * Sprint 5 §3 — dedicated job editor at /jobs/:jobId/edit.
 *
 * Owns exactly three things: customer, due date and special instructions.
 * Status is NOT editable here — it stays the overview quick action.
 * Save/cancel with an unsaved-change guard, loading/error+Retry states and
 * duplicate-submit protection. The overview page itself is read-first.
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

  dueDate = '';
  instructions: IComment[] = [];

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

  get overviewLink(): string {
    return `/store/admin/jobs/${this.jobId}`;
  }

  get isDirty(): boolean {
    return this.dirty && this.snapshot() !== this.savedSnapshot;
  }

  save(): void {
    if (this.saving || !this.job) return;
    this.saving = true;
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
        this.uxService.show_toast(
          'Failed to save the job. Please try again.',
          'Error',
          ['bg-danger']
        );
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
    });
  }

  private toDateInput(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().substring(0, 10);
  }
}
