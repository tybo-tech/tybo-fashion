import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import {
  isAdminHome,
  isCustomersArea,
  isJobsArea,
} from '../../admin/nav-routes';

@Component({
  selector: 'app-admin-bottom-nav',
  templateUrl: './admin-bottom-nav.component.html',
})
export class AdminBottomNavComponent {
  @Input() currentUrl = '';

  constructor(private router: Router) {}

  isBottomActive(key: 'home' | 'jobs' | 'customers'): boolean {
    if (key === 'home') return isAdminHome(this.currentUrl);
    if (key === 'jobs') return isJobsArea(this.currentUrl);
    return isCustomersArea(this.currentUrl);
  }

  goBottom(key: 'home' | 'jobs' | 'customers'): void {
    const targets: Record<'home' | 'jobs' | 'customers', string> = {
      home: '/store/admin',
      jobs: '/store/admin/jobs',
      customers: '/store/admin/customers',
    };
    this.router.navigate([targets[key]]);
  }
}
