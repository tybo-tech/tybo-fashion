import { Component } from '@angular/core';

/**
 * Trust strip for the shopper homepage.
 *
 * Only advertises claims the platform actually supports (designers on Tybo,
 * ready-to-wear + made-to-order, PayFast checkout, direct designer contact).
 */
@Component({
  selector: 'app-tui-trust-strip',
  templateUrl: './tui-trust-strip.component.html',
  styleUrls: ['./tui-trust-strip.component.scss'],
})
export class TuiTrustStripComponent {
  points = [
    { icon: 'bi-geo-alt', text: 'South African designers' },
    { icon: 'bi-scissors', text: 'Ready-to-wear and made-to-order' },
    { icon: 'bi-shield-check', text: 'Secure checkout' },
    { icon: 'bi-chat-dots', text: 'Direct designer support' },
  ];
}
