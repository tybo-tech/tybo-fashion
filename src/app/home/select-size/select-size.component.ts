import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from 'src/models/Product';
import { IMeasurement } from 'src/models/measurement.model';

@Component({
  selector: 'app-select-size',
  templateUrl: './select-size.component.html',
  styleUrls: ['./select-size.component.scss'],
})
export class SelectSizeComponent {
  @Input() product?: Product;
  @Input() size = '';
  @Output() selectSize = new EventEmitter<string>();
  @Output() on_measurements_captured = new EventEmitter<IMeasurement[]>();

  show_options = false;
  show_measurement = false;
  show_measurement_later = false;
  get count_sizes() {
    return 0;
  }
  measurements_captured(measurements: IMeasurement[]) {
    //emit the measurements
    this.hide_modals();
    this.on_measurements_captured.emit(measurements);
    this.selectSize.emit('Measurements');

  }

  hide_modals(){
    this.show_measurement = false;
    this.show_options = false;
    this.show_measurement_later = false;
  }
  confirm_later(){
    this.hide_modals();
    this.selectSize.emit('Later');
  }
}
