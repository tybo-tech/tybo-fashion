import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Company } from 'src/models/Company';
import { ShopService } from 'src/services/shop.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-my-shop',
  templateUrl: './my-shop.component.html',
  styleUrls: ['./my-shop.component.scss']
})
export class MyShopComponent {
  shopId = ''
  whatsappLink = ''
  company?: Company;
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private shopService: ShopService,
    private title: Title,
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.shopId = r['id'];
      this.load();
    });
  }
  load() {
    this.shopService
      .getShop({
        ShopId: this.shopId,
        IncludeCategories: true,
        IncludeFeaturedCustomProducts: true,
        IncludeFeaturedStockProducts: true,
      })
      .subscribe((data) => {
        if (data.CompanyId) {
          this.company = data;
          if (this.company.Phone) {
            const m =
              `Hello, I would like to book a consultation with a fashion designer/personal style curator`
                .split(' ')
                .join('%20');
            this.company.whatsappLink = `https://wa.me/${this.company.Phone}?text=${m}`;
          }
          this.shopService.update_shop_state(data);
       this.title.setTitle(`Welcome to ${this.company.Name} | Tybo Fashion`);
        }
      });
  }
}
