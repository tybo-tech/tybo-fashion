import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent {
open(arg0: string) {
throw new Error('Method not implemented.');
}
  job?: Job;
  delivery = '';
  code: any;
  verification_code: any;
  email: any;
  password: any;
  UX_MODALS = UX_MODALS;
  user?: User;
  showForgotPassword = false;
  showRegister = false;

  constructor(
    private jobService: JobService,
    private uxService: UxService,
    private router: Router,
    private userServcice: UserService
  ) {
    jobService.$job.subscribe((job) => {
      if (job) this.job = job;
    });
    this.user = this.userServcice.getUser;
  }
 
  login() {
    if (!this.email || !this.password) return;
    this.userServcice
      .login({
        Email: this.email,
        Password: this.password,
      })
      .subscribe((user) => {
        if (user && user.CreateDate) {
          this.userServcice.updateUserState(user);
          this.uxService.show_toast('Login successful', 'success');
          this.user = user;
          this.after_login();
        } else {
          this.uxService.show_toast('Invalid email or password', 'error');
        }
      });
  }

  get is_admin() {
    return this.user?.UserType === 'Admin';
  }

  get is_customer() {
    return this.user?.UserType === 'Customer';
  }
  after_login() {
    // If job is present, show delivery method modal.
    if (this.job && this.is_customer) {
      this.uxService.show_modal(UX_MODALS.delivery_method);
    }
    if (!this.job && this.is_customer) {
      // this.router.navigate(['/home/my-profile']);
      this.uxService.show_modal(UX_MODALS.profile);
    }
    if (this.is_admin) {
      this.router.navigate(['/store/admin']);
      this.uxService.show_modal('');
    }
    // If job is not present, navigate to the user's dashboard(admin) or navigate to profile(Customer).
  }
}
