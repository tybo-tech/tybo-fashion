import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { initUser, User } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  new_user: User;
  returnTo = '';
  typeOfUser = 'Customer';
  errors = {
    email: '',
    password: '',
    name: '',
  };
  user?: User;
  constructor(
    private uxService: UxService,
    private userServcice: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe((params) => {
      this.returnTo = params['returnTo'] ?? '';
    });
    this.new_user = initUser(this.typeOfUser);
    this.user = this.userServcice.getUser;
  }

  sign_up() {
    if (!this.validate()) return;
    this.userServcice.save(this.new_user).subscribe((user) => {
      if (user && user.CreateDate) {
        this.uxService.show_toast('Sign up successful', 'success');
        this.userServcice.updateUserState(user);
        if (this.isCheckoutReturn) {
          this.router.navigate([`/home/checkout`]);
          return;
        }
        this.router.navigate([`/`]);
        this.uxService.show_modal(UX_MODALS.profile);
      } else {
        const response: any = user;
        if (response.includes('exist')) {
          this.uxService.show_toast(
            `User with email : ${this.new_user.Email} already exist.`,
            'User already exist'
          );
        } else this.uxService.show_toast(response, 'error');
      }
    });
  }
  get isCheckoutReturn() {
    return this.returnTo === 'checkout';
  }
  validate() {
    let valid = true;
    this.errors = {
      email: '',
      password: '',
      name: '',
    };
    if (!this.new_user.Email) {
      this.errors.email = 'Email is required';
      valid = false;
    }
    if (!this.new_user.Password) {
      this.errors.password = 'Password is required';
      valid = false;
    }
    if (!this.new_user.Name) {
      this.errors.name = 'Name is required';
      valid = false;
    }

    return valid;
  }
}
