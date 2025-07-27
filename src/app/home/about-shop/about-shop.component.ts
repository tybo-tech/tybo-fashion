import { Component, Input } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-about-shop',
  templateUrl: './about-shop.component.html',
  styleUrls: ['./about-shop.component.scss']
})
export class AboutShopComponent {
  @Input() company?: Company;

}
