import { Component, Input } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-shop-cta',
  templateUrl: './shop-cta.component.html',
  styleUrls: ['./shop-cta.component.scss']
})
export class ShopCtaComponent {
  @Input() company?: Company;

}
