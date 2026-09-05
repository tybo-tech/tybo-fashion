import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from 'src/services/user.service';
import { IMenu, IMenuGroup } from '../layout/menu.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, OnDestroy {
  menu: IMenuGroup[] = [
    {
      name: 'Overview',
      items: [
        {
          name: 'Dashboard',
          icon: 'bi bi-house',
          url: '/store/admin',
        },
        {
          name: 'Settings',
          icon: 'bi bi-gear',
          url: '/store/admin/settings',
        },
      ],
    },
    {
      name: 'Products',
      items: [
        {
          name: 'Products',
          icon: 'bi bi-box',
          url: '/store/admin/products',
        },
        {
          name: 'Categories',
          icon: 'bi bi-tags',
          url: '/store/admin/categories',
        },
        // {
        //   name: 'Collections',
        //   icon: 'bi bi-grid-3x3-gap',
        //   url: '/store/admin/collections',
        // },
        //Work gallery
        {
          name: 'Work Gallery',
          icon: 'bi bi-images',
          url: '/store/admin/work-gallery',
        },
      ],
    },
    {
      name: 'Orders',
      items: [
        {
          name: 'Jobs',
          icon: 'bi bi-briefcase',
          url: '/store/admin/jobs',
        },
        {
          name: 'Discounts',
          icon: 'bi bi-percent',
          url: '/store/admin/discounts',
        },
        {
          name: 'Jobs Cards',
          icon: 'bi bi-briefcase',
          url: '/store/admin/job-cards',
        },
      ],
    },
    {
      name: 'People',
      items: [
        {
          name: 'Users',
          icon: 'bi bi-person',
          url: '/store/admin/users',
        },

        {
          name: 'Customers',
          icon: 'bi bi-people',
          url: '/store/admin/customers',
        },
      ],
    },
  ];
  user = this.userService.getUser;
  currentUrl = '';
  private navSub?: Subscription;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.navSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    });
  }
  ngOnInit(): void {
    this.currentUrl = this.router.url;
    const slug = this.user?.Company?.Slug || this.user?.Company?.CompanyId;
    if (slug)
      this.menu[0].items.push({
        name: 'My Store',
        icon: 'bi bi-shop',
        url: '/' + slug,
      });

    this.user &&
      this.userService.getUsers(this.user.CompanyId).subscribe((data) => {
        this.userService.updateUserListState(data);
      });
  }
  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }
  logout() {
    const slug = this.user?.Company?.Slug;
    this.userService.logout(undefined);
    if (!slug) location.href = '/';
    else location.href = '/' + slug;
  }
}
