import { Component, Input } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-shop-contact',
  templateUrl: './shop-contact.component.html',
  styleUrls: ['./shop-contact.component.scss']
})
export class ShopContactComponent {
  @Input() company?: Company;

}
