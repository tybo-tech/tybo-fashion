import { Component, Input } from '@angular/core';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { UX_MODALS } from 'src/models/ux.model';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-customer-job-details',
  templateUrl: './customer-job-details.component.html',
  styleUrls: ['./customer-job-details.component.scss'],
})
export class CustomerJobDetailsComponent {
  @Input() job?: Job;
  UX_MODALS = UX_MODALS;
  user?: User;
  constructor(private userServcice: UserService, private uxService: UxService) {
    this.user = this.userServcice.getUser;
  }
  open(modal: string) {
    this.uxService.show_modal(modal);
  }
}
