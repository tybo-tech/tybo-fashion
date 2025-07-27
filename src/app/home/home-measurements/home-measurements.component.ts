import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { IMeasurement } from 'src/models/measurement.model';
import { OtherInfo } from 'src/models/other-info.model';
import { IKeyValue } from 'src/models/ux.model';
import { MeasurementsService } from 'src/services/measurements.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-home-measurements',
  templateUrl: './home-measurements.component.html',
  styleUrls: ['./home-measurements.component.scss'],
})
export class HomeMeasurementsComponent implements OnInit {
  handleUnitSelection(unit: IKeyValue) {
    this.units = unit.Key;
    this.onUnits();
  }
  @Input() measurements: IMeasurement[] = [];
  @Input() can_add = true;
  @Input() can_delete = true;
  @Input() can_edit = true;
  @Input() required = true;
  @Input() showInofNotice = true;
  @Input() systemMeasurements?: OtherInfo<IMeasurement[]>;
  @Input() onSuccess = {
    title: 'Measurements captured',
    message: 'You can now add item to cart',
  };
  @Output() onCaptured = new EventEmitter<IMeasurement[]>();
  units = 'Cm';
  showHelp = false;
  unit_error = '';
  values_error = '';
  systemUnits: IKeyValue[] = Constants.Units.map((x) => {
    return { Key: x, Value: x };
  });

  constructor(
    private uxService: UxService,
    private userService: UserService,
    private measurementsService: MeasurementsService
  ) {}
  ngOnInit(): void {
    if (this.measurements && this.measurements.length > 0) {
      this.units = this.measurements[0].Units || 'Cm';
      this.getFromLocalStorage();
      !this.systemMeasurements && this.getSystemMeasurements();
    }
  }
  getSystemMeasurements() {
    const id = '80edddf9-6fc0-11eb-9698-12911df8ace9';
    this.measurementsService.measurements(id).subscribe((data) => {
      if (data && data.length && data[0].ItemValue) {
        this.systemMeasurements = data[0];
      }
    });
  }
  delete(index: number) {
    this.measurements.splice(index, 1);
  }
  add_measurement() {
    this.measurements.push({ Units: '', Value: '', Image: '', Name: '' });
  }

  onUnits() {
    this.measurements.map((m) => {
      m.Units = this.units;
    });
  }
  onDone() {
    this.unit_error = '';
    this.values_error = '';
    if (!this.units) {
      this.unit_error =
        'Measurement units are required, Use the dropdown on top to select units';
      return;
    }

    // Check if all measurements have values if required
    this.required &&
      this.measurements.forEach((m) => {
        if (!m.Value) {
          this.values_error =
            'All measurements are required, please enter values to proceed';
          return;
        }
      });
    if (this.unit_error || this.values_error) {
      return;
    }
    this.uxService.show_toast(this.onSuccess.message, this.onSuccess.title, [
      'bg-success',
      'text-white',
    ]);
    this.onUnits();
    this.onCaptured.emit(this.measurements);
    localStorage.setItem(
      Constants.UnitsStore,
      JSON.stringify(this.measurements)
    );
    this.updateUserMeasurements();
  }
  updateUserMeasurements() {
    const user = this.userService.getUser;
    if (user && user.Measurements) {
      this.measurements.forEach((m) => {
        const find = user.Measurements.find((x) => x.Name === m.Name);
        if (find) {
          find.Value = m.Value;
        }
      });
      this.userService.save(user).subscribe((u) => {
        if (u && u.UserId) {
          this.userService.updateUserState(u);
        }
      });
    }
  }

  // If the user has previously saved measurements, load them from local storage
  // If the user is logged in, load the measurements from the user object
  // If the user is not logged in, load the measurements from local storage

  getFromLocalStorage() {
    const user = this.userService.getUser;
    if (user && user.Measurements && user.Measurements.length > 0) {
      user.Measurements.forEach((m) => {
        const find = this.measurements.find((x) => x.Name === m.Name);
        if (find) {
          const index = this.measurements.indexOf(find);
          if (index > -1) {
            this.measurements[index].Value = m.Value;
          }
        }
      });
      return;
    }
    const saved = localStorage.getItem(Constants.UnitsStore);
    if (saved) {
      const measurements: IMeasurement[] = JSON.parse(saved);
      this.measurements.forEach((m, i) => {
        const find = measurements.find((x) => x.Name === m.Name);
        if (find) {
          m.Value = find.Value;
        }
      });
    }
  }
}
