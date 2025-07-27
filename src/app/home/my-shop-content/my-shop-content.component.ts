import { Component } from '@angular/core';
import { Company } from 'src/models/Company';
import { ShopService } from 'src/services/shop.service';

@Component({
  selector: 'app-my-shop-content',
  templateUrl: './my-shop-content.component.html',
  styleUrls: ['./my-shop-content.component.scss'],
})
export class MyShopContentComponent {
  company?: Company;
  constructor(private shopService: ShopService) {
    this.shopService.$shop.subscribe((shop) => {
      if (shop) this.company = shop;
    });
  }
}
