import { Component, HostBinding, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Shared list-row card for admin customers (third member of the family:
 * chat / job / customer). Identity = person icon avatar; main = name +
 * phone; email surfaces as a chip. Navigation is delegated to the caller
 * via the optional `link` input.
 */
@Component({
  selector: 'app-customer-list-card',
  templateUrl: './customer-list-card.component.html',
  styleUrls: ['./customer-list-card.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CustomerListCardComponent {
  @Input() name = 'Thabang Ntsoane';
  @Input() phone = '—';
  @Input() email = '—';
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
    return `Open customer ${this.name}`;
  }

  @HostListener('click')
  onClick(): void {
    if (this.link) this.router.navigateByUrl(this.link);
  }

  @HostListener('keydown.enter')
  onEnter(): void {
    if (this.link) this.router.navigateByUrl(this.link);
  }

  get hasPhone(): boolean {
    return !!this.phone && this.phone !== '—';
  }

  get hasEmail(): boolean {
    return !!this.email && this.email !== '—';
  }
}
