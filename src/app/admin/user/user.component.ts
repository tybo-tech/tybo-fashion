import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from 'src/constants/Constants';
import { User, UserShift } from 'src/models/user.model';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  user?: User;
  showAddShift = false;
  admin = this.userService.getUser;
  prevPage = '/store/admin/users';
  roles = Constants.Roles.map((role) => {
    return { label: role, value: role };
  });
  showUser = false;
  constructor(
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private uxService: UxService
  ) {
    activatedRoute.params.subscribe((params) => {
      this.getUser(params['id']);
    });
  }
  getUser(arg0: any) {
    this.userService.getUserById(arg0).subscribe((data) => {
      if (data && data.UserId) {
        this.user = data;
      }
    });
  }

  save() {
    if (this.user) {
      this.userService.save(this.user).subscribe((data) => {
        if (data && data.UserId) {
          this.user = data;
          this.uxService.show_toast('User updated successfully', 'Success', [
            'bg-success',
            'text-white',
          ]);
          this.router.navigate([this.prevPage]);
        }
      });
    }
  }

  shiftAdded(shift: UserShift) {
    if (this.user) {
      if (!this.user.Metadata.UserShifts) this.user.Metadata.UserShifts = [];
      this.user.Metadata.UserShifts.push(shift);
      this.save();
      this.showAddShift = false;
    }
  }
}
