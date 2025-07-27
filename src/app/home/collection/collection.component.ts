import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Company } from 'src/models/Company';
import { Product } from 'src/models/Product';
import { User } from 'src/models/user.model';
import { CollectionService } from 'src/services/collection.service';
import { ShopService } from 'src/services/shop.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
})
export class CollectionComponent {
  companyId = '';
  collectionId = '';
  type = '';
  company?: Company;
  products: Product[] = [];
  user?: User;
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private collectionService: CollectionService,
    private router: Router,
    private shopService: ShopService,
    private uxService: UxService
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.companyId = r['companyId'];
      this.collectionId = r['collectionId'];
      this.type = r['type'] || 'Category';
      this.getProducts();
      userService.userObservable?.subscribe((user) => {
        this.user = user;
      });
    });
  }
  getProducts() {
    this.collectionService
      .collectionItems(this.collectionId, this.companyId, this.type)
      .subscribe((data) => {
        if (data && data.length) {
          this.products = data;
        }
      });
  }
  onShare() {
    this.uxService.onShare(this.collectionId, '');
  }
}
