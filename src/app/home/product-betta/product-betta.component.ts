import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ICollection } from 'src/models/Category';
import { IMeasurement } from 'src/models/measurement.model';
import { OtherInfo } from 'src/models/other-info.model';
import { Product } from 'src/models/Product';
import { CollectionService } from 'src/services/collection.service';
import { JobService } from 'src/services/job.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';
import { Variation } from 'src/services/variation.service';

@Component({
  selector: 'app-product-betta',
  templateUrl: './product-betta.component.html',
  styleUrls: ['./product-betta.component.scss'],
})
export class ProductBettaComponent implements OnInit, OnDestroy {
handleVariationChange($event: Variation) {
console.log('Variation changed:', $event);

}
  productId!: string;
  product?: Product;
  imageClass = 'slide-from-right';
  index = 0;
  loading = true;
  private intervalId?: number;
  private destroy$ = new Subject<void>();
  private routeSubscription?: Subscription;
  categories: OtherInfo<ICollection>[] = [];
  liked = false;

  // Add to cart
  measurements: IMeasurement[] = [];
  size = '';
  quantity = 1;
  errors = {
    size: '',
  };
  links: { name: string; link: string }[] = [
    {
      link: '/home',
      name: 'Home',
    },
    {
      link: '/home/products',
      name: 'Products',
    },
  ];
  constructor(
    private productService: ProductService,
    private jobService: JobService,
    private uxService: UxService,
    private userService: UserService,
    private collectionService: CollectionService,
    private title: Title,
    private meta: Meta,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((r) => {
        this.productId = r['productId'];
        this.load();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearInterval();
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
  onMeasurementsCaptured(measurements: IMeasurement[]) {
    this.measurements = measurements;
    this.size = 'Measurements';
  }
  load() {
    this.productService.getProduct(this.productId).subscribe({
      next: (data) => {
        this.loading = false;
        if (data && data.Name) {
          this.product = data;
          this.liked = this.userService.is_liked(this.product);
          this.links.push({
            link: ``,
            name: this.product.Name,
          });
          if (
            this.product.RelatedProducts &&
            this.product.RelatedProducts.length
          ) {
            this.product.RelatedProducts = this.product.RelatedProducts.filter(
              (p) => p.Slug !== this.product?.Slug
            );
          }
          this.title.setTitle(this.pageTitle);
          this.meta.updateTag({
            name: 'description',
            content: data.Description,
          });
          this.startImageSlider();
        }
        this.getCollections();
      },
      error: (err) => {
        console.error('Error loading product', err);
      },
    });
  }

  onLike() {
    if (!this.product) return;
    this.userService.on_like(this.product);
    this.liked = this.userService.is_liked(this.product);
  }
  onShare() {
    if (!this.product) return;
    this.uxService.onShare(this.product.Name, this.product.Description);
  }
  get pageTitle() {
    if (!this.product || !this.product.Company) return '';
    return `${this.product.Name} - Buy from ${this.product.Company.Name} | Tybo Fashion`;
  }
  get isCustom() {
    return this.product?.IsJustInTime === 'Custom';
  }
  prevImage() {
    if (!this.product) return;
    this.imageClass = 'slide-from-left';
    this.index =
      this.index === 0 ? this.product.Images.length - 1 : this.index - 1;
    this.resetImageSlider();
  }

  nextImage() {
    if (!this.product) return;
    this.imageClass = 'slide-from-right';
    this.index =
      this.index === this.product.Images.length - 1 ? 0 : this.index + 1;
    this.resetImageSlider();
  }

  addToCart(product: Product) {
    this.clearToast();
    if (!this.size) {
      this.errors.size = 'Please select a size';
      return;
    }
    if (this.size === 'Measurements' && !this.hasMeasurements) {
      this.errors.size = 'Please fill in all measurements';
      return;
    }
    product.Company &&
      this.jobService.add_to_cart(
        product.Company,
        product,
        this.size,
        this.quantity,
        this.measurements
      );
    this.uxService.show_cart_modal();
  }

  private startImageSlider() {
    this.clearInterval();
    this.intervalId = window.setInterval(() => {
      this.nextImage();
    }, 10000);
  }

  private resetImageSlider() {
    this.clearInterval();
    this.startImageSlider();
  }

  private clearInterval() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }
  clearToast() {
    this.errors.size = '';
  }

  getCollections() {
    this.collectionService.collections().subscribe((data) => {
      if (data && data.length) {
        this.categories = data;
      }
    });
  }

  get whatsappLink() {
    if (!this.product || !this.product.Company) return '';
    const m =
      `Hello, I would like to buy the ${this.product.Name} from your store`
        .split(' ')
        .join('%20');
    return `https://wa.me/${this.product.Company.Phone}?text=${m}`;
  }

  get hasMeasurements() {
    let hasMeasurements = true;
    // if (this.product?.Measurements.length && !this.measurements.length) {
    //   return false;
    // }
    this.measurements.forEach((m) => {
      if (!m.Value) {
        hasMeasurements = false;
      }
    });
    return hasMeasurements;
  }
}
