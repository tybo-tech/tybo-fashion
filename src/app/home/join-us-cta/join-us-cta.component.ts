import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-join-us-cta',
  templateUrl: './join-us-cta.component.html',
  styleUrls: ['./join-us-cta.component.scss']
})
export class JoinUsCtaComponent {
  @Input() type: 'Desinger' | 'Customer' = 'Desinger';
  // desinger = 'assets/images/tui/d1.png';
  // desinger = 'assets/images/tui/d2.png';
  desinger = 'assets/images/tui/d3.png';
  customer = 'assets/images/tui/customer.png';
  mock = 'assets/images/tui/phone-mock-1.png';
  mock2 = 'assets/images/tui/phone-mock-2.png';

}
