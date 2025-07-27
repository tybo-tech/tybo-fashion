import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { Product } from 'src/models/Product';
import { IMeasurement } from 'src/models/measurement.model';

@Component({
  selector: 'app-product-measurements',
  templateUrl: './product-measurements.component.html',
  styleUrls: ['./product-measurements.component.scss'],
})
export class ProductMeasurementsComponent implements OnInit {
  @Input() product?: Product;
  @Input() can_add = false;
  @Input() can_delete = false;
  @Input() can_edit = false;
  systemUnits = Constants.Units;
  @Output() onCaptured = new EventEmitter<IMeasurement[]>();
  units = '';
  unit_error = '';
  values_error = '';
  measurements: IMeasurement[] = [];
  delete(index: number) {
    alert('delete');
  }
  add_measurement() {
    alert('add_measurement');
  }
  ngOnInit(): void {
    // if (this.product && this.product.Measurements) {
    //   this.measurements = this.product.Measurements.map((m) => {
    //     return { Name: m, Value: '25', Units: '',Image:'' };
    //   });
    // }
  }
  onDone() {
    this.unit_error = '';
    this.values_error = '';
    if(!this.units) {
     this.unit_error = 'Please enter units';
      return;
    }
    
    this.measurements.forEach((m) => {
      if (!m.Value) {
        this.values_error = 'Please enter values';
        return;
      }
    });
    if(this.unit_error || this.values_error) {
      return;
    }

    this.onCaptured.emit(this.measurements);
    
  }
  onUnits(){
    this.measurements.map((m) => {
     m.Units = this.units;
    }); 
 }
}
