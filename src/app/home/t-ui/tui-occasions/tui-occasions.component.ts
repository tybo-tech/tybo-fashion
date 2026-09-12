import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IWorkGallery } from 'src/models/IWorkGallery';
import { buildOccasions, Occasion } from 'src/models/Occasions';
import { OtherInfo } from 'src/models/other-info.model';

/**
 * "Shop by occasion" rail.
 *
 * Occasions are derived from the designer's real WorkGallery so the tiles are
 * genuine, image-backed pieces rather than a fabricated category system. Each
 * tile deep-links to the matching gallery item.
 */
@Component({
  selector: 'app-tui-occasions',
  templateUrl: './tui-occasions.component.html',
  styleUrls: ['./tui-occasions.component.scss'],
})
export class TuiOccasionsComponent implements OnChanges {
  @Input() items: OtherInfo<IWorkGallery>[] = [];

  occasions: Occasion[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.occasions = buildOccasions(this.items, (item) =>
        item?.Id ? `/home/work-show-details/${item.Id}` : '/home/shops'
      );
    }
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.svg';
  }
}
