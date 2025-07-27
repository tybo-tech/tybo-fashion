import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';

@Component({
  selector: 'app-choose-payment-amount',
  templateUrl: './choose-payment-amount.component.html',
  styleUrls: ['./choose-payment-amount.component.scss'],
})
export class ChoosePaymentAmountComponent implements OnInit {
  ngOnInit(): void {
    this.items = this.amountOptions();
  }
  @Input({ required: true }) job!: Job;
  @Output() deliveryMethodChanged = new EventEmitter<{
    value: string;
    name: string;
    price: number;
  }>();
  items: any[] = [];
  constructor(private jobService: JobService) {}
  update_delivery() {
    const selected = this.items.find(
      (item) => item.value === this.job?.PaymentAmount
    );
    if (!selected) return;
    console.log(selected);
    this.deliveryMethodChanged.emit(selected);
  }
  amountOptions() {
    // Full amount {{ job.TotalCost | currency : "R" }}
    // 50% deposit {{ job.TotalCost / 2 | currency : "R" }}
    return [
      {
        name: 'Full amount',
        price: this.job?.TotalCost,
        value: 'full',
      },
      {
        name: '50% deposit',
        price: this.job?.TotalCost / 2,
        value: 'deposit',
      },
    ];
  }
}
