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

  // Helper methods for the enhanced UI
  getInitials(name: string, surname: string): string {
    const firstInitial = name ? name.charAt(0).toUpperCase() : '';
    const lastInitial = surname ? surname.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  getActiveUsers(): number {
    return this.users ? this.users.filter(user => user.StatusId === 1).length : 0;
  }

  getStaffCount(): number {
    return this.users ? this.users.filter(user => user.UserType === 'Staff').length : 0;
  }

  getAdminCount(): number {
    return this.users ? this.users.filter(user => user.UserType === 'Admin').length : 0;
  }

  callUser(user: User, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (user.PhoneNumber) {
      window.open(`tel:${user.PhoneNumber}`, '_self');
    }
  }

  emailUser(user: User, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (user.Email) {
      window.open(`mailto:${user.Email}`, '_self');
    }
  }
}
