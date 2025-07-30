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

  jobStatuses = [
    {
      name: 'Not Started',
      count: 10,
      link: '/store/admin/jobs/not-started',
      classes: ['bg-white'],
    },
    {
      name: 'In Progress',
      count: 20,
      link: '/store/admin/jobs/in-progress',
      classes: ['bg-white'],
    },
    {
      name: 'Stuck',
      count: 2,
      link: '/store/admin/jobs/stuck',
      classes: ['bg-white'],
    },
    {
      name: 'Complete',
      count: 5,
      link: '/store/admin/jobs/complete',
      classes: ['bg-success', 'text-white'],
    },
  ];

  shortcuts = [
    { label: 'Add Job', route: '/store/admin/job/add' },
    { label: 'Add Product', route: '/store/admin/product/add' },
    { label: 'Add Customer', route: '/store/admin/customer/add' },
  ];

  user?: User;
  counts?: ICounts;
  totalJobs = 0;

  constructor(
    private router: Router,
    private userService: UserService,
    private shopService: ShopService
  ) {
    this.user = this.userService.getUser;
    if (this.user) {
      this.shopService.counts(this.user.CompanyId).subscribe((data) => {
        this.counts = data;
        if (this.counts.CustomerCount) {
          this.cards = [
            {
              title: 'Products',
              count: this.counts.ProductCount,
              link: '/store/admin/products',
              classes: ['bg-white'],
            },
            {
              title: 'Styles',
              count: this.counts.CategoryCount,
              link: '/store/admin/styles',
              classes: ['bg-white'],
            },
            {
              title: 'Collections',
              count: this.counts.CollectionCount,
              link: '/store/admin/collections',
              classes: ['bg-white'],
            },
            {
              title: 'Customers',
              count: this.counts.CustomerCount,
              link: '/store/admin/customers',
              classes: ['bg-white'],
            },
            {
              title: 'Users',
              count: this.counts.UserCount,
              link: '/store/admin/users',
              classes: ['bg-white'],
            },
            {
              title: 'Jobs',
              count: this.counts.JobCount,
              link: '/store/admin/jobs',
              classes: ['bg-white'],
            },
            {
              title: 'Job Cards',
              count: this.counts.JobItemCount,
              link: '/store/admin/job-cards',
              classes: ['bg-white'],
            },
          ];
        }
      });
    }

    // Calculate total jobs for progress indicators
    this.totalJobs = this.jobStatuses.reduce((sum, status) => sum + status.count, 0);
  }

  getJobPercentage(count: number): number {
    return (count / this.totalJobs) * 100;
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

  getCardIconClass(title: string): string {
    const classMap: { [key: string]: string } = {
      'Products': 'icon-purple',
      'Styles': 'icon-blue',
      'Collections': 'icon-green',
      'Customers': 'icon-orange',
      'Users': 'icon-pink',
      'Jobs': 'icon-indigo',
      'Job Cards': 'icon-teal'
    };
    return classMap[title] || 'icon-gray';
  }

  getJobStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'Not Started': 'bi-play-circle',
      'In Progress': 'bi-arrow-clockwise',
      'Stuck': 'bi-exclamation-triangle',
      'Complete': 'bi-check-circle'
    };
    return iconMap[status] || 'bi-circle';
  }

  getJobStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'Not Started': 'status-pending',
      'In Progress': 'status-progress',
      'Stuck': 'status-warning',
      'Complete': 'status-success'
    };
    return classMap[status] || 'status-default';
  }

  getJobProgressClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'Not Started': 'progress-pending',
      'In Progress': 'progress-active',
      'Stuck': 'progress-warning',
      'Complete': 'progress-success'
    };
    return classMap[status] || 'progress-default';
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
