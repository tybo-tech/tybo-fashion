import { Component, Input } from '@angular/core';
import { Product } from 'src/models/Product';

@Component({
  selector: 'app-product-slider',
  templateUrl: './product-slider.component.html',
  styleUrls: ['./product-slider.component.scss'],
})
export class ProductSliderComponent {
  @Input() images: string[] = [];
}
