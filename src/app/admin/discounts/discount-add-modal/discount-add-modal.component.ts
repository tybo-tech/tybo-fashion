import { Component, EventEmitter, Output } from '@angular/core';
import {
  DiscountType,
  discountTypesOptions,
  ISelectDiscountType,
} from '../IDiscount';
import {
  initOtherInfo,
  OTHER_TYPES,
  OtherInfo,
} from 'src/models/other-info.model';
import { User } from 'src/models/user.model';
import { UserService } from 'src/services/user.service';
import { OtherInfoService } from 'src/services/other-info.service';
import { Router } from '@angular/router';
import { Discount, DiscountService, initDiscount } from 'src/services/discounts.service';

@Component({
  selector: 'app-discount-add-modal',
  templateUrl: './discount-add-modal.component.html',
  styleUrls: ['./discount-add-modal.component.scss'],
})
export class DiscountAddModalComponent {
    @Output() onClose = new EventEmitter<any>();
  
  discountTypesOptions: ISelectDiscountType[] = discountTypesOptions;
  // discount: IDiscount = initDiscount();
  user?: User;
  discount? : Discount ;
  constructor(
    private userService: UserService,
    private router: Router,
    private discountService: DiscountService
  ) {
    this.userService.userObservable?.subscribe((user) => {
      this.user = user;
      if (this.user) {
        this.discount = initDiscount(this.user.CompanyId);
      }
    });
  }
  selectDiscountType(item: ISelectDiscountType) {
    if(!this.discount) return;
    this.discountTypesOptions.map((option) => (option.className = ''));
    item.className = 'active';
    this.discount.DiscountType = item.value as DiscountType;
  }

  next() {
    this.discountTypesOptions.map((option) => (option.className = ''));
   this.discountService.save(this.discount).subscribe((data) => {
      if (data && data.Id) {
        this.discount = data;
        this.router.navigate([
          '/store/admin/discount/' + this.discount.Id + '/edit',
        ]);
      }
   });
  }
}
