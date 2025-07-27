import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { initUserShift, User, UserShift } from 'src/models/user.model';

@Component({
  selector: 'app-add-shift',
  templateUrl: './add-shift.component.html',
  styleUrls: ['./add-shift.component.scss'],
})
export class AddShiftComponent implements OnInit {
  save() {
    this.shiftAdded.emit(this.shift);
  }
  shiftTypes = ['Day', 'Night'].map((type) => {
    return { label: type, value: type };
  });
  @Input({ required: true }) user!: User;
  @Output() shiftAdded = new EventEmitter<UserShift>();
  @Output() onClose = new EventEmitter<any>();
  shift = initUserShift();
  ngOnInit(): void {
    this.shift.UserId = this.user.UserId;
    this.shift.ShiftDate = new Date() + '';
  }
  dateChanged() {
    if (this.shift.Type === 'Day') {
      this.shift.StartTime = '0:00';
      this.shift.EndTime = '17:00';
      this.shift.Price = this.user.Metadata.RatePerDay;
    }

    if (this.shift.Type === 'Night') {
      this.shift.StartTime = '17:00';
      this.shift.EndTime = '06:00';
      this.shift.Price = this.user.Metadata.RatePerNight;
    }
  }
}
