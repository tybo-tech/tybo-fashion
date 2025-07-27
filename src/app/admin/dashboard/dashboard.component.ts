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
      classes: ['bg-white', 'text-dark'],
    },
    {
      name: 'In Progress',
      count: 20,
      link: '/store/admin/jobs/in-progress',
      classes: ['bg-white', 'text-dark'],
    },
    {
      name: 'Stuck',
      count: 2,
      link: '/store/admin/jobs/stuck',
      classes: ['bg-white', 'text-dark'],
    },
    {
      name: 'Complete',
      count: 5,
      link: '/store/admin/jobs/complete',
      classes: ['bg-success', 'text-white'],
    },
  ];

  shortcuts = [
    { label: 'Add Job', route: '/store/admin/jobs/add-job' },
    { label: 'Add Product', route: '/store/admin/products/add-product' },
    { label: 'Add Customer', route: '/store/admin/customers/add-customer' },
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
        if (this.counts.CustomerCount) {
          this.cards = [
            {
              title: 'Products',
              count: this.counts.ProductCount,
              link: '/store/admin/products',
              classes: ['bg-white', 'text-dark'],
            },
            //Catergories
            {
              title: 'Styles',
              count: this.counts.CategoryCount,
              link: '/store/admin/styles',
              classes: ['bg-white', 'text-dark'],
            },
            {
              title: 'Collections',
              count: this.counts.CollectionCount,
              link: '/store/admin/collections',
              classes: ['bg-white', 'text-dark'],
            },
            {
              title: 'Customers',
              count: this.counts.CustomerCount,
              link: '/store/admin/customers',
              classes: ['bg-white', 'text-dark'],
            },
            // USers
            {
              title: 'Users',
              count: this.counts.UserCount,
              link: '/store/admin/users',
              classes: ['bg-white', 'text-dark'],
            },
            //Jobs
            {
              title: 'Jobs',
              count: this.counts.JobCount,
              link: '/store/admin/jobs',
              classes: ['bg-white', 'text-dark'],
            },
            // Job cards
            {
              title: 'Job Cards',
              count: this.counts.JobItemCount,
              link: '/store/admin/job-cards',
              classes: ['bg-white', 'text-dark'],
            },
          ];
        }
      });
    }
  }

  ngOnInit(): void {
    // Fetch actual data here
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
