import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from 'src/models/user.model';
import { IMenu } from 'src/models/util.menu.model';
import { SmartModal } from '../SmartModal';
import { UxService } from 'src/services/ux.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-phone-nav',
  templateUrl: './phone-nav.component.html',
  styleUrls: ['./phone-nav.component.scss'],
})
export class PhoneNavComponent extends SmartModal {
  @Input() navItems: IMenu[] = [];
  @Output() nav_closed = new EventEmitter<any>();
  constructor(uxService: UxService, userService: UserService) {
    super(uxService,userService);
  }
  on_overlay(event: MouseEvent) {
    if ('nav-wrapper' === (event.target as HTMLElement).id) {
      this.nav_closed.emit();
    }
  }
}
