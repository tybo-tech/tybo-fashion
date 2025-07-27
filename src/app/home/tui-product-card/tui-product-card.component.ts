import { Component, Input } from '@angular/core';
import { Product } from 'src/models/Product';

@Component({
  selector: 'app-tui-product-card',
  templateUrl: './tui-product-card.component.html',
  styleUrls: ['./tui-product-card.component.scss'],
})
export class TuiProductCardComponent {
  @Input({ required: true }) product!: Product;
  constructor() {}
}
