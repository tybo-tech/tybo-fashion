import { Component, Input } from '@angular/core';
import { Job } from 'src/models/job.model';

@Component({
  selector: 'app-list-job-items',
  templateUrl: './list-job-items.component.html',
  styleUrls: ['./list-job-items.component.scss'],
})
export class ListJobItemsComponent {
  @Input() job?: Job;
}
