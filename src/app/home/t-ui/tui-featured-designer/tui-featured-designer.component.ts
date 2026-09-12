import { Component, Input } from '@angular/core';
import { Company } from 'src/models/Company';
import { HomeProduct, toStockLabel } from 'src/models/HomeFeed';
import { Product } from 'src/models/Product';

/**
 * "Meet the designer" editorial block.
 *
 * Turns a shop into a story: brand image, name, city, what they make
 * (ready-to-wear / made-to-order) and three selected pieces — so shoppers
 * discover the person, not just the product. The designer is resolved once by
 * the homepage and passed in (along with the same feed used by "New in") to
 * avoid a duplicate request.
 */
@Component({
  selector: 'app-tui-featured-designer',
  templateUrl: './tui-featured-designer.component.html',
  styleUrls: ['./tui-featured-designer.component.scss'],
})
export class TuiFeaturedDesignerComponent {
  @Input() company?: Company;
  @Input() products: HomeProduct[] = [];

  get name(): string {
    return (this.company?.Name || '').trim();
  }

  get initial(): string {
    return this.name ? this.name.charAt(0).toUpperCase() : 'T';
  }

  get logo(): string {
    return (this.company?.Metadata?.WebLogo || this.company?.Dp || '').toString();
  }

  /**
   * Editorial visual for the block. Prefer the brand's own photography — the
   * logo is a wide wordmark that looks broken when stretched into a portrait
   * frame, so it is only used as a small badge.
   */
  get heroImage(): string {
    const meta = this.company?.Metadata;
    return (
      meta?.HomePageImage ||
      meta?.AboutImage ||
      this.company?.Dp ||
      ''
    ).toString();
  }

  get about(): string {
    const about = this.company?.Metadata?.About || this.company?.Description || '';
    // Prefer the first paragraph so the block stays editorial, not an essay.
    return about.split('\n')[0].trim();
  }

  get city(): string {
    return (this.company?.City || '').trim();
  }

  get shopUrl(): string {
    return this.company?.Slug ? `/${this.company.Slug}` : '/home/shops';
  }

  get selected(): HomeProduct[] {
    return (this.products || []).slice(0, 3);
  }

  get stockLabels(): string[] {
    const labels = new Set<string>();
    for (const product of this.products || []) {
      const label = toStockLabel(product as unknown as Product);
      if (label) {
        labels.add(label);
      }
    }
    return Array.from(labels);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.svg';
  }
}
