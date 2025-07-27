import { Component, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-explore-collections',
  templateUrl: './explore-collections.component.html',
  styleUrls: ['./explore-collections.component.scss']
})
export class ExploreCollectionsComponent {
shopId = '';
  whatsappLink = '';
  company?: Company;
  showBookConsultation = false;
  intro = 'assets/images/tui/intro.png';
  cards: ICardCarousel[] = [];
  heroHeaderData?: HeroHeaderData;
  OTHER_TYPES = OTHER_TYPES;
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
      this.shopId = r['companyId'];
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
            image: this.company.Metadata?.AboutImage || '',
            title: 'Explore Collections',
            description: 'Explore the latest collections from ' + this.company.Name,
            slug: '',
          };
      
          this.shopService.update_shop_state(data);
          this.title.setTitle(`Explore ${this.company.Name} Collections`);
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
  get featuredProducts(): Product[] {
    const stock = this.company?.PinnedProducts || [];
    const custom = this.company?.RecentProducts	 || [];
    return [...stock, ...custom].sort((a, b) =>
      new Date(b.CreateDate).getTime() - new Date(a.CreateDate).getTime()
    );
  }
}
