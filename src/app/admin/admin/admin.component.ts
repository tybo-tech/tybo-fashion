import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

type BottomNavKey = 'home' | 'jobs' | 'customers';
import { UxModel } from 'src/models/ux.model';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

declare global {
  interface Window {
    bootstrap?: {
      Offcanvas: {
        getInstance(el: HTMLElement): { hide(): void } | null;
      };
    };
  }
}

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
  ux?: UxModel;
  defaultConfirm = 'Are you sure you want to continue?';
  currentUrl = '';
  private navSub?: Subscription;

  constructor(
    private userService: UserService,
    public uxService: UxService,
    private router: Router
  ) {
    uxService.$ux.subscribe((data) => {
      this.ux = data;
      this.ux.Toast && console.log(this.ux?.Toast);
    });
    this.navSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.closeOffcanvas();
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
  clearToast() {
    this.uxService.clear_toast();
  }
  closeOffcanvas() {
    const el = document.getElementById('adminOffcanvas');
    if (el && window.bootstrap) {
      const instance = window.bootstrap.Offcanvas.getInstance(el);
      if (instance) instance.hide();
    }
  }

  // Bottom nav: Jobs stays active through job/job-item routes, Customers
  // through customer routes. Home is exact.
  isBottomActive(key: BottomNavKey): boolean {
    if (key === 'home') return this.currentUrl === '/store/admin' || this.currentUrl === '/store/admin/';
    if (key === 'jobs') return this.currentUrl.startsWith('/store/admin/job');
    return this.currentUrl.startsWith('/store/admin/customer');
  }

  goBottom(key: BottomNavKey): void {
    const targets: Record<BottomNavKey, string> = {
      home: '/store/admin',
      jobs: '/store/admin/jobs',
      customers: '/store/admin/customers',
    };
    this.router.navigate([targets[key]]);
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

export interface IMenuGroup {
  name: string;
  items: IMenu[];
}
export interface IMenu {
  name: string;
  icon: string;
  url: string;
}
