import { Component } from '@angular/core';
import { Company, CompanyMetadata } from 'src/models/Company';
import { Image, initImage } from 'src/models/Image';
import { ShopService } from 'src/services/shop.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  initImage: Image = initImage();

  user = this.userService.getUser;
  company?: Company;
  constructor(
    private userService: UserService,
    private shopService: ShopService
  ) {
    if (this.user) {
      shopService.getCompany(this.user.CompanyId).subscribe((company) => {
        this.company = company;
        if (!this.company.Metadata) {
          this.company.Metadata = {
            Slides: [],
            Facebook: '',
            Twitter: '',
            AboutTitle: '',
            Instagram: '',
            About: '',
            AboutImage: '',
            Testimonials: [],
            Stat: [],
          };
        }
      });
    }
  }
  getImage(url: string): Image {
    return { ...this.initImage, Url: url };
  }


  save() {
    this.company &&
      this.company.Metadata &&
      this.shopService.save(this.company).subscribe((company) => {
        this.company = company;
      });
  }
}
