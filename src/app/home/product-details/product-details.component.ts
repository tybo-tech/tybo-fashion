import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Company } from 'src/models/Company';
import { Product } from 'src/models/Product';
import { Job } from 'src/models/job.model';
import { IMeasurement } from 'src/models/measurement.model';
import { UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { ProductService } from 'src/services/product.service';
import { ShopService } from 'src/services/shop.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent implements OnInit {
  shopId = '';
  productId = '';
  quantity = 1;
  product?: Product;
  isCustom = false;
  whatsappLink: string = '';
  job?: Job;
  errors = {
    size: '',
  };
  size = '';
  measurements: IMeasurement[] = [];
  liked = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private productService: ProductService,
    private shopService: ShopService,
    private jobService: JobService,
    private uxService: UxService,
    private title: Title,
    private meta: Meta
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.shopId = r['shop'];
      this.productId = r['product'];
      this.load();
      shopService.$shop.subscribe((shop) => {
        this.whatsappLink = shop?.whatsappLink || '';
      });

      jobService.$job.subscribe((job) => {
        if (job) this.job = job;
      });
    });
  }
  ngOnInit(): void {}
  load() {
    this.productService.getProduct(this.productId).subscribe((data) => {
      if (data.Id && data.Company) {
        this.product = data;
        // if (!this.product.Sizes) this.product.Sizes = [];
        this.liked = this.userService.is_liked(this.product);
        this.isCustom = data.IsJustInTime === 'Custom'; // "Ready to wear" or "Custom"
        this.title.setTitle(
          `${data.Name} - Buy from ${data.Company.Name} | Tybo Fashion`
        );
        this.meta.updateTag({
          name: 'description',
          content: data.Description || data.Name,
        });
      }
    });
  }
  addToCart(product: Product) {
    this.clearToast();
    if (!this.size) {
      this.errors.size = 'Please select a size';
      this.clearToastAfter5();
      return;
    }
    // Cart and orders in Tybo Fashion are jobs
    // And from job we can create invoice
    // Where job items are derived from product
    product.Company &&
      this.jobService.add_to_cart(
        product.Company,
        product,
        this.size,
        this.quantity,
        this.measurements
      );
    this.uxService.show_modal(UX_MODALS.cart);
  }
  clearToast() {
    this.errors.size = '';
  }
  clearToastAfter5() {
    setTimeout(() => {
      this.clearToast();
    }, 5000);
  }
  on_like() {
    if (!this.product) return;
    if (!this.userService.getUser) {
      this.uxService.show_toast(
        'Please login or sign up to like this product',
        'Members Only'
      );
      // this.open(this.UX_MODALS.login);
      return;
    }
    this.userService.on_like(this.product);
    this.liked = !this.liked;
    this.uxService.show_toast(
      this.liked ? 'Added to favorites' : 'Removed from favorites',
      ''
    );
  }
}
