import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ICounts } from 'src/models/Company';
import { User } from 'src/models/user.model';
import { ShopService } from 'src/services/shop.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  today = new Date();
  cards: {
    title: string;
    count: number;
    link: string;
    classes: string[];
  }[] = [];

  shortcuts = [
    { label: 'Add Job', route: '/store/admin/job/add' },
    { label: 'Add Product', route: '/store/admin/product/add' },
    { label: 'Add Customer', route: '/store/admin/customer/add' },
  ];

  user?: User;
  counts?: ICounts;

  constructor(
    private router: Router,
    private userService: UserService,
    private shopService: ShopService
  ) {
    this.user = this.userService.getUser;
    if (this.user) {
      this.shopService.counts(this.user.CompanyId).subscribe((data) => {
        this.counts = data;
        // Fix: render cards even when CustomerCount is 0; check counts exists
        if (this.counts) {
          this.cards = [
            {
              title: 'Products',
              count: this.counts.ProductCount ?? 0,
              link: '/store/admin/products',
              classes: ['bg-white'],
            },
            {
              title: 'Categories',
              count: this.counts.CategoryCount ?? 0,
              link: '/store/admin/categories',
              classes: ['bg-white'],
            },
            {
              title: 'Collections',
              count: this.counts.CollectionCount ?? 0,
              link: '/store/admin/collections',
              classes: ['bg-white'],
            },
            {
              title: 'Customers',
              count: this.counts.CustomerCount ?? 0,
              link: '/store/admin/customers',
              classes: ['bg-white'],
            },
            {
              title: 'Users',
              count: this.counts.UserCount ?? 0,
              link: '/store/admin/users',
              classes: ['bg-white'],
            },
            {
              title: 'Jobs',
              count: this.counts.JobCount ?? 0,
              link: '/store/admin/jobs',
              classes: ['bg-white'],
            },
            {
              title: 'Job Cards',
              count: this.counts.JobItemCount ?? 0,
              link: '/store/admin/job-cards',
              classes: ['bg-white'],
            },
          ];
        }
      });
    }
  }

  // Helper methods for card styling and icons
  getCardIcon(title: string): string {
    const iconMap: { [key: string]: string } = {
      'Products': 'bi-box-seam',
      'Styles': 'bi-palette2',
      'Collections': 'bi-collection',
      'Customers': 'bi-people',
      'Users': 'bi-person-gear',
      'Jobs': 'bi-briefcase',
      'Job Cards': 'bi-kanban'
    };
    return iconMap[title] || 'bi-circle';
  }

  getShortcutIcon(label: string): string {
    const iconMap: { [key: string]: string } = {
      'Add Job': 'bi-plus-circle',
      'Add Product': 'bi-bag-plus',
      'Add Customer': 'bi-person-plus'
    };
    return iconMap[label] || 'bi-plus';
  }

  getShortcutDescription(label: string): string {
    const descriptionMap: { [key: string]: string } = {
      'Add Job': 'Create a new custom order',
      'Add Product': 'Add items to your catalog',
      'Add Customer': 'Register new clients'
    };
    return descriptionMap[label] || 'Quick action';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
