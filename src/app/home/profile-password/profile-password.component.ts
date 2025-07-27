import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';
import { BaseProfileComponent } from '../BaseProfileComponent';

@Component({
  selector: 'app-profile-password',
  templateUrl: './profile-password.component.html',
  styleUrls: ['./profile-password.component.scss'],
})
export class ProfilePasswordComponent extends BaseProfileComponent {

  constructor(userService: UserService, router: Router, uxService: UxService) {
    super(userService, router, uxService);
  }
}
