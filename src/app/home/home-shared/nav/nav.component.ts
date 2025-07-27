import { Component, Input } from '@angular/core';
import { User } from 'src/models/user.model';
import { IMenu } from 'src/models/util.menu.model';
import { UX_MODALS } from 'src/models/ux.model';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  show_nav = false;
  @Input()
  logo_url: string = `https://files.tybofashion.co.za/site/tybo-fashion-logo.png`;
  @Input() logo_url_to: string = '/';
  navItems: IMenu[] = [
    {
      name: 'Home',
      link: '/',
      icon: 'bi bi-house-door',
    },
    {
      name: 'Explore Shops',
      link: '/home/shops',
      icon: 'bi bi-shop',
    },
    {
      name: 'Collections',
      link: '/home/collections',
      icon: 'bi bi-collection',
    },
    {
      name: 'My Profile',
      icon: 'bi bi-person',
      id: UX_MODALS.profile,
    },
    {
      name: 'My Orders',
      link: '/home/my-orders',
      icon: 'bi bi-cart',
      id: UX_MODALS.profile_orders,
    },
    //Favorites
    {
      name: 'Favorites',
      link: '/home/favorites',
      icon: 'bi bi-heart',
      id: UX_MODALS.favorites,
    },
    {
      name: 'About Us',
      link: '/home/about-us',
      icon: 'bi bi-info-circle',
    },
    {
      name: 'Contact Us',
      link: '/home/contact-us',
      icon: 'bi bi-telephone',
    },
  ];
  nav_open = false;
  user?: User;
  constructor(private userService: UserService) {
    userService.userObservable?.subscribe((u) => {
      this.user = u;
    });
  }
}
