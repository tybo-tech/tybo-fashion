import { User } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

export class SmartModal {
  UX_MODALS = UX_MODALS;
  user?: User;
  constructor(public uxService: UxService, public userService: UserService) {
    userService.userObservable?.subscribe((u) => {
      this.user = u;
    });
  }

  open(modal: string) {
    this.uxService.show_modal(modal);
  }

  get isAdmin() {
    return this.user?.UserType === 'Admin';
  }

  get isCustomer() {
    return this.user?.UserType === 'Customer';
  }

  logout() {
    this.userService.logout(undefined);
    location.reload();
  }
}
