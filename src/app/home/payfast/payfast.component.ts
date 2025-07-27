import { Component, Input, OnInit } from '@angular/core';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-payfast',
  templateUrl: './payfast.component.html',
  styleUrls: ['./payfast.component.scss'],
})
export class PayfastComponent implements OnInit {
  host = window.location.origin + '/home';
  @Input() job?: Job;
  @Input() payfast = {
    shopingSuccesfulUrl: '',
    paymentCallbackUrl: '',
    paymentCancelledUrl: '',
    merchantId: '15863973',
    merchantKey: 'xbamuwn3paoji',
    payUrl: 'https://www.payfast.co.za/eng/process',
  };
  user?: User;
  constructor(private userService: UserService) {
    this.user = this.userService.getUser;
  }
  ngOnInit(): void {
    if (this.user && this.user.Metadata && this.user.Metadata.DraftOrder) {
      this.payfast.shopingSuccesfulUrl = `${this.host}/shoping-successful/${this.user.Metadata.DraftOrderId}`;
      this.payfast.paymentCallbackUrl = `${this.host}/payment-callback/${this.user.Metadata.DraftOrderId}`;
      this.payfast.paymentCancelledUrl = `${this.host}/payments/${this.user.Metadata.DraftOrderId}?cancelled=true`;
    }
    // this.set_sandbox();
  }
  get productName() {
    return this.job?.JobItems?.map((p) => p.ItemName).join(', ') || '';
  }

  get amount() {
    if (this.job?.PaymentAmount === 'deposit') {
      return this.job?.TotalCost / 2 || 0;
    }
    return this.job?.TotalCost || 0;
  }

  set_sandbox() {
    this.payfast.merchantId = '10008639';
    this.payfast.merchantKey = 'q6rdfuufz50j2';
    this.payfast.payUrl = 'https://sandbox.payfast.co.za/eng/process';
  }
}
