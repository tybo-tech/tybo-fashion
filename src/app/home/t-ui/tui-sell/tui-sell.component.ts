import { Component } from '@angular/core';

/**
 * "Sell on Tybo" — the designer-facing landing page.
 *
 * All the platform/SaaS content that used to dominate the shopper homepage now
 * lives here: storefronts, orders and job cards, PDF invoices, client
 * management, work gallery and the designer call to action.
 */
@Component({
  selector: 'app-tui-sell',
  templateUrl: './tui-sell.component.html',
  styleUrls: ['./tui-sell.component.scss'],
})
export class TuiSellComponent {
  features = [
    {
      icon: 'bi-shop-window',
      title: 'Online Storefront',
      body: 'Showcase your brand and products beautifully with a public shop page — no coding needed.',
    },
    {
      icon: 'bi-clipboard-check',
      title: 'Manage Orders & Jobs',
      body: 'Track customer orders, create job cards, and stay organized with everything in one place.',
    },
    {
      icon: 'bi-file-earmark-text',
      title: 'Auto PDF Invoices',
      body: 'Generate branded invoices instantly and share them with your customers online or offline.',
    },
    {
      icon: 'bi-people',
      title: 'Client Management',
      body: 'Store customer measurements, contact info, and order history with ease.',
    },
    {
      icon: 'bi-images',
      title: 'Work Gallery',
      body: 'Show off your best work — display completed outfits, events, and proud moments.',
    },
    {
      icon: 'bi-phone',
      title: 'Mobile Friendly',
      body: 'Access your dashboard and manage your business from any device, anytime.',
    },
  ];

  capabilities = [
    {
      icon: 'bi-bag-check-fill',
      title: 'Sell Products & Services',
      body: 'List ready-to-wear and made-to-order items with flexible pricing.',
    },
    {
      icon: 'bi-ui-checks-grid',
      title: 'Track Jobs & Orders',
      body: 'Stay on top of job cards, due dates, and production details — all from one dashboard.',
    },
    {
      icon: 'bi-receipt-cutoff',
      title: 'Generate Invoices Instantly',
      body: 'Automatically generate PDF invoices that look professional and include all order details.',
    },
    {
      icon: 'bi-people-fill',
      title: 'Manage Clients & Measurements',
      body: 'Store customer info, measurements, and order history — perfect for repeat orders.',
    },
    {
      icon: 'bi-images',
      title: 'Showcase Your Work',
      body: 'Upload completed outfits and event photos to your portfolio with ease.',
    },
  ];
}
