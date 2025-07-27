import { Component, OnInit } from '@angular/core';
import { Company } from 'src/models/Company';
import { ShopService } from 'src/services/shop.service';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.scss']
})
export class ShopsComponent implements OnInit {
  shops?: Company[];

  constructor(private shopService: ShopService) {}

  ngOnInit(): void {
    this.shopService.active().subscribe(data => {
      if (data && data.length > 0) {
        this.shops = data;
      }
    });
  }
}
