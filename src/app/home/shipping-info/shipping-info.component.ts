import { Component } from '@angular/core';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-shipping-info',
  templateUrl: './shipping-info.component.html',
  styleUrls: ['./shipping-info.component.scss'],
})
export class ShippingInfoComponent {
  user?: User;
  provinces_list = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape',
  ];
  constructor(private uxService: UxService, private userServcice: UserService) {
    this.user = this.userServcice.getUser;
  }
  save() {
    if (!this.user) return;
    this.userServcice.save(this.user).subscribe((user) => {
      if (user && user.CreateDate) {
        this.userServcice.updateUserState(user);
        this.uxService.show_toast('Shipping info saved', 'success');
        this.uxService.show_modal(UX_MODALS.delivery_method);
      }
    });
  }
  close() {}
}
