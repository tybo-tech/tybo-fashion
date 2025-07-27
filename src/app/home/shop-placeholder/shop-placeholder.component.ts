import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shop-placeholder',
  templateUrl: './shop-placeholder.component.html',
  styleUrls: ['./shop-placeholder.component.scss']
})
export class ShopPlaceholderComponent {
@Input() bg = '#fab1a0'
}
