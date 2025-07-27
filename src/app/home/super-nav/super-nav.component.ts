import { Component } from '@angular/core';

@Component({
  selector: 'app-super-nav',
  templateUrl: './super-nav.component.html',
  styleUrls: ['./super-nav.component.scss'],
})
export class SuperNavComponent {
  menu = [
    {
      name: 'Dashboard',
      link: '/super/admin',
      icon: 'bi bi-house-door',
    },
    // users, companies, products, orders, payments, reports
    {
      name: 'Users',
      link: '/super/admin/users',
      icon: 'bi bi-person',
    },
    {
      name: 'Companies',
      link: '/super/admin/companies',
      icon: 'bi bi-building',
    },
    {
      name: 'Products',
      link: '/super/admin/products',
      icon: 'bi bi-box',
    },
    {
      name: 'Orders',
      link: '/super/admin/orders',
      icon: 'bi bi-cart',
    },
    {
      name: 'Payments',
      link: '/super/admin/payments',
      icon: 'bi bi-currency-dollar',
    },
    {
      name: 'Reports',
      link: '/super/admin/reports',
      icon: 'bi bi-bar-chart',
    },
    {
      name: 'Settings',
      link: '/super/admin/settings',
      icon: 'bi bi-gear',
      show: false,
      children: [
        {
          name: 'Clean Up Images',
          link: '/super/admin/clean-up-images',
          icon: 'bi bi-trash',
        },
      ],
    },
    {
      name: 'Logout',
      link: '/super/admin/logout',
      icon: 'bi bi-box-arrow-right',
    },
  ];
  toggleMenu(item:any) {
    if (item.children) {
      item.show = !item.show;
    }
  }
}
