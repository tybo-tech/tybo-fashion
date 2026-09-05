import { Component, Input } from '@angular/core';
import { IMenuGroup } from '../menu.model';
import {
  isAdminHome,
  isCustomersArea,
  isJobsArea,
} from '../../admin/nav-routes';

@Component({
  selector: 'app-admin-nav-list',
  templateUrl: './admin-nav-list.component.html',
  styleUrls: ['./admin-nav-list.component.scss'],
})
export class AdminNavListComponent {
  @Input() menu: IMenuGroup[] = [];
  @Input() currentUrl = '';

  // Shared route matching keeps desktop sidebar, offcanvas and bottom nav
  // in agreement. Jobs stays active through job/job-item routes (but not
  // job-cards); Customers through customer routes; Home is exact.
  isMenuActive(url: string): boolean {
    if (url === '/store/admin') return isAdminHome(this.currentUrl);
    if (url === '/store/admin/jobs') return isJobsArea(this.currentUrl);
    if (url === '/store/admin/customers') return isCustomersArea(this.currentUrl);
    return this.currentUrl === url || this.currentUrl.startsWith(url + '/');
  }
}
