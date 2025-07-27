import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { Product } from 'src/models/Product';
import { IMeasurement } from 'src/models/measurement.model';

@Component({
  selector: 'app-admin-measurements',
  templateUrl: './admin-measurements.component.html',
  styleUrls: ['./admin-measurements.component.scss'],
})
export class AdminMeasurementsComponent {
  @Input() measurements: IMeasurement[] = [];
  @Input() systemMeasurements: string[] = [];
  @Input() can_add = true;
  @Input() can_delete = true;
  @Input() can_edit = true;
  @Output() onCaptured = new EventEmitter<IMeasurement[]>();
  unit_error = '';
  values_error = '';
  show_picker = false;
  systemUnits = Constants.Units;
  units = '';

  ngOnInit(): void {
    this.units = this.systemUnits[0] || '';
    if (this.measurements && this.measurements.length > 0) {
      this.units = this.measurements[0].Units;
    }
  }
  delete(index: number) {
    this.measurements.splice(index, 1);
  }
  add_measurement() {
    if (!this.measurements) this.measurements = [];
    this.show_picker = true;
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
      this.unit_error = 'Please enter units';
      return;
    }

    if(this.units && this.measurements.length){
      this.measurements.map((m) => {
        m.Units = this.units;
      });
    }

    this.measurements.forEach((m) => {
      if (!m.Value) {
        this.values_error = 'Please all enter values';
        return;
      }
    });
    if (this.unit_error || this.values_error) {
      return;
    }

    this.onCaptured.emit(this.measurements);
  }

  doneSelectingFromSystem(selection: string[]) {
    this.show_picker = false;
    selection.forEach((s) => {
      if (!this.measurements.find((c) => c.Name === s)) {
        const i: IMeasurement = {
          Image: '',
          Name: s,
          Units: '',
          Value: '',
        };
        this.measurements.push(i);
      }
    });
  }
}
