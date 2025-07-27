import { Component } from '@angular/core';
import { OTHER_TYPES, OtherInfo } from 'src/models/other-info.model';
import { discountTypesOptionMap } from '../IDiscount';
import { OtherInfoService } from 'src/services/other-info.service';
import { UxService } from 'src/services/ux.service';
import { User } from 'src/models/user.model';
import { UserService } from 'src/services/user.service';
import { Discount, DiscountService } from 'src/services/discounts.service';

@Component({
  selector: 'app-discounts',
  templateUrl: './discounts.component.html',
  styleUrls: ['./discounts.component.scss'],
})
export class DiscountsComponent {
  showAddDiscount = false;
  searchQuery = '';
  discountTypesOptionMap:any = discountTypesOptionMap
  discounts: Discount[] = [];
  user?: User;
  constructor(
    private uxService: UxService,
    private userService: UserService,
    private discountService: DiscountService
  ) {
    this.getUser();
  }
  getUser() {
    this.userService.userObservable?.subscribe((user) => {
      this.user = user;
      user && this.getDiscounts();
    });
  }
  getDiscounts() {
    this.user &&
    this.discountService
      .getByParentId(this.user.CompanyId)
      .subscribe((data) => {
        this.discounts = data;
      });
  }
}
