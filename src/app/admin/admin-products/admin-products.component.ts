import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Company } from 'src/models/Company';
import { HeroHeaderData } from 'src/models/HeroHeaderData';
import { Product } from 'src/models/Product';
import { Category } from 'src/services/category.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
})
export class AdminProductsComponent {
  categoryId = '';
  company?: Company;
  products: Product[] = [];
  category?: Category;
  heroHeaderData?: HeroHeaderData;

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private userService: UserService
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.categoryId = r['categoryId'];
      if (this.categoryId) {
        this.getByCategory();
      } else {
        this.getProducts();
      }
    });
  }
  get companyId() {
    return this.userService.getUser?.CompanyId;
  }
  getProducts() {
    if (!this.companyId) {
      alert('Please select Login to a company');
      return;
    }
    this.productService.products(this.companyId).subscribe((data) => {
      if (data && data.length) {
        this.products = data;
        this.setHeroHeaderData();
      }
    });
  }
  getByCategory() {
    this.productService.getByCategory(this.categoryId).subscribe((data) => {
      if (data && data.CategoryId) {
        this.category = data;
        this.products = data.Products || [];
        this.company = data.Company;
        this.setHeroHeaderData();
      }
    });
  }

  setHeroHeaderData() {
    this.heroHeaderData = {
      title: this.category?.Name || this.company?.Name || 'Products',
      description:
        this.category?.Description ||
        this.company?.Description ||
        'Explore our products',
      image:
        this.category?.ImageUrl || this.company?.Metadata?.AboutImage || '',
      slug: '',
    };
  }
}
