import { Component, OnInit } from '@angular/core';
import { Company } from 'src/models/Company';
import { ShopService } from 'src/services/shop.service';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.scss'],
})
export class ShopsComponent implements OnInit {
  shops?: Company[];
  loaded = false;

  constructor(private shopService: ShopService) {}

  ngOnInit(): void {
    this.shopService.active().subscribe({
      next: (data) => {
        this.shops = data && data.length ? data : [];
        this.loaded = true;
      },
      error: () => {
        this.shops = [];
        this.loaded = true;
      },
    });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.svg';
  }
}
