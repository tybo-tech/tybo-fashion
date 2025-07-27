import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { JobCard, JobItem } from 'src/models/job-item.model';
import { initMeasurements } from 'src/models/measurement.model';
import { User } from 'src/models/user.model';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-job-card',
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.scss'],
})
export class JobCardComponent implements OnInit {
  jobItem?: JobItem;
  @Input({ required: true }) jobItemId!: string;
  @Input({ required: true }) jobCard!: JobCard;
  @Output() onClose = new EventEmitter<any>();
  user?: User;
  users: User[] = [];

  constructor(
    private jobService: JobService,
    private uxService: UxService,
    private userService: UserService
  ) {}
  ngOnInit(): void {
    this.userService.userObservable?.subscribe((user) => {
      this.user = user;
    });
    this.userService.userListObservable?.subscribe((data) => {
      this.users = data;
    });
    this.get();
  }
  get() {
    this.jobService.getJobItemById(this.jobItemId).subscribe((data) => {
      if (data && data.JobItemId) {
        this.jobItem = data;
      }
    });
  }
  onUserChange(users: User[]) {
    if (!this.jobItem || !this.jobItem.Metadata) return;
    this.jobItem.Metadata.AssignedToName = users.find(
      (u) => u.UserId === this.jobItem?.Metadata.AssignedTo
    )?.Name;
  }
  sizeChanged(event: string) {
    if (event === 'Measurements' && this.jobItem) {
      this.jobItem.Metadata.Measurements = [
        initMeasurements('Waist', '', ''),
        initMeasurements('Hips', '', ''),
        initMeasurements('Chest', '', ''),
      ];
    }
  }
  updateJobItem(){
    this.jobItem && this.jobService.updateJobItem(this.jobItem).subscribe((data) => {
      if (data && data.JobItemId) {
        this.jobItem = data;
        this.uxService.show_toast('Item updated', 'success');
      }
    });
  }
  get jobCardPrint() {
    return Constants.PrintJobCard + this.jobItem?.JobItemId;
  }
  get isMeasurements() {
    return (
      this.jobItem?.Size === 'Measurements' || this.jobItem?.Size === 'Later'
    );
  }
}
