import { Component, Input } from '@angular/core';
import { Product } from 'src/models/Product';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss'],
})
export class TagsComponent {
  @Input() product?: Product;
}
