import { Component } from '@angular/core';
import { Job } from 'src/models/job.model';
import { UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent {
  job?: Job;
  delivery = '';
  code: any;
  verification_code: any;

  constructor(private jobService: JobService, private uxService: UxService) {
    jobService.$job.subscribe((job) => {
      if (job) this.job = job;
    });
  }
  open(){
    this.uxService.show_modal(UX_MODALS.verify);
  }
  closeCart() {}
  checkout() {}
}
