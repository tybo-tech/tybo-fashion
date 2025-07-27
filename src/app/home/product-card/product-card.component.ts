import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product } from 'src/models/Product';
import { SmartModal } from '../SmartModal';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';
import { CommonModule } from '@angular/common';
import { ProductService } from 'src/services/product.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [ProductService],
})
export class ProductCardComponent extends SmartModal implements OnInit {
  @Input({ required: true }) product!: Product;
  @Input({ required: true }) companySlug!: string;
  @Input() isAdminUser = false;
  @Output() productPinned = new EventEmitter<Product>();
  liked = false;
  constructor(
    uxService: UxService,
    userService: UserService,
    private productService: ProductService
  ) {
    super(uxService, userService);
  }
  ngOnInit(): void {
    this.liked = this.userService.is_liked(this.product);
  }
  onLike(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.userService.on_like(this.product);
    this.liked = this.userService.is_liked(this.product);
  }
  onPin(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.product.IsFeatured = this.product.IsFeatured === 'Yes' ? 'No' : 'Yes';
    this.productService.updateFeatured(this.product).subscribe((data) => {
      if (data && data.featured) {
        this.uxService.show_toast(
          this.product.IsFeatured === 'Yes'
            ? 'Product Pinned'
            : 'Product Unpinned',
          'success'
        );
        this.productPinned.emit(this.product);
      } else {
        this.uxService.show_toast(
          'Sorry, something went wrong, please refresh the page and try again',
          'error'
        );
      }
    });
  }
  get url() {
    return this.isAdminUser ? this.adminUrl : this.homeUrl;
  }

  /// /home/products/slug/productId
  get homeUrl() {
    return `/product/${this.product.Slug}`;
  }

  ///store/admin/product/d2e12308-e7e9-11ef-b398-0cc47a9a9bea
  get adminUrl() {
    return `/store/admin/product/${this.product.ProductId}`;
  }
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'path-to-default-image.jpg';
  }
  // get url() {
  //   return `/${this.companySlug}/product/${this.product.ProductId}`;
  // }
}
