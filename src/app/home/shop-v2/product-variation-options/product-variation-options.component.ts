import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Variation } from 'src/services/variation.service';

@Component({
  selector: 'app-product-variation-options',
  templateUrl: './product-variation-options.component.html',
  styleUrls: ['./product-variation-options.component.scss']
})
export class ProductVariationOptionsComponent {
  @Input() variations: Variation[] = [];

  @Output() variationChange = new EventEmitter<Variation>();

}
