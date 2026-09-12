import { Component, Input, OnInit } from '@angular/core';
import { Product } from 'src/models/Product';
import { HomeProduct, toDeposit, toStockLabel } from 'src/models/HomeFeed';
import { UserService } from 'src/services/user.service';

/**
 * Marketplace product card for the homepage feed.
 *
 * Accepts either a normalised `HomeProduct` (from ProductService.homeFeed)
 * or a legacy `Product`, so it can be reused by "New in" and designer rows
 * without each section re-implementing price/deposit/stock formatting.
 */
@Component({
  selector: 'app-tui-product-card',
  templateUrl: './tui-product-card.component.html',
  styleUrls: ['./tui-product-card.component.scss'],
})
export class TuiProductCardComponent implements OnInit {
  @Input({ required: true }) product!: HomeProduct | Product;
  liked = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.liked = this.userService.is_liked(this.product as Product);
  }

  onLike(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.userService.on_like(this.product as Product);
    this.liked = this.userService.is_liked(this.product as Product);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.svg';
  }

  get name(): string {
    return (this.product?.Name || '').toString();
  }

  get image(): string {
    return (this.product?.FeaturedImageUrl || '').toString();
  }

  get designerName(): string {
    return ((this.product as HomeProduct)?.Designer?.Name || '')
      .toString()
      .trim();
  }

  get price(): number {
    return Number(this.product?.RegularPrice) || 0;
  }

  get oldPrice(): number | null {
    const value = Number(this.product?.OldPrice);
    return !isNaN(value) && value > 0 ? value : null;
  }

  get deposit(): number {
    return toDeposit(this.product || {});
  }

  get stockLabel(): string {
    return toStockLabel(this.product || {});
  }

  get url(): string {
    const slug = this.product?.Slug || this.product?.ProductId;
    return `/product/${slug}`;
  }
}
