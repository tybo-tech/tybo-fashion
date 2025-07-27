import { Component, Input } from '@angular/core';
import { ICheckoutNav } from 'src/models/ux.model';

@Component({
  selector: 'app-checkout-nav',
  templateUrl: './checkout-nav.component.html',
  styleUrls: ['./checkout-nav.component.scss'],
})
export class CheckoutNavComponent {
  @Input({ required: true }) settings!: ICheckoutNav
}

