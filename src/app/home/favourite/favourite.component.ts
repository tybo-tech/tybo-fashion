import { Component } from '@angular/core';
import { SmartModal } from '../SmartModal';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-favourite',
  templateUrl: './favourite.component.html',
  styleUrls: ['./favourite.component.scss']
})
export class FavouriteComponent extends SmartModal{
  constructor(uxService: UxService, userService: UserService) {
    super(uxService, userService);
  }
  get favourites() {
    return this.user?.Favorites || [];
  }
}
