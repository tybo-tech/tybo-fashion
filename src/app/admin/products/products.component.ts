import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from 'src/constants/Constants';
import { IProductFilter } from 'src/models/IProductFilter';
import {
  Product,
} from 'src/models/Product';
import { User } from 'src/models/user.model';
import { CategoryService } from 'src/services/category.service';
import { OtherInfoService } from 'src/services/other-info.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';
import { VariationService } from 'src/services/variation.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent {
  products: Product[] = [];
  all_products: Product[] = [];
  show_add = false;
  query = '';
  new_name = '';
  user?: User;
  showOnline = '';
  stockType = '';
  isFeatured : 'Yes' | 'No' = 'No';
  totalStock = '';
  loading = false;
  Constants = Constants;
  constructor(
    private productService: ProductService,
    private router: Router,
    private userService: UserService,
    private categoryService: CategoryService,
    private variationService: VariationService,
    private uxService: UxService,
    private otherService: OtherInfoService<any>
  ) {
    this.userService.userObservable?.subscribe((user) => {
      this.user = user;
    });
    this.getList();
  }
  getList() {
    this.loading = true;
    this.productService.getProducts().subscribe((data) => {
      this.loading = false;
      this.products = data || [];
      this.all_products = data || [];
      this.products.map((x) => (x.Checked = false));
    });
  }

  filter() {
    if (!this.query) {
      this.products = this.all_products;
      return;
    }
    // Filter customers by name & Phone number
    this.products = this.all_products?.filter((product) => {
      return product.Name?.includes(this.query);
    });
  }
  add() {
    const p = this.productService.initProduct();
    p.Name = this.new_name;
    p.CompanyId = this.user?.CompanyId || '';
    this.productService.save(p).subscribe((data) => {
      if (data && data.ProductId)
        this.router.navigate(['/store/admin/product', data.ProductId]);
    });
  }

  onCheck(p: Product) {
    p.Checked = !p.Checked;
  }

  showOrShowAll(val: 0 | 1) {
    this.checked.forEach((item) => {
      item.ShowOnline = val + '';
      this.productService.getProduct(item.Id).subscribe((data) => {
        if (data?.Id) {
        }
      });
    });
  }

  toggleChecked(key: boolean) {
    this.products.map((x) => (x.Checked = key));
  }

  get checked() {
    return this.products.filter((x) => x.Checked) || [];
  }

  updateSelection() {
    const toUpdate: Product[] = [];
    this.checked.forEach((item) => {
      if (this.showOnline) item.ShowOnline = this.showOnline;
      if (this.stockType) item.StockType = this.stockType;
      if (this.isFeatured) item.IsFeatured = this.isFeatured;
      if (this.totalStock) item.TotalStock = this.totalStock;
      toUpdate.push(item);
    });
    this.loading = true;
    this.productService.updateRange(toUpdate).subscribe(
      (data) => {
        this.loading = false;
        if (data && data.length) {
          this.uxService.show_toast(
            toUpdate.length + ' Products updated',
            'You have successfully updated ' + toUpdate.length + ' products',
            ['bg-success', 'text-white']
          );
          this.toggleChecked(false);
          this.getList();
        } else {
          this.toggleChecked(false);
          this.loading = false;
          this.uxService.show_toast(
            'Error',
            'An error occurred while updating products',
            ['bg-danger', 'text-white']
          );
        }
      },
      (error) => {
        this.loading = false;
        this.uxService.show_toast(
          'Error occurred',
          'An error occurred while updating products',
          ['bg-danger', 'text-white']
        );
      }
    );
  }

  applyFilters(event: IProductFilter[]) {
    this.products = this.all_products;
    const isFeatured = event.find((x) => x.property === 'IsFeatured')?.value;

    const showOnline = event.find((x) => x.property === 'ShowOnline')?.value;

    if (isFeatured === 'Yes') {
      this.products = this.products.filter((x) => x.IsFeatured === 'Yes');
    }
    if (isFeatured === 'No') {
      this.products = this.products.filter((x) => x.IsFeatured === 'No');
    }
    if (showOnline === 'Yes') {
      this.products = this.products.filter((x) => x.ShowOnline === '1');
    }
    if (showOnline === 'No') {
      this.products = this.products.filter((x) => x.ShowOnline === '0');
    }
  }
}
