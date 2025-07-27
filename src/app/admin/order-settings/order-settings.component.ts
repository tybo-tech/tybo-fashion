import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-order-settings',
  templateUrl: './order-settings.component.html',
  styleUrls: ['./order-settings.component.scss'],
})
export class OrderSettingsComponent implements OnInit {

  @Input() company?: Company;
  @Output() updated = new EventEmitter<Company>();
  @Output() closed = new EventEmitter<any>();
  ngOnInit(): void {
    if (this.company && this.company.Metadata) {
      if (!this.company.Metadata.InvoiceNotes)
        this.company.Metadata.InvoiceNotes = [
          `Your project will commence upon receipt of a 50% deposit. The balance is due upon completion.`,
          `Your purchase will be available for collection once the payment is settled in full.`,
        ];

      if (!this.company.Metadata.InvoiceAnnouncement)
        this.company.Metadata.InvoiceAnnouncement = `Thank you for your business. We appreciate your support.`;
    }
  }
  setInvoiceNotes($event: any,i: number) {
    if(!this.company?.Metadata?.InvoiceNotes) return
    this.company.Metadata.InvoiceNotes[i] = $event
  }
}
