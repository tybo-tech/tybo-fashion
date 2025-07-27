import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';
import { BaseProfileComponent } from '../BaseProfileComponent';

@Component({
  selector: 'app-profile-address',
  templateUrl: './profile-address.component.html',
  styleUrls: ['./profile-address.component.scss']
})
export class ProfileAddressComponent extends BaseProfileComponent {
  constructor(userService: UserService, router: Router, uxService: UxService) {
    super(userService, router, uxService);
  }

}
