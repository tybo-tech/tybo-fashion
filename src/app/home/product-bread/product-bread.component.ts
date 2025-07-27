import { Component, Input } from '@angular/core';
import { Product } from 'src/models/Product';

@Component({
  selector: 'app-product-bread',
  templateUrl: './product-bread.component.html',
  styleUrls: ['./product-bread.component.scss']
})
export class ProductBreadComponent {
@Input() product?: Product
}
