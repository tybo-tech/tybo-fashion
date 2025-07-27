import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/models/user.model';
import { EmailService } from 'src/services/email.service';
import { UserEmailHelper } from 'src/services/email.service.user.helper';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  returnTo = '';
  email = '';

  constructor(
    private uxService: UxService,
    private userServcice: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private emailService: EmailService
  ) {
    this.route.params.subscribe((params) => {
      this.returnTo = params['returnTo'] ?? '';
    });
  }

  get isCheckoutReturn() {
    return this.returnTo === 'checkout';
  }

  get isEmailValid() {
    const splitEmail = this.email.split('@');
    if (splitEmail.length < 2) return false;
    return this.email.length && splitEmail[1]?.includes('.');
  }

  valiDateUser() {
    if (!this.isEmailValid) {
      this.uxService.show_toast(
        'Please enter a valid email address',
        'Invalid email',
        ['bg-warning', 'text-dark']
      );
      return;
    }
    this.userServcice.verifyEmail(this.email).subscribe((response) => {
      if (response && response.UserToken) {
        this.sendLink(response);
      }
      this.uxService.show_toast(
        'If the email address is registered, a password reset link will be sent to the email address, check your email',
        'Password reset link',
        ['bg-success', 'text-white']
      );
    });
  }
  sendLink(user: User) {
    const helper = new UserEmailHelper(this.emailService, user);
    helper.sendPasswordResetEmail();
  }
}
