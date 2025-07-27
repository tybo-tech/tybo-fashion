import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { JobItem } from 'src/models/job-item.model';
import { initMeasurements } from 'src/models/measurement.model';
import { User } from 'src/models/user.model';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-job-item-form',
  templateUrl: './job-item-form.component.html',
  styleUrls: ['./job-item-form.component.scss'],
})
export class JobItemFormComponent implements OnInit {
  @Input() jobItem?: JobItem;
  @Input({ required: true }) user!: User;
  @Output() jobItemUpdated = new EventEmitter<JobItem>();
  @Output() onClose = new EventEmitter<any>();
  users: User[] = [];
  constructor(private userService: UserService) {}
  ngOnInit(): void {
    this.userService.userListObservable?.subscribe((data) => {
      this.users = data;
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
  get isMeasurements() {
    return (
      this.jobItem?.Size === 'Measurements' || this.jobItem?.Size === 'Later'
    );
  }
  get jobCard() {
    return Constants.PrintJobCard + this.jobItem?.JobItemId;
  }
}
