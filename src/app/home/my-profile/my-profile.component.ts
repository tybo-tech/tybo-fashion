import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/models/user.model';
import { IMenu } from 'src/models/util.menu.model';
import { UX_MODALS } from 'src/models/ux.model';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent implements OnInit {
  menuItems: IMenu[] = [];

  UX_MODALS = UX_MODALS;
  user?: User;
  constructor(
    private userService: UserService,
    private router: Router,
    public uxService: UxService
  ) {
   const id = this.userService.getUser?.UserId;
   id && this.getUser(id);
  }
  getUser(id: string) {
   this.userService.getUserById(id).subscribe((data) => {
      if (data && data.UserId) {
        this.user = data;
        this.userService.updateUserState(data);
        this.load_menu();
      }
   });
  }

  ngOnInit(): void {
    if (this.user) {
      this.load_menu();
    }
  }

  load_menu() {
    this.menuItems = [
      {
        name: 'My Contact details',
        description: '',
        count: 0,
        link: UX_MODALS.profile_contact,
      },
      {
        name: 'Delivery Address',
        description: '',
        count: 0,
        link: UX_MODALS.profile_address,
      },
      {
        name: 'My Measurements',
        description: '',
        count: 0,
        link: UX_MODALS.profile_measurements,
      },
   
      {
        name: 'Change Password',
        description: '',
        count: 0,
        link: UX_MODALS.profile_password,
      },
      {
        name: 'My Orders',
        description: '',
        count: 0,
        link: UX_MODALS.profile_orders,
      },
      {
        name: 'My Favorites',
        description: 'My favorite',
        count: 0,
        link: UX_MODALS.favorites,
      },
    ];
  }
  logout() {
    this.userService.logout(undefined);
    location.href = '/zalou';
  }
}
