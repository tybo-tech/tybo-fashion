import { Component, Input } from '@angular/core';
import { JobItem } from 'src/models/job-item.model';
import { Job } from 'src/models/job.model';

@Component({
  selector: 'app-profile-job-items',
  templateUrl: './profile-job-items.component.html',
  styleUrls: ['./profile-job-items.component.scss']
})
export class ProfileJobItemsComponent {
  @Input() job?: Job;
  jobItem?: JobItem;
}
