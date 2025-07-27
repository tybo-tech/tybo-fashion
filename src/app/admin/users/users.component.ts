import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User, initUser } from 'src/models/user.model';
import { CustomerService } from 'src/services/customer.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  users?: User[];
  user = this.userService.getUser;
  quary: any;
  show_add: any;
  new_user?: User;
  constructor(private userService: UserService, private router: Router) {
    this.getUsers();
  }
  getUsers() {
    this.user &&
      this.userService.getUsers(this.user.CompanyId).subscribe((data) => {
        this.users = data;
      });
  }
  initUser() {
    this.new_user = initUser('Staff');
    this.new_user.CompanyId = this.user?.CompanyId || '';
    this.new_user.CreateUserId = this.user?.UserId || '';
  }
}
