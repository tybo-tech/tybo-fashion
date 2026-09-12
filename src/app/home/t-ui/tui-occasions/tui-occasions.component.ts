import { Component, OnInit } from '@angular/core';
import { Occasion, occasionLink } from 'src/models/Occasions';
import { OtherInfoService } from 'src/services/other-info.service';

/**
 * "Shop by occasion" rail.
 *
 * Reads the cross-designer occasion index from the backend so the tiles reflect
 * every designer on Tybo (not just the featured one), and links to the
 * occasion page where all matching portfolio pieces are shown.
 */
@Component({
  selector: 'app-tui-occasions',
  templateUrl: './tui-occasions.component.html',
  styleUrls: ['./tui-occasions.component.scss'],
})
export class TuiOccasionsComponent implements OnInit {
  occasions: Occasion[] = [];

  constructor(private otherInfoService: OtherInfoService<any>) {}

  ngOnInit(): void {
    this.otherInfoService.occasionIndex().subscribe({
      next: (summaries) => {
        this.occasions = (summaries || []).map((summary) => ({
          Name: summary.Name,
          Slug: summary.Slug,
          ImageUrl: summary.ImageUrl,
          Count: summary.Count,
          Link: occasionLink(summary.Slug),
        }));
      },
      error: () => (this.occasions = []),
    });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.svg';
  }
}
