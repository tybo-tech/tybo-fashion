import { Component } from '@angular/core';
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
    shop_name: '',
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
    this.route.queryParams.subscribe((params) => {
      const type = params['type'] === 'designer' ? 'Admin' : 'Customer';
      if (type !== this.typeOfUser) {
        this.typeOfUser = type;
        this.new_user = initUser(this.typeOfUser);
      }
    });
    this.user = this.userServcice.getUser;
  }

  get isDesigner() {
    return this.typeOfUser === 'Admin';
  }

  sign_up() {
    if (!this.validate()) return;
    if (this.isDesigner) {
      this.registerDesigner();
      return;
    }
    this.registerCustomer();
  }
  private registerCustomer() {
    this.userServcice.save(this.new_user).subscribe((user) => {
      if (user && user.CreateDate) {
        this.uxService.show_toast('Sign up successful', 'success');
        this.userServcice.updateUserState(user);
        this.afterSignup();
      } else {
        this.handleError(user as any);
      }
    });
  }
  private registerDesigner() {
    const shopName = this.new_user.CompanyName || this.new_user.Name;
    this.new_user = {
      ...this.new_user,
      UserType: 'Admin',
      ParentCompanyId: 'tybofashion.co.za',
      CompanyName: shopName,
      CreateUserId: this.new_user.Email,
      ModifyUserId: this.new_user.Email,
    };
    this.userServcice.registerDesigner(this.new_user).subscribe((user) => {
      if (user && user.CreateDate) {
        this.userServcice.updateUserState(user);
        this.uxService.show_toast(
          'Designer account created, welcome to Tybo Fashion',
          'Sign up successful',
          ['bg-success', 'text-light']
        );
        this.router.navigate(['/store/admin']);
      } else {
        this.handleError(user as any);
      }
    });
  }
  private afterSignup() {
    if (this.isCheckoutReturn) {
      this.router.navigate([`/home/checkout`]);
      return;
    }
    this.router.navigate([`/`]);
    this.uxService.show_modal(UX_MODALS.profile);
  }
  private handleError(response: any) {
    const message = Array.isArray(response)
      ? response.filter((x) => typeof x === 'string').join(' ')
      : `${response ?? ''}`;
    if (message.includes('exist')) {
      this.uxService.show_toast(
        `User with email : ${this.new_user.Email} already exist.`,
        'User already exist',
        ['bg-warning', 'text-dark']
      );
    } else {
      this.uxService.show_toast(
        message || 'Something went wrong, please try again.',
        'Error',
        ['bg-danger', 'text-white']
      );
    }
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
      shop_name: '',
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
    if (this.isDesigner && !this.new_user.CompanyName) {
      this.errors.shop_name = 'Shop name is required';
      valid = false;
    }

    return valid;
  }
}
