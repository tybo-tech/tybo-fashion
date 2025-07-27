import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';
import { BaseProfileComponent } from '../BaseProfileComponent';

@Component({
  selector: 'app-profile-contact',
  templateUrl: './profile-contact.component.html',
  styleUrls: ['./profile-contact.component.scss']
})
export class ProfileContactComponent extends BaseProfileComponent {
  constructor(userService: UserService, router: Router, uxService: UxService) {
    super(userService, router, uxService);
  }

}
