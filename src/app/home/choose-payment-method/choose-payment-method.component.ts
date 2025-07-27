import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Job } from 'src/models/job.model';

@Component({
  selector: 'app-choose-payment-method',
  templateUrl: './choose-payment-method.component.html',
  styleUrls: ['./choose-payment-method.component.scss'],
})
export class ChoosePaymentMethodComponent implements OnInit {
  @Input({ required: true }) job!: Job;
  @Output() deliveryMethodChanged = new EventEmitter<string>();
  items: { name: string; value: string }[] = [];
  ngOnInit(): void {
    this.items = this.amountOptions();
  }
  update_delivery() {
    this.deliveryMethodChanged.emit(this.job?.PaymentMethod);
  }
  amountOptions() {
    return [
      {
        name: 'Payfast',
        value: 'payfast',
      },
      {
        name: 'Direct Bank Transfer',
        value: 'bank',
      },
    ];
  }
}
