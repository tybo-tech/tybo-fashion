import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Job } from 'src/models/job.model';
import { User } from 'src/models/user.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-phone-top-bar',
  templateUrl: './phone-top-bar.component.html',
  styleUrls: ['./phone-top-bar.component.scss'],
})
export class PhoneTopBarComponent {
  @Input() logo_url: string = '';
  @Input() logo_url_to: string = '/';
  @Input() user?: User;
  @Output() toggleNav = new EventEmitter<any>();
  job?: Job;
  cart_count = 0;
  constructor(
    private jobService: JobService,
    private uxService: UxService
  ) {
    jobService.$job.subscribe((job) => {
      if (job) {
        this.job = job;
        this.cart_count = jobService.cart_count(this.job);
      } else {
        this.cart_count = 0;
        this.job = undefined;
      }
    });
  
  }
  toggle_cart() {
    this.uxService.show_cart_modal();
  }
}
