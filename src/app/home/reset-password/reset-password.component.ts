import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/models/user.model';
import { EmailService } from 'src/services/email.service';
import { UserEmailHelper } from 'src/services/email.service.user.helper';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  token = '';
  password = '';
  password2 = '';
  seePass = false;
  seePass2 = false;
  rules = [
    {
      rule: 'At least 8 characters long',
      valid: false,
    },
    {
      rule: 'Contains at least one number',
      valid: false,
    },
    {
      rule: 'Contains at least one special character',
      valid: false,
    },
    {
      rule: 'Contains at least one uppercase letter',
      valid: false,
    },
    {
      rule: 'Contains at least one lowercase letter',
      valid: false,
    },
  ];

  constructor(
    private uxService: UxService,
    private userServcice: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private emailService: EmailService
  ) {
    this.route.params.subscribe((params) => {
      this.token = params['token'] ?? '';
    });
  }
  checkRules() {
    this.rules.forEach((rule) => {
      if (rule.rule === 'At least 8 characters long') {
        rule.valid = this.password.length >= 8;
      }
      if (rule.rule === 'Contains at least one number') {
        rule.valid = /\d/.test(this.password);
      }
      if (rule.rule === 'Contains at least one special character') {
        rule.valid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
          this.password
        );
      }
      if (rule.rule === 'Contains at least one uppercase letter') {
        rule.valid = /[A-Z]/.test(this.password);
      }
      if (rule.rule === 'Contains at least one lowercase letter') {
        rule.valid = /[a-z]/.test(this.password);
      }
    });
  }
  get allRulesValid() {
    return this.rules.every((rule) => rule.valid);
  }
  valiDateUser() {
    if (!this.password || !this.password2) {
      this.uxService.show_toast(
        'Passwords Required',
        'Please enter your password and confirm it',
        ['bg-warning', 'text-dark']
      );
      return;
    }
    if (this.password !== this.password2) {
      this.uxService.show_toast(
        'Passwords do not match',
        'The passwords you entered do not match',
        ['bg-warning', 'text-dark']
      );
      return;
    }
    this.userServcice
      .changePassword(this.token, this.password)
      .subscribe((response) => {
        if (response && response.isSuccess) {
          this.uxService.show_toast(
            'Your password has been changed successfully, please sign in with your new password',
            'Password Changed',
            ['bg-success', 'text-white']
          );
          this.router.navigate(['/home/sign-in']);
        }
      });
  }
  sendLink(user: User) {
    const helper = new UserEmailHelper(this.emailService, user);
    helper.sendPasswordResetEmail();
  }
}
