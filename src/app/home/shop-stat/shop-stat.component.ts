import { Component, Input } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-shop-stat',
  templateUrl: './shop-stat.component.html',
  styleUrls: ['./shop-stat.component.scss'],
})
export class ShopStatComponent {
  @Input() company?: Company;
}
