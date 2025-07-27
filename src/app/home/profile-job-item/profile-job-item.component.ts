import { Component, Input } from '@angular/core';
import { JobItem } from 'src/models/job-item.model';
import { Job } from 'src/models/job.model';

@Component({
  selector: 'app-profile-job-item',
  templateUrl: './profile-job-item.component.html',
  styleUrls: ['./profile-job-item.component.scss']
})
export class ProfileJobItemComponent {
  editMode = false;
  @Input() jobItem?: JobItem;
  @Input() job?: Job;
}
