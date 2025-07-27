import { Component, Input } from '@angular/core';
import { Product } from 'src/models/Product';

@Component({
  selector: 'app-product-color',
  templateUrl: './product-color.component.html',
  styleUrls: ['./product-color.component.scss'],
})
export class ProductColorComponent {
  @Input({ required: true }) product!: Product;
  get name() {
    return '';
  }
  get code() {
    
    return '';
  }

  get blackAndWhite() {
    // black and white css gradient
    return `linear-gradient(90deg, #000000 0%, #000000 50%, #ffffff 50%, #ffffff 100%)`;
  }
}
