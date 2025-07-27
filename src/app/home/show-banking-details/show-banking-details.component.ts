import { Component } from '@angular/core';
import { Company } from 'src/models/Company';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { IKeyValue, UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { ShopService } from 'src/services/shop.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-show-banking-details',
  templateUrl: './show-banking-details.component.html',
  styleUrls: ['./show-banking-details.component.scss'],
})
export class ShowBankingDetailsComponent {
  job?: Job;
  user?: User;
  company?: Company;
  UX_MODALS = UX_MODALS;
  bakingDetails: IKeyValue[] = [];
  constructor(
    private jobService: JobService,
    private uxService: UxService,
    private userService: UserService,
    private shopService: ShopService
  ) {
    userService.userObservable?.subscribe((user) => {
      if (user) this.user = user;
      console.log(user);
      
    });
    jobService.$job.subscribe((job) => {
      if (job) this.job = job;
      this.getCompany();
    });
    shopService.$shop.subscribe((company) => {
      if (company) this.company = company;
    });
  }
  continue_to_shipping() {
    if (!this.job?.Shipping) {
      this.uxService.show_toast('Please select a delivery method', 'error');
      return;
    }
    this.uxService.show_modal(UX_MODALS.customer_contact);
  }
  getCompany() {
    if (!this.job?.CompanyId) return;
    this.shopService.getCompany(this.job.CompanyId).subscribe((data) => {
      if (data && data.CompanyId) {
        this.company = data;
        this.formatData();
      }
    });
  }
  update_cart() {
    this.job && this.jobService.update_cart(this.job);
  }
  open(modal: string) {
    this.uxService.show_modal(modal);
  }
  place_order() {
    this.job && this.jobService.place_order(this.job);
  }
  onFileChanged(url: string) {
    if (url && url.includes('http')) {
      this.job && this.jobService.update_cart(this.job);
    }
  }
  get is_payfast() {
    return this.job?.PaymentMethod === 'payfast';
  }
  get is_bank() {
    return this.job?.PaymentMethod === 'bank';
  }

  formatData() {
    if (!this.company) return;
    this.bakingDetails = [
      { Key: 'Bank Name', Value: this.company.BankName },
      { Key: 'Account Number', Value: this.company.BankAccNo },
      { Key: 'Account Holder', Value: this.company.BankAccHolder },
      { Key: 'Branch Code', Value: this.company.BankBranch },
      { Key: 'Reference', Value: this.user?.Metadata.DraftOrder?.JobNo || '' },
    ];
  }
}
