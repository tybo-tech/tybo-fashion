import { Component } from '@angular/core';
import { UX_MODALS, UxModel } from 'src/models/ux.model';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {

  UX_MODALS = UX_MODALS;
  ux?: UxModel;
  cartOpen = false
  constructor(private uxService: UxService) {
    uxService.$ux.subscribe((data) => {
      this.ux = data;
    });

    uxService.$ux.subscribe((ux) => {
      this.ux = ux;
      this.cartOpen = ux.Modal === UX_MODALS.cart;
    });
  }
  clearToast() {
    this.uxService.clear_toast();
    }
}
