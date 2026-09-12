import { Component, OnInit } from '@angular/core';
import { OccasionSummary } from 'src/models/Occasions';
import { OtherInfoService } from 'src/services/other-info.service';

/**
 * Occasion index — "Shop by occasion" across every designer on Tybo.
 */
@Component({
  selector: 'app-occasions',
  templateUrl: './occasions.component.html',
  styleUrls: ['./occasions.component.scss'],
})
export class OccasionsComponent implements OnInit {
  occasions: OccasionSummary[] = [];
  loading = true;

  constructor(private otherInfoService: OtherInfoService<any>) {}

  ngOnInit(): void {
    this.otherInfoService.occasionIndex().subscribe({
      next: (occasions) => {
        this.occasions = occasions || [];
        this.loading = false;
      },
      error: () => {
        this.occasions = [];
        this.loading = false;
      },
    });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.svg';
  }
}
