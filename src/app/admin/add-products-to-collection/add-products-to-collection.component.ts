import { Component, EventEmitter, Input } from '@angular/core';
import { ICollection } from 'src/models/Category';
import { OtherInfo } from 'src/models/other-info.model';

@Component({
  selector: 'app-add-products-to-collection',
  templateUrl: './add-products-to-collection.component.html',
  styleUrls: ['./add-products-to-collection.component.scss'],
})
export class AddProductsToCollectionComponent {
save() {
throw new Error('Method not implemented.');
}
  @Input({ required: true }) category!: OtherInfo<ICollection>;
  onClose = new EventEmitter();
}
