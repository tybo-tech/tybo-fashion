import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getId } from 'src/constants/Constants';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { ICheckoutNav, UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit {
  settings: ICheckoutNav = {
    back: '/home/checkout',
    subTitle: 'Payments',
    title: 'Tybo Fashion',
  };
  job?: Job;
  UX_MODALS = UX_MODALS;
  user?: User;
  isPaymentCancelled = false;
  showContactUs = false;
  constructor(
    private jobService: JobService,
    private uxService: UxService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService
  ) {
    this.onLoad();
  }

  ngOnInit(): void {
    this.updateUserDraftOrder();
  }

  updateUserDraftOrder() {
    if (this.user && this.user.Metadata && this.job) {
      this.jobService.count(this.job.CompanyId).subscribe((count) => {
        if (this.user && this.job && count && Number(count) > 0) {
          this.job.JobNo = `INV${count + 1}`;
          this.jobService.update_job_state(this.job);
          this.user.Metadata.DraftOrder = this.job;
          if (!this.user.Metadata.DraftOrderId)
            this.user.Metadata.DraftOrderId = getId('order');
          this.userService.save(this.user).subscribe((res) => {
            if (res && res.UserId) {
              this.userService.updateUserState(res);
            }
          });
        }
      });
    }
  }

  onLoad() {
    this.userService.userObservable?.subscribe((user) => {
      if (user) this.user = user;
    });
    this.activatedRoute.params.subscribe((r) => {
      const jobId = r['id'];
      jobId && this.getOrder(jobId);
      !jobId &&
        this.jobService.$job.subscribe((job) => {
          if (job) this.job = job;
        });
    });

    // Handle cancelled query param cancelled=true
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params['cancelled']) {
        this.isPaymentCancelled = true;
      }
    });
  }

  getOrder(id: string) {
    this.userService.draft_order(id).subscribe((res) => {
      if (res && res.Metadata && res.Metadata.DraftOrder) {
        this.job = res.Metadata.DraftOrder;
        if (!this.user) this.user = res;
        this.userService.updateUserState(res);
      }
    });
  }
  continue_to_shipping() {
    if (!this.job?.Shipping) {
      this.uxService.show_toast('Please select a delivery method', 'error');
      return;
    }
    this.uxService.show_modal(UX_MODALS.customer_contact);
  }
  payment_amount_changed(selected: {
    value: string;
    name: string;
    price: number;
  }) {
    if (!this.job) return;
    this.job.PaymentAmount = selected.value;
    this.job.Metadata.dueToday = selected.price;
    this.job.Metadata.selectedPaymentAmountName = selected.name;
    this.update_cart();
    this.updateUserDraftOrder();
  }

  update_cart() {
    this.job && this.jobService.update_cart(this.job);
  }
  open(modal: string) {
    this.uxService.show_modal(modal);
  }
  get is_payfast() {
    return this.job?.PaymentMethod === 'payfast';
  }
  get is_bank() {
    return this.job?.PaymentMethod === 'bank';
  }
  placeOrder() {
    if (!this.job?.Metadata.paymentProof) {
      this.uxService.show_toast(
        'Please upload payment proof',
        'You choose bank transfer as payment method.',
        ['bg-warning', 'text-dark']
      );
      return;
    }
    this.jobService.place_order(this.job);
  }
}
