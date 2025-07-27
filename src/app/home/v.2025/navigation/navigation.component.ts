import { Component, OnInit } from '@angular/core';

interface NavItem {
  title: string;
  path?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  cartItemsCount: number = 5;
  wishlistItemsCount: number = 3;
  isCollapsed: boolean = true;

  navItems: NavItem[] = [
    {
      title: 'Women',
      children: [
        { title: 'Dresses', path: '#' },
        { title: 'Tops', path: '#' },
        { title: 'Jeans', path: '#' },
        { title: 'Activewear', path: '#' },
        { title: 'divider' },
        { title: 'New Arrivals', path: '#' },
        { title: 'Sale', path: '#' }
      ]
    },
    {
      title: 'Men',
      children: [
        { title: 'Shirts', path: '#' },
        { title: 'T-Shirts', path: '#' },
        { title: 'Pants', path: '#' },
        { title: 'Jackets', path: '#' },
        { title: 'divider' },
        { title: 'New Arrivals', path: '#' },
        { title: 'Sale', path: '#' }
      ]
    },
    {
      title: 'New Arrivals',
      path: '#'
    },
    {
      title: 'Brands',
      children: [
        { title: 'Premium', path: '#' },
        { title: 'Contemporary', path: '#' },
        { title: 'Streetwear', path: '#' }
      ]
    },
    {
      title: 'Sale',
      path: '#'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  toggleMenu(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
