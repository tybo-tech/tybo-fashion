import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { JobItem } from 'src/models/job-item.model';
import { initMeasurements } from 'src/models/measurement.model';
import { User } from 'src/models/user.model';
import { UserService } from 'src/services/user.service';

/**
 * Reusable job-item form: presentation only. Loading, persistence and
 * navigation are owned by the routed JobItemPageComponent (no overlay,
 * no modal chrome, no close-X assumptions). Emits `save` on submit.
 */
@Component({
  selector: 'app-job-item-form',
  templateUrl: './job-item-form.component.html',
  styleUrls: ['./job-item-form.component.scss'],
})
export class JobItemFormComponent implements OnInit, OnDestroy {
  @Input() jobItem?: JobItem;
  @Input({ required: true }) user!: User;
  @Input() saving = false;
  @Output() save = new EventEmitter<JobItem>();
  @Output() cancel = new EventEmitter<void>();
  users: User[] = [];
  private usersSub?: { unsubscribe(): void };
  constructor(private userService: UserService) {}
  ngOnInit(): void {
    this.usersSub = this.userService.userListObservable?.subscribe((data) => {
      this.users = data;
    });
  }
  ngOnDestroy(): void {
    this.usersSub?.unsubscribe();
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
  submit() {
    if (this.jobItem && !this.saving) {
      this.save.emit(this.jobItem);
    }
  }
  onCancel() {
    if (!this.saving) {
      this.cancel.emit();
    }
  }
}