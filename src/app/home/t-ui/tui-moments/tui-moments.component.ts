import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IWorkGallery } from 'src/models/IWorkGallery';
import { OtherInfo } from 'src/models/other-info.model';

/**
 * "Made for real moments" — a portfolio-inspiration gallery.
 *
 * Unlike the product feed, these are not necessarily purchasable: they answer
 * "what could this designer make for me?" Each tile opens the designer's
 * portfolio piece, where a shopper can start a made-to-order conversation.
 */
@Component({
  selector: 'app-tui-moments',
  templateUrl: './tui-moments.component.html',
  styleUrls: ['./tui-moments.component.scss'],
})
export class TuiMomentsComponent implements OnChanges {
  @Input() items: OtherInfo<IWorkGallery>[] = [];
  @Input() limit = 6;

  moments: OtherInfo<IWorkGallery>[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.moments = (this.items || [])
        .filter((item) => item?.ImageUrl || item?.ItemValue?.coverImage)
        .slice(0, this.limit);
    }
  }

  title(item: OtherInfo<IWorkGallery>): string {
    return item?.Name || item?.ItemValue?.title || 'A made-to-order piece';
  }

  linkFor(item: OtherInfo<IWorkGallery>): string {
    return item?.Id ? `/home/work-show-details/${item.Id}` : '/home/shops';
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.svg';
  }
}
