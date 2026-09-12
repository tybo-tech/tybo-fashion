import { Component, OnInit } from '@angular/core';
import { Company } from 'src/models/Company';
import { HomeProduct } from 'src/models/HomeFeed';
import { IWorkGallery } from 'src/models/IWorkGallery';
import { OTHER_TYPES, OtherInfo } from 'src/models/other-info.model';
import { ProductService } from 'src/services/product.service';
import { ShopService } from 'src/services/shop.service';
import { OtherInfoService } from 'src/services/other-info.service';

/**
 * Marketplace homepage shell.
 *
 * Composition: editorial hero -> "New in Tybo" feed -> shop by occasion ->
 * featured designer. The marketplace feed is resolved once here and shared, so
 * "New in" and the featured designer do not fire duplicate requests. Later
 * phases add work-gallery moments, a trust strip and the "Sell on Tybo" pitch.
 */
@Component({
  selector: 'app-tui-home',
  templateUrl: './tui-home.component.html',
  styleUrls: ['./tui-home.component.scss'],
})
export class TuiHomeComponent implements OnInit {
  products: HomeProduct[] = [];
  loading = true;
  error = false;

  featuredDesigner?: Company;
  galleryItems: OtherInfo<IWorkGallery>[] = [];

  constructor(
    private productService: ProductService,
    private shopService: ShopService,
    private otherInfoService: OtherInfoService<IWorkGallery>
  ) {}

  ngOnInit(): void {
    this.loadFeed();
  }

  private loadFeed(): void {
    this.productService.homeFeed(8).subscribe({
      next: (products) => {
        this.products = products || [];
        this.loading = false;
        this.loadFeaturedDesigner();
      },
      error: () => {
        this.products = [];
        this.loading = false;
        this.error = true;
      },
    });
  }

  /**
   * Feature the designer behind the newest piece in the feed. Kept defensive:
   * a missing or inactive shop must never break the homepage.
   */
  private loadFeaturedDesigner(): void {
    const slug = this.products[0]?.Designer?.Slug;
    if (!slug) {
      return;
    }
    this.shopService.getShop({ ShopId: slug }).subscribe({
      next: (company) => {
        if (company?.CompanyId) {
          this.featuredDesigner = company;
          this.loadGallery(company.CompanyId);
        }
      },
      error: () => (this.featuredDesigner = undefined),
    });
  }

  private loadGallery(companyId: string): void {
    this.otherInfoService.workGallery(companyId).subscribe({
      next: (items) => (this.galleryItems = items || []),
      error: () => (this.galleryItems = []),
    });
  }
}
