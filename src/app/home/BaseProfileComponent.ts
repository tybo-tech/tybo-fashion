import { Router } from '@angular/router';
import { User } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

export class BaseProfileComponent {
  UX_MODALS = UX_MODALS;
  user?: User;
  newPassword = '';
  oldPassword = '';
  constructor(
    protected userService: UserService,
    protected router: Router,
    public uxService: UxService
  ) {
    this.user = this.userService.getUser;
    if (this.user && !this.user.Measurements) this.user.Measurements = [];
  }
  updatePassword(backTo = '') {
    if (!this.user) {
      this.uxService.show_toast('User not found', 'Error', [
        'bg-danger',
        'text-white',
      ]);
      return;
    }
    if (!this.newPassword || !this.oldPassword) {
      this.uxService.show_toast('Please enter old and new password', 'Error', [
        'bg-danger',
        'text-white',
      ]);
      return;
    }
    if (this.oldPassword !== this.user?.Password) {
      this.uxService.show_toast('Old password is incorrect', 'Error', [
        'bg-danger',
        'text-white',
      ]);
      return;
    }
    this.user.Password = this.newPassword;
    this.save(backTo);
  }
  save(backTo = '') {
    this.user &&
      this.userService.save(this.user).subscribe((data) => {
        if (data && data.UserId)
          this.uxService.show_toast('Profile updated successfully', 'Success', [
            'bg-success',
            'text-white',
          ]);
          this.userService.updateUserState(data);
        if (backTo) this.uxService.show_modal(backTo);
      });
  }
}
