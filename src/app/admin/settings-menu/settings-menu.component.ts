import { Component } from '@angular/core';
import { Company } from 'src/models/Company';
import { User } from 'src/models/user.model';
import { IMenu, IMenuGroup } from 'src/models/util.menu.model';
import { ShopService } from 'src/services/shop.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.scss'],
})
export class SettingsMenuComponent {
  menuItems: IMenuGroup[] = [];
  company?: Company;
  user?: User;
  modal = '';
  constructor(
    private userService: UserService,
    private shopService: ShopService,
    private uxService: UxService
  ) {
    this.user = userService.getUser;
    if (this.user) {
      shopService.getCompany(this.user.CompanyId).subscribe((company) => {
        this.company = company;
        this.loadMenu();
      });
    }
  }
  loadMenu() {
    if (!this.company) return;
    this.menuItems = [
      {
        name: 'Company Details',
        items: [
          {
            name: 'Company Branding',
            description: '',
            count: 0,
            link: 'branding',
            icon: 'bi bi-palette',
          },
          {
            name: 'Company Address',
            description: '',
            count: 0,
            link: 'address',
            icon: 'bi bi-geo-alt',
          },
          {
            name: 'Contact details',
            description: '',
            count: 0,
            link: 'contact',
            icon: 'bi bi-telephone',
          },
        ],
      },
      {
        name: 'Website Settings',
        items: [
          {
            name: 'About ' + this.company.Name,
            description: '',
            count: 0,
            link: 'about',
            icon: 'bi bi-info-circle',
          },
          {
            name: 'Testimonials',
            description: '',
            count: this.meta?.Testimonials.length || 0,
            link: 'testimonials',
            icon: 'bi bi-chat-left-text',
          },
          {
            name: 'Our statistics',
            description: '',
            count: this.meta?.Stat.length || 0,
            link: 'stat',
            icon: 'bi bi-graph-up',
          },
        ],
      },
      {
        name: 'Sizing & Orders',
        items: [
          {
            name: 'System Measurements',
            description: '',
            count: 0,
            link: 'measurements',
            icon: 'bi bi-rulers',
          },
          {
            name: 'System Sizes',
            description: '',
            count: 0,
            link: 'sizes',
            icon: 'bi bi-arrows-expand-vertical',
          },
          {
            name: 'Order settings',
            description: '',
            count: 0,
            link: 'order',
            icon: 'bi bi-cart',
          },
        ],
      },
      {
        name: 'Promotions & Socals',
        items: [
          {
            name: 'Website Banners',
            description: '',
            count: this.meta?.Slides.length || 0,
            link: 'banners',
            icon: 'bi bi-image',
          },

          {
            name: 'Social Links',
            description: '',
            count: 0,
            link: 'social',
            icon: 'bi bi-link-45deg',
          },
        ],
      },
    ];
  }
  save() {
    this.company &&
      this.company.Metadata &&
      this.shopService.save(this.company).subscribe((company) => {
        this.company = company;
        this.uxService.show_toast('Settings saved successfully', 'Success', [
          'bg-success',
        ]);
      });
  }
  get meta() {
    return this.company?.Metadata;
  }
}
