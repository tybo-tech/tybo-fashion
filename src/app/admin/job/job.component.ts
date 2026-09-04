import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/constants/Constants';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
})
export class JobComponent {
  id = '';
  backTo = '';
  tempStatus = '';
  statuses = [
    'Not started',
    'In Progress',
    'Completed',
    'Stuck',
    'Terminated',
    'Paused',
  ];
  job?: Job;
  showShipping = false;
  show_capture_payment = false;
  user?: User;
  Math = Math; // Expose Math to template
  constructor(
    private jobService: JobService,
    private userService: UserService,
    private uxService: UxService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((r) => {
      // Sprint 5 §1: canonical route is /jobs/:jobId (param `jobId`);
      // legacy links arrive via redirect and also carry `jobId`.
      this.id = r['jobId'] || r['id'];
      this.backTo = r['backTo'] || 'jobs';
      this.get();
    });

    this.userService.userObservable?.subscribe((user) => {
      this.user = user;
    });
  }
  get() {
    this.uxService.load(true);
    this.jobService.getjob(this.id).subscribe({
      next: (data) => {
        this.job = data;
        this.tempStatus = this.job.Status;

        // Read-only overview (Sprint 5 §2): no automatic writes fire on
        // load. Missing Metadata fields get in-memory defaults only —
        // totals are owned by the server (Sprint 5 §6).
        if (!this.job.Metadata) {
          this.job.Metadata = {
            InvoiceNo: this.job.JobNo.replace('JOB', 'INV'),
            Source: '',
          };
        }

        // Ensure Special_instructions array exists
        if (!this.job.Metadata.Special_instructions) {
          this.job.Metadata.Special_instructions = [];
        }

        // Initialize payment tracking if not present
        if (this.job.Metadata.paidAmount === undefined) {
          this.job.Metadata.paidAmount = 0;
        }
        if (this.job.Metadata.dueAmount === undefined) {
          this.job.Metadata.dueAmount = this.job.TotalCost;
        }
        if (!this.job.Metadata.payments) {
          this.job.Metadata.payments = [];
        }

        this.uxService.load(false);
      },
      error: (error) => {
        console.error('Error loading job:', error);
        this.uxService.load(false);
        this.uxService.show_toast('Error loading job details', 'Error', ['bg-danger']);
      }
    });
  }
  updateJob() {
    // Explicit save — used by the status quick action and the
    // shipping/payments modals only. Nothing auto-saves on this page.
    // On failure the loading state is released and the select reverts to
    // the last confirmed status (tempStatus).
    this.uxService.load(true);
    this.job &&
      this.jobService.update(this.job).subscribe({
        next: () => {
          this.tempStatus = this.job!.Status;
          this.uxService.load(false);
          this.uxService.show_toast('Job updated successfully', 'Success', [
            'bg-success',
          ]);
        },
        error: () => {
          this.job!.Status = this.tempStatus;
          this.uxService.load(false);
          this.uxService.show_toast(
            'Failed to update the job. Please try again.',
            'Error',
            ['bg-danger']
          );
        },
      });
  }

  // Safe metadata accessors
  getInvoiceNo(): string {
    return this.job?.Metadata?.InvoiceNo || 'No Invoice';
  }

  getPaymentProof(): string | null {
    return this.job?.Metadata?.paymentProof || null;
  }

  getPaidAmount(): number {
    return this.job?.Metadata?.paidAmount || 0;
  }

  getDueAmount(): number {
    return this.job?.Metadata?.dueAmount || 0;
  }

  getTotalPayments(): number {
    if (!this.job?.Metadata?.payments) return 0;
    return this.job.Metadata.payments.reduce((total, payment) => total + (payment.Amount || 0), 0);
  }

  hasPaymentProof(): boolean {
    return !!(this.job?.Metadata?.paymentProof);
  }

  hasUnpaidAmount(): boolean {
    return this.getDueAmount() > 0;
  }

  hasSpecialInstructions(): boolean {
    return !!(this.job?.Metadata?.Special_instructions && this.job.Metadata.Special_instructions.length > 0);
  }

  getSpecialInstructions(): any[] {
    return this.job?.Metadata?.Special_instructions || [];
  }

  // Payment progress calculation — capped, guard div0
  getPaymentPercentage(): number {
    if (!this.job?.TotalCost || this.job.TotalCost === 0) return 0;
    const paid = this.getPaidAmount();
    const pct = Math.round((paid / this.job.TotalCost) * 100);
    return Math.max(0, Math.min(100, pct));
  }

  // Job status helpers
  isCompleted(): boolean {
    return this.job?.Status === 'Completed' || this.job?.Status === 'Complete';
  }

  isOverdue(): boolean {
    if (!this.job?.DueDate) return false;
    const dueDate = new Date(this.job.DueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && !this.isCompleted();
  }

  getDaysUntilDue(): number | null {
    if (!this.job?.DueDate) return null;
    const dueDate = new Date(this.job.DueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get invoice() {
    return Constants.PrintInvoice + this.job?.JobId;
  }
}
