import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { User } from 'src/models/user.model';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent {
  @Input() user: User | undefined;
  @Output() closed = new EventEmitter<any>();
  @Output() done = new EventEmitter<User>();
  roles = Constants.Roles.map((role) => {
    return { label: role, value: role };
  });
  constructor(private userService: UserService, private uxS: UxService) {}
  save() {
    this.user &&
      this.userService.save(this.user).subscribe((data) => {
        if (data && data.UserId) {
          this.uxS.show_toast('User saved successfully', 'Success', [
            'bg-success',
            'text-white',
          ]);
          this.done.emit(data)
        } else {
          this.uxS.show_toast('User not saved', 'Error', [
            'bg-danger',
            'text-white',
          ]);
          this.closed.emit(data);
        }
      });
  }
}
