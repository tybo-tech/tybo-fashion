import { Component, HostListener, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Company } from 'src/models/Company';
import { HeroHeaderData } from 'src/models/HeroHeaderData';
import { ICardCarousel } from 'src/models/ICardCarousel';
import { OTHER_TYPES } from 'src/models/other-info.model';
import { Product } from 'src/models/Product';
import { ProductService } from 'src/services/product.service';
import { ShopService } from 'src/services/shop.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-my-shop-betta',
  templateUrl: './my-shop-betta.component.html',
  styleUrls: ['./my-shop-betta.component.scss'],
})
export class MyShopBettaComponent implements OnInit {
  shopId = '';
  whatsappLink = '';
  company?: Company;
  showBookConsultation = false;
  intro = 'assets/images/tui/intro.png';
  cards: ICardCarousel[] = [];
  heroHeaderData?: HeroHeaderData;
  OTHER_TYPES = OTHER_TYPES;
  products: Product[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private shopService: ShopService,
    private title: Title,
    private productService: ProductService,
    private uxService: UxService
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.shopId = r['id'];
      this.load();
    });
  }
  ngOnInit(): void {}
  scrollToLastPosition() {
    const scrollPosition = sessionStorage.getItem('scrollPosition');
    if (scrollPosition) {
      const intVal = parseInt(scrollPosition, 10);
      if (intVal > 10) {
        window.scrollTo(0, intVal);
      }
    }
  }
  @HostListener('window:beforeunload')
  saveScrollPosition() {
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
  }
  mapProductsListToCards() {
    this.productService.$products.subscribe((products) => {
      if (products && products.length) {
        this.products = products;
        this.cards = products.map((product) => {
          return {
            buttonText: 'View',
            heading: product.Name,
            image: product.FeaturedImageUrl,
            subheading: 'R' + product.RegularPrice,
            buttonLink: `/product/${product.Slug || product.ProductId}`,
          };
        });
      }
    });
  }
  load() {
    this.shopService
      .getShop({
        ShopId: this.shopId,
        IncludeCategories: true,
        IncludeFeaturedCustomProducts: true,
        IncludeFeaturedStockProducts: true,
      })
      .subscribe((data) => {
        if (data.CompanyId) {
          this.company = data;
          this.heroHeaderData = {
            image: this.company.Metadata?.HomePageImage || this.company.Metadata?.AboutImage || '',
            title: this.company.Metadata?.HomePageTitle || '',
            description: this.company.Metadata?.HomePageDescription || '',
            slug: this.company.Slug || '',
          };
          if (this.company.Phone) {
            const m =
              `Hello, I would like to book a consultation with a fashion designer/personal style curator`
                .split(' ')
                .join('%20');
            this.company.whatsappLink = `https://wa.me/${this.company.Phone}?text=${m}`;
          }
          this.shopService.update_shop_state(data);
          this.title.setTitle(`Welcome to ${this.company.Name} | Tybo Fashion`);
          this.mapProductsListToCards();
        }
        setTimeout(() => {
          this.scrollToLastPosition();
        }, 200);
      });
  }

  onShare() {
    if (!this.company) return;
    this.uxService.onShare(this.company.Name, '');
  }
  get categories() {
    return this.company?.Categories || [];
  }
  get styles() {
    return this.company?.Styles || [];
  }

  get heading() {
    return this.company?.Metadata?.HomePageTitle || '';
  }
  get about() {
    return this.company?.Metadata?.HomePageDescription || '';
  }
  get image() {
    return this.company?.Metadata?.HomePageImage || this.intro;
  }
  get slug() {
    return this.company?.Slug || '';
  }
  get collectionLink() {
    return `/home/collections/${this.slug}`;
  }

  get slides() {
    return this.company?.Metadata?.Slides || [];
  }

  get showMoreUrl() {
    return `/home/products/${this.slug}`;
  }

}
