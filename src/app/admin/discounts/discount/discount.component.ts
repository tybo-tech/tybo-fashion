import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OtherInfoService } from 'src/services/other-info.service';
import { UserService } from 'src/services/user.service';
import {
  discountMethods,
  discountTypesOptions,
  discountValueTypes,
  ISelectDiscountType,
} from '../IDiscount';
import { OtherInfo } from 'src/models/other-info.model';
import { User } from 'src/models/user.model';
import { UxService } from 'src/services/ux.service';
import {
  Discount,
  DiscountService,
  initDiscount,
} from 'src/services/discounts.service';
import { ICollection } from 'src/models/Category';
import { Category, CategoryService } from 'src/services/category.service';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss'],
})
export class DiscountComponent {
  discountTypesOptions: ISelectDiscountType[] = discountTypesOptions;
  discountMethods = discountMethods.map((method) => {
    return { label: method, value: method };
  });

  discountValueTypes = discountValueTypes.map((method) => {
    return { label: method + ' Off', value: method };
  });

  roles = ['Admin', 'User'];
  id = '';
  actionType = '';
  prevPage = '/store/admin/discounts';
  discount?: Discount;
  user?: User;
  categories: Category[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private uxService: UxService,
    private discountService: DiscountService,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.id = params['id'];
      this.actionType = params['action'];
      this.getUser();
      this.getItem();
      this.loadCategories();
    });
  }
  get collectionsOptions(): { value: string; label: string }[] {
    return this.categories.map((category) => {
      return { value: category.CategoryId + '', label: category.Name };
    });
  }
  loadCategories(skipLoad = false) {
    if (!skipLoad) this.uxService.load(true);
    this.user &&
      this.categoryService
        .listNamesAndIds(this.user.CompanyId)
        .subscribe((data) => {
          if (data && data.length) {
            this.categories = data;
          }
          if (!skipLoad) this.uxService.load(false);
        });
  }
  getItem() {
    if (!this.user) return;
    if (this.id === 'add') {
      this.discount = initDiscount(this.user.CompanyId);
      return;
    }
    this.user &&
      this.id &&
      this.discountService.get(this.id).subscribe((data) => {
        this.discount = data;
      });
  }

  getUser() {
    this.userService.userObservable?.subscribe((user) => {
      this.user = user;
    });
  }

  get discountTypesOptionsValueLabel() {
    return this.discountTypesOptions.map((option) => {
      return { label: option.label, value: option.value };
    });
  }

  get discountType() {
    return (
      this.discountTypesOptions.find(
        (type) => type.value === this.discount?.DiscountType
      )?.label || ''
    );
  }

  save() {
    if (this.discount) {
      if (!this.validateDates(this.discount.StartDate, this.discount.EndDate)) {
        return;
      }
      this.discountService.save(this.discount).subscribe((data) => {
        if (data && data.Id) {
          this.uxService.show_toast('Discount saved successfully', 'Discount');
          this.router.navigate([this.prevPage]);
        }
      });
    }
  }
  validateDates(startDate: string, endDate: string) {
    // Dates are required
    // Start date should be less than end date
    // Start date should be greater than today
    // End date should be greater than today

    if (!startDate || !endDate) {
      this.uxService.show_toast('Start and End Dates are required', 'Error', [
        'bg-red',
        'text-white',
      ]);
      return false;
    }
    // if (new Date(startDate) > new Date(endDate)) {
    //   this.uxService.show_toast(
    //     'Start Date should be less than End Date',
    //     'Error',
    //     ['bg-red', 'text-white']
    //   );
    //   return false;
    // }
    // if (new Date(startDate) < new Date()) {
    //   this.uxService.show_toast(
    //     'Start Date should be greater than today',
    //     'Error',
    //     ['bg-red', 'text-white']
    //   );
    //   return false;
    // }
    if (new Date(endDate) < new Date()) {
      this.uxService.show_toast(
        'End Date should be greater than today',
        'Error',
        ['bg-red', 'text-white']
      );
      return false;
    }
    return true;
  }
  delete() {
    if (this.discount) {
      if (!confirm('Are you sure you want to delete this discount?')) {
        return;
      }
      this.discountService
        .delete(this.discount?.Id?.toString() || '')
        .subscribe((data) => {
          if (!data) {
            this.uxService.show_toast(
              'Discount deleted successfully',
              'Discount'
            );
            this.router.navigate([this.prevPage]);
          }
        });
    }
  }
}
