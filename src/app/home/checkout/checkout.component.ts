import { Component } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { ICheckoutNav } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {
  job?: Job;
  user?: User;
  settings: ICheckoutNav = {
    back: '/home/cart',
    subTitle: 'Checkout',
    title: 'Tybo Fashion',
  };
  constructor(
    private jobService: JobService,
    private uxService: UxService,
    private userService: UserService
  ) {
    jobService.$job.subscribe((job) => {
      if (job) this.job = job;
    });

    userService.userObservable?.subscribe((user) => {
      if (user) this.user = user;
    });
  }
  update_cart() {
    this.job && this.jobService.update_cart(this.job);
  }
  update_delivery() {
    //collection , delivery
    switch (this.job?.Shipping) {
      case 'collection':
        this.jobService.update_delivery(this.job, 'collection', 0);
        break;
      case 'delivery':
        this.jobService.update_delivery(
          this.job,
          'delivery',
          Constants.DeliveryFee
        );
        break;
      default:
        break;
    }
  }
  
  get is_payfast() {
    return this.job?.PaymentMethod === 'payfast';
  }
  get is_bank() {
    return this.job?.PaymentMethod === 'bank';
  }

  get isUserFormValid() {
    return this.user?.UserId;
  }
}
