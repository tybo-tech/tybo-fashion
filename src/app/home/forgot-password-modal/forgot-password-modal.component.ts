import { Component } from '@angular/core';
import { Job } from 'src/models/job.model';
import { UX_MODALS } from 'src/models/ux.model';
import { JobService } from 'src/services/job.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.scss'],
})
export class ForgotPasswordModalComponent {
  job?: Job;
  delivery = '';
  code: any;
  verification_code: any;
  UX_MODALS = UX_MODALS;
  email: any;
  constructor(private jobService: JobService, private uxService: UxService) {
    jobService.$job.subscribe((job) => {
      if (job) this.job = job;
    });
  }
  open(modal: string) {
    this.uxService.show_modal(modal);
  }
  send_link() {
    alert('Link sent to email');
  }
}
