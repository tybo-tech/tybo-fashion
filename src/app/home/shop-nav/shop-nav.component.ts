import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Company } from 'src/models/Company';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-shop-nav',
  templateUrl: './shop-nav.component.html',
  styleUrls: ['./shop-nav.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ShopNavComponent implements OnInit {
  @Input() company?: Company;

  nav_open = false;
  UX_MODALS = UX_MODALS;
  job?: Job;
  cart_count = 0;
  navItems: { name: string; url: string }[] = [];
  guest: { name: string; url: string }[] = [];
  logged_in_user: { name: string; url: string }[] = [];
  user?: User;
  constructor(
    private jobService: JobService,
    private uxService: UxService,
    private userService: UserService
  ) {
    jobService.$job.subscribe((job) => {
      if (job) {
        this.job = job;
        this.cart_count = jobService.cart_count(this.job);
      }else{
        this.cart_count = 0;
        this.job = undefined;
      }
    });
    userService.userObservable?.subscribe((u) => {
      this.user = u;
    });
  }
  ngOnInit(): void {
    this.navItems = [
      {
        name: `${this.get_icon('bi-house')} Home`,
        url: '/',
      },
      {
        name: `${this.get_icon('bi-shop')} Shop`,
        url: '/' + this.company?.Slug,
      },
    
    ];

    this.guest = [
      {
        name: `${this.get_icon('bi-person')} Sign in`,
        url: '/home/sign-in',
      },
      {
        name: `${this.get_icon('bi-person-plus')} Sign up`,
        url: '/home/sign-up',
      },
    ];

    this.logged_in_user = [
      {
        name: `${this.get_icon('bi-person')} My Account`,
        url: '/home/sign-in',
      }
    ];
  }
  get_icon(className: string) {
    return `<i class="bi ${className}"></i>`;
  }
  toggle_cart() {
    this.uxService.show_cart_modal();
  }
  open(modal: string) {
    this.uxService.show_modal(modal);
  }
  logout() {
    this.userService.logout(undefined);
    location.reload();
  }
}
