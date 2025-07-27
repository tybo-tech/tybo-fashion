import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Company } from 'src/models/Company';
import { ShopService } from 'src/services/shop.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-collection-items',
  templateUrl: './collection-items.component.html',
  styleUrls: ['./collection-items.component.scss']
})
export class CollectionItemsComponent {
  shopId = '';
  category = '';
  company?: Company;
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private shopService: ShopService
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.shopId = r['id'];
      this.category = r['category'];
      console.log(this.category, this.shopId);
      shopService.$shop.subscribe((shop) => {
        if(shop?.Slug){
          this.shopId = shop.Slug;
          this.load();
        }
      });
    });
  }
  load() {
    this.shopService
      .getShop({
        ShopId: this.shopId,
        IncludeCategories: false,
        CategoriesId: this.category,
        
      })
      .subscribe((data) => {
        if (data.CompanyId) {
          this.company = data;
        }
      });
  }
}
