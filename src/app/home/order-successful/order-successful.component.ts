import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from 'src/constants/Constants';
import { Job } from 'src/models/job.model';
import { ICheckoutNav } from 'src/models/ux.model';
import { EmailService } from 'src/services/email.service';
import { OrderEmailHelper } from 'src/services/email.service.order.helper';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-order-successful',
  templateUrl: './order-successful.component.html',
  styleUrls: ['./order-successful.component.scss'],
})
export class OrderSuccessfulComponent {
  order?: Job;
  settings: ICheckoutNav = {
    back: '/',
    subTitle: 'Order Successful',
    title: 'Tybo Fashion',
    hideBack: true,
  };
  constructor(
    private activatedRoute: ActivatedRoute,
    private jobService: JobService,
    private emailService: EmailService
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.getOrder(r['id']);
    });
  }
  getOrder(id: string) {
    this.jobService.getjob(id).subscribe((res) => {
      if (res && res.JobId && res.Metadata) {
        this.order = res;
        this.settings.back = '/' + this.order.CompanyId;
         new OrderEmailHelper(this.emailService, res);
      }
    });
  }
  get invoice() {
    return Constants.PrintInvoice + this.order?.JobId;
  }
  get backUrl() {
    return this.order?.CompanyId || '/';
  }
}
