import { Component, HostBinding, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Shared list-row card for admin jobs (no image identity — job number +
 * customer are the identity). Standalone, with defaults so it renders
 * meaningfully without any inputs. Navigation is delegated to the caller
 * via the optional `link` input; without it the card is a plain row.
 *
 * Named "job-list-card" (not "job-card") because the admin feature already
 * owns an unrelated app-job-card component.
 */
@Component({
  selector: 'app-job-list-card',
  templateUrl: './job-list-card.component.html',
  styleUrls: ['./job-list-card.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class JobListCardComponent {
  @Input() jobNo = 'JOB1042';
  @Input() customerName = '—';
  @Input() status = 'Not started';
  @Input() startDate: any = '';
  @Input() dueDate: any = '';
  @Input() link = '';

  constructor(private router: Router) {}

  @HostBinding('attr.role')
  get role(): string | null {
    return this.link ? 'link' : null;
  }

  @HostBinding('attr.tabindex')
  get tabindex(): string | null {
    return this.link ? '0' : null;
  }

  @HostBinding('attr.aria-label')
  get ariaLabel(): string {
    return `Open job ${this.jobNo} for ${this.customerName}`;
  }

  @HostListener('click')
  onClick(): void {
    if (this.link) this.router.navigateByUrl(this.link);
  }

  @HostListener('keydown.enter')
  onEnter(): void {
    if (this.link) this.router.navigateByUrl(this.link);
  }

  get badgeClass(): string {
    const map: Record<string, string> = {
      'not started': 'bg-light text-dark',
      'in progress': 'bg-dark-subtle text-dark',
      'completed': 'bg-success-subtle text-success',
      'complete': 'bg-success-subtle text-success',
      'terminated': 'bg-danger-subtle text-danger',
      'stuck': 'bg-warning-subtle text-dark',
      'paused': 'bg-secondary-subtle text-dark',
    };
    return map[(this.status || '').toLowerCase()] || 'bg-light text-dark';
  }

  // Chat-style presence dot on the icon avatar, colored by status.
  // Hidden for quiet statuses (not started / paused).
  get dotClass(): string {
    const map: Record<string, string> = {
      'in progress': 'dot-in-progress',
      'working on it': 'dot-in-progress',
      'completed': 'dot-completed',
      'complete': 'dot-completed',
      'done': 'dot-completed',
      'stuck': 'dot-stuck',
      'terminated': 'dot-terminated',
    };
    return map[(this.status || '').toLowerCase()] || '';
  }
}
