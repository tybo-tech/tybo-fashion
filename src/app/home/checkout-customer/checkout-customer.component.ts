import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PROVINCES } from 'src/constants/Constants';
import { Job } from 'src/models/job.model';
import { initUser, initUserMetadata, User } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-checkout-customer',
  templateUrl: './checkout-customer.component.html',
  styleUrls: ['./checkout-customer.component.scss'],
})
export class CheckoutCustomerComponent {
  job?: Job;
  UX_MODALS = UX_MODALS;
  delivery = '';
  isDelivery = false;
  isSubmitted = false;
  countOrder = 0;
  provinces_list = PROVINCES;
  errors = {
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    password: '',
  };
  createAccount = false;
  showLogin = false;
  isUserLoggedIn = false;
  user: User = initUser('Customer');
  existingUser?: User;
  constructor(
    private jobService: JobService,
    private uxService: UxService,
    private userService: UserService,
    private router: Router
  ) {
    jobService.$job.subscribe((job) => {
      if (job) {
        this.job = job;
        this.isDelivery = this.job.Shipping === 'delivery';
        this.count(job.CompanyId);
      }
    });
    const loggedInUser = userService.getUser;
    if (loggedInUser) {
      this.user = loggedInUser;
      this.isUserLoggedIn = true;
    }
  }
  continueToPayment() {
    this.isSubmitted = true;
    if (!this.validateShipping()) return;
    if (!this.validateForm(false) || !this.job) return;
    if (!this.user.Metadata) this.user.Metadata = initUserMetadata();
    this.job.JobNo = `INV${this.countOrder}`;
    this.job.Metadata.paymentRef = this.job.JobNo;
    this.jobService.update_job_state(this.job);
    this.userService.updateUserDraftOrder(this.user, this.job);
    this.userService.save(this.user).subscribe((user) => {
      if (user && user.UserId) {
        this.userService.updateUserState(user);
        this.router.navigate(['/home/payments']);
      } else {
        const r: any = user;
        if (typeof r === 'string' && r === 'user already exists') {
          this.uxService.show_toast('User already exists', 'error');
          return;
        }
        this.uxService.show_toast('An error occurred', 'error');
      }
    });
  }
  checkEmail() {
    this.existingUser = undefined;
    if (!this.user.Email) return;
    if (!this.user.Email.includes('@')) return;
    this.userService.verifyEmail(this.user.Email).subscribe((res) => {
      if (res && res.UserId) {
        this.existingUser = res;
      }
    });
  }
  validateShipping() {
    console.log(this.job?.Shipping);

    if (!this.job) return;
    if (!this.isShippingSelected()) {
      this.uxService.show_toast(
        'Either select delivery or collection',
        'Please select a delivery method',
        ['bg-warning', 'text-dark']
      );
      return false;
    }
    return true;
  }
  isShippingSelected() {
    return (
      this.job?.Shipping === 'delivery' || this.job?.Shipping === 'collection'
    );
  }
  count(id: string) {
    this.jobService.count(id).subscribe((count) => {
      this.countOrder = count + 1;
    });
  }
  validateForm(isFieldChange = true) {
    if (isFieldChange && !this.isSubmitted) return true;
    let valid = true;
    this.clearErrors();
    if (!this.user.Name) {
      this.errors.name = 'Name is required';
      valid = false;
    }
    if (!this.user.Email) {
      this.errors.email = 'Email is required';
      valid = false;
    }
    if (!this.user.PhoneNumber) {
      this.errors.phone = 'Phone is required';
      valid = false;
    }
    if (this.job?.Shipping.toLocaleLowerCase() === 'delivery') {
      if (!this.user.AddressLineHome) {
        this.errors.addressLine1 = 'Address is required';
        valid = false;
      }
      if (!this.user.City) {
        this.errors.city = 'City is required';
        valid = false;
      }
      if (!this.user.PostalCode) {
        this.errors.postalCode = 'Postal code is required';
        valid = false;
      }
    }
    if (!this.user.Password && this.createAccount) {
      this.errors.password = 'Password is required';
      valid = false;
    }
    return valid;
  }
  clearErrors() {
    this.errors = {
      name: '',
      email: '',
      phone: '',
      addressLine1: '',
      city: '',
      postalCode: '',
      password: '',
    };
  }
  logout() {
    this.userService.logout(undefined);
    location.reload();
  }
}
