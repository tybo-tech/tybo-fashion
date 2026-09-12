import { Component, Input, OnInit } from '@angular/core';
import { HomeProduct } from 'src/models/HomeFeed';
import { ProductService } from 'src/services/product.service';

/**
 * "New in Tybo" — the shoppable feed directly below the homepage hero.
 *
 * Reads ProductService.homeFeed(), which is intentionally isolated from the
 * shared $products subject so the section always shows the marketplace's
 * latest eligible listings rather than whichever shop loaded last.
 */
@Component({
  selector: 'app-tui-new-in',
  templateUrl: './tui-new-in.component.html',
  styleUrls: ['./tui-new-in.component.scss'],
})
export class TuiNewInComponent implements OnInit {
  @Input() count = 8;
  @Input() title = 'New in Tybo';
  @Input() subtitle = 'The latest pieces from independent designers.';
  @Input() showMore = true;

  /** Optional pre-resolved feed; supplied by the homepage so it is only fetched once. */
  @Input() set products(value: HomeProduct[] | undefined) {
    if (value && value.length) {
      this._products = value;
      this.loading = false;
    }
  }
  get products(): HomeProduct[] {
    return this._products;
  }

  private _products: HomeProduct[] = [];
  loading = true;
  error = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Standalone usage fetches its own feed; the homepage passes it in.
    if (this._products.length) {
      return;
    }
    this.productService.homeFeed(this.count).subscribe({
      next: (products) => {
        this._products = products || [];
        this.loading = false;
      },
      error: () => {
        this._products = [];
        this.loading = false;
        this.error = true;
      },
    });
  }
}
