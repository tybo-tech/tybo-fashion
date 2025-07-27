import { Component, Input, OnInit } from '@angular/core';
import { Product } from 'src/models/Product';
import { ProductService } from 'src/services/product.service';

@Component({
  selector: 'app-new-in',
  templateUrl: './new-in.component.html',
  styleUrls: ['./new-in.component.scss'],
})
export class NewInComponent implements OnInit {
  @Input({ required: true }) limit!: number;
  @Input() startFrom = 0;
  @Input() slug = '';
  @Input() companyId = '';
  products?: Product[];
  constructor(private productService: ProductService) {}
  ngOnInit(): void {
    this.productService
      .newIn(this.limit, this.companyId)
      .subscribe((products) => {
        if (products) {
          // Sub array of products from startFrom
          this.productService.updateProductListState(products);
          this.products = products.slice(this.startFrom);
        }
      });
  }
  get showMoreUrl() {
    return `/home/products/${this.slug}`;
  }
}
