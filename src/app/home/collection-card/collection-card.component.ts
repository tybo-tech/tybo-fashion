import { Component, Input } from '@angular/core';
import { OtherInfo } from 'src/models/other-info.model';

@Component({
  selector: 'app-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss'],
})
export class CollectionCardComponent {
  @Input({ required: true }) category!: OtherInfo<any>;
  @Input({ required: true }) url!: string;
  @Input() companyId = '';
  @Input() type = '';
  get itemUrl() {
    return `${this.base}/${this.category.Name}/${this.cid}/${this.type}`;
  }
  get cid() {
    return this.companyId || 'tybo-fashion';
  }

  get base() {
    return '/home/collection';
  }
}
