import { Component, Input } from '@angular/core';
import { OtherInfo } from 'src/models/other-info.model';

@Component({
  selector: 'app-top-collections',
  templateUrl: './top-collections.component.html',
  styleUrls: ['./top-collections.component.scss'],
})
export class TopCollectionsComponent {
  @Input({ required: true }) categories!: OtherInfo<any>[];
  @Input() slug = 'tybo-fashion';
  @Input() type = '';
  get top4() {
    return this.categories.slice(0, 4);
  }
}
