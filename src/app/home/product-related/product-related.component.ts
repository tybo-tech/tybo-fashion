import { Component, Input, OnInit } from '@angular/core';
import { Product } from 'src/models/Product';

@Component({
  selector: 'app-product-related',
  templateUrl: './product-related.component.html',
  styleUrls: ['./product-related.component.scss'],
})
export class ProductRelatedComponent implements OnInit {
  @Input() products: Product[] = [];
  @Input() product?: Product;
  ngOnInit(): void {
    if (this.product) {
      this.products = this.products.filter((p) => p.Id !== this.product?.Id);
    }
  }

  url(p: Product) {
    /**
     * '/',
          product.Company.Slug,
          'product',
          products[0].Slug || products[0].ProductSlug || products[0].Id
     * 
     */
    return `/${this.company_slug}/product/${this.product_slug(p)}`;
  }

  get company_slug() {
    return this.product?.Company?.Slug || '';
  }

  product_slug(p: Product) {
    return p.Slug || p.ProductSlug || p.Id || '';
  }
}
