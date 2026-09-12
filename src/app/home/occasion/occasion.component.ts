import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IWorkGallery } from 'src/models/IWorkGallery';
import { OtherInfo } from 'src/models/other-info.model';
import { OtherInfoService } from 'src/services/other-info.service';

type OccasionItem = OtherInfo<IWorkGallery> & { Company?: any };

/**
 * Cross-designer occasion detail: every portfolio piece made for one occasion,
 * with the designer credited. Inspiration-led — each piece opens the work
 * showcase where a shopper can request something similar.
 */
@Component({
  selector: 'app-occasion',
  templateUrl: './occasion.component.html',
  styleUrls: ['./occasion.component.scss'],
})
export class OccasionComponent {
  slug = '';
  name = '';
  items: OccasionItem[] = [];
  loading = true;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private otherInfoService: OtherInfoService<any>
  ) {
    this.route.params.subscribe((params) => {
      this.slug = params['slug'];
      this.load();
    });
  }

  private load(): void {
    this.loading = true;
    this.notFound = false;
    this.otherInfoService.occasion(this.slug).subscribe({
      next: (data) => {
        this.loading = false;
        if (data && data.Occasion) {
          this.name = data.Occasion.Name;
          this.items = data.Items || [];
        } else {
          this.notFound = true;
        }
      },
      error: () => {
        this.loading = false;
        this.notFound = true;
      },
    });
  }

  title(item: OccasionItem): string {
    return item?.Name || item?.ItemValue?.title || 'A made-to-order piece';
  }

  designerName(item: OccasionItem): string {
    return (item?.Company?.Name || '').trim();
  }

  linkFor(item: OccasionItem): string {
    return item?.Id ? `/home/work-show-details/${item.Id}` : '/home/shops';
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.svg';
  }
}
