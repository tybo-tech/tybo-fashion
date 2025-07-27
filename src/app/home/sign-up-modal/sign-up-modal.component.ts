import { Component } from '@angular/core';
import { Job } from 'src/models/job.model';
import { User, initUser } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-sign-up-modal',
  templateUrl: './sign-up-modal.component.html',
  styleUrls: ['./sign-up-modal.component.scss'],
})
export class SignUpModalComponent {
  job?: Job;
  UX_MODALS = UX_MODALS;
  new_user = initUser('Customer');
  errors = {
    email: '',
    password: '',
    name: '',
    phone_number: '',
  };
  user?: User;
  constructor(
    private jobService: JobService,
    private uxService: UxService,
    private userServcice: UserService
  ) {
    jobService.$job.subscribe((job) => {
      if (job) this.job = job;
    });
    this.user = this.userServcice.getUser;
  }
  open(modal: string) {
    this.uxService.show_modal(modal);
  }
  sign_up() {
    if (!this.validate()) return;
    this.userServcice.save(this.new_user).subscribe((user) => {
      if (user && user.CreateDate) {
        this.uxService.show_toast('Sign up successful', 'success');
        this.uxService.show_modal(UX_MODALS.shipping_info);
        this.userServcice.updateUserState(user);
      }else{
        const response:any = user;
        if(response.includes('exist')){
          this.uxService.show_toast(`User with email : ${this.new_user.Email} already exist.`, 'User already exist');
        }
        else
        this.uxService.show_toast(response, 'error');
      }
    });
  }
  validate() {
    let valid = true;
    this.errors = {
      email: '',
      password: '',
      name: '',
      phone_number: '',
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
    if (!this.new_user.PhoneNumber) {
      this.errors.phone_number = 'Phone number is required';
      valid = false;
    }
    return valid;
  }
}
