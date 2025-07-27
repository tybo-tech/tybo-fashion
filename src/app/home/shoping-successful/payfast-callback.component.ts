import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from 'src/constants/Constants';
import { Job } from 'src/models/job.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-payfast-callback',
  templateUrl: './payfast-callback.component.html',
  styleUrls: ['./payfast-callback.component.scss'],
})
export class PaymentCallBackComponent {
  // payfast-callback
  job?: Job;
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private jobService: JobService
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.getOrder(r['id']);
    });
  }
  getOrder(id: string) {
    this.userService.draft_order(id).subscribe((res) => {
      if (res && res.UserId && res.Metadata && res.Metadata.DraftOrder) {
        const companyId = res.Metadata.DraftOrder.CompanyId;
        const order: Job = { ...res.Metadata.DraftOrder };
        order.Metadata.paidAmount = order.Metadata.dueToday;
        order.Metadata.payments = [
          {
            Date: new Date().toISOString(),
            Amount: order.Metadata.dueToday,
            Type: 'Online',
          },
        ];
        order.Metadata.isOnlinePaymentComplete = true;
        this.jobService.place_order(order);
        res.Metadata.DraftOrder = undefined;
        res.Metadata.DraftOrderId = undefined;
        this.userService.save(res).subscribe((res) => {
          if (res && res.UserId) {
            this.userService.updateUserState(res);
          }
        });
        this.router.navigate(['/', companyId]);
      }
    });
  }
  get invoice() {
    return Constants.PrintInvoice + this.job?.JobId;
  }
}
