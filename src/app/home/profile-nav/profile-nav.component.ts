import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-profile-nav',
  templateUrl: './profile-nav.component.html',
  styleUrls: ['./profile-nav.component.scss'],
})
export class ProfileNavComponent {
  @Input({ required: true }) user!: User;
  @Output() signOut = new EventEmitter();
  constructor(private uxService: UxService) {}
  get isAdmin() {
    return this.user.UserType === 'Admin';
  }
  get isCustomer() {
    return this.user.UserType === 'Customer';
  }
  get shopUrl() {
    return this.user.Company?.Slug || '';
  }
  showProfile() {
    this.uxService.show_modal(UX_MODALS.profile);
  }
}
