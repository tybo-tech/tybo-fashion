import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  signInForm: FormGroup;
  returnTo = '';
  returnUrl = '';
  seePass = false;
  constructor(
    private fb: FormBuilder,
    private userServcice: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private uxService: UxService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    route.params.subscribe((params) => {
      this.returnTo = params['returnTo'] ?? '';
    });
  }

  ngOnInit(): void {
    // extract returnUrl for url
    this.route.queryParams.subscribe((params) => {
      this.returnUrl = params['returnUrl'];
    });
    if (this.userServcice.getUser?.UserType) {
      this.after_sign_in(this.userServcice.getUser);
    }
  }

  login(): void {
    if (this.signInForm.valid) {
      const { email, password } = this.signInForm.value;
      this.userServcice
        .login({ Email: email, Password: password })
        .subscribe((user) => {
          if (user && user.UserId) {
            this.userServcice.updateUserState(user);
            this.after_sign_in(user);
            this.uxService.show_toast(
              'You have successfully signed in',
              'Sign in success',
              ['bg-success', 'text-light']
            );
          } else {
            this.uxService.show_toast(
              'The username or password is incorrect, please try again or reset your password',
              'Invalid credentials',
              ['bg-warning', 'text-dark']
            );
          }
        });
    }
  }
  after_sign_in(user: User) {
    if (this.isCheckoutReturn) {
      this.router.navigate([`/home/checkout`]);
      return;
    }
    if ('Admin' === user.UserType) {
      this.router.navigate(['/store/admin']);
      return;
    }
    if (this.returnUrl) {
      window.location.href = this.returnUrl;
    }
    this.router.navigate(['/']);
    this.uxService.show_modal(UX_MODALS.profile);
  }

  get isCheckoutReturn() {
    return this.returnTo === 'checkout';
  }
}
