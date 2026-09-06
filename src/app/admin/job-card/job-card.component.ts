import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { JobCard, JobItem } from 'src/models/job-item.model';
import { initMeasurements } from 'src/models/measurement.model';
import { User } from 'src/models/user.model';
import {
  JobService,
  isValidGarmentMutationResponse,
} from 'src/services/job.service';
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
  saving = false;

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
    // Audit fix §7.6: the legacy updateJobItem() did not recalculate job
    // totals. The card now saves through the transactional endpoint — the
    // item and the parent job totals persist in one server transaction.
    if (!this.jobItem || !this.user?.CompanyId || this.saving) return;
    this.saving = true;
    this.jobService
      .updateJobItemTransactional(
        this.user.CompanyId,
        this.jobItem.JobId,
        this.jobItem.JobItemId,
        this.jobItem
      )
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (
            !isValidGarmentMutationResponse(
              res,
              'edit',
              this.jobItem?.JobItemId
            )
          ) {
            this.uxService.show_toast(
              'The change was not saved as expected. Please try again.',
              'Error'
            );
            return;
          }
          if (res.garment) {
            this.jobItem = res.garment;
          }
          this.uxService.show_toast('Item updated', 'success');
        },
        error: () => {
          this.saving = false;
          this.uxService.show_toast(
            'Failed to save the item. Please try again.',
            'Error'
          );
        },
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
