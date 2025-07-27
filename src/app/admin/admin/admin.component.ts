import { Component, OnInit } from '@angular/core';
import { UxModel } from 'src/models/ux.model';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
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
  current_url: any;
  ux?: UxModel;
  defaultConfirm = 'Are you sure you want to continue?';

  constructor(private userService: UserService, public uxService: UxService) {
    this.current_url = window.location.pathname;
    uxService.$ux.subscribe((data) => {
      this.ux = data;
      this.ux.Toast && console.log(this.ux?.Toast);
    });
  }
  ngOnInit(): void {
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
