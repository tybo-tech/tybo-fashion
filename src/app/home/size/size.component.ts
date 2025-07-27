import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IMeasurement, initMeasurements } from 'src/models/measurement.model';
import { Product } from 'src/models/Product';

@Component({
  selector: 'app-size',
  templateUrl: './size.component.html',
  styleUrls: ['./size.component.scss'],
})
export class SizeComponent implements OnInit {
  @Input({ required: true }) product!: Product;
  @Input({ required: true }) selectedSize!: string;
  @Input() quantity = 1;
  @Output() sizedSelected = new EventEmitter<string>();
  @Output() quantityChanged = new EventEmitter<number>();
  @Output() onMeasurementsCaptured = new EventEmitter<IMeasurement[]>();
  measurementKey = 'Use Measurements';
  // measurements
  mappedMeasurements: IMeasurement[] = [];
  showMeasurements = false;
  sizeType = 'standard';
  ngOnInit(): void {
    if (this.measurements.length) {
      this.mappedMeasurements = this.measurements.map((m) => {
        const measurement = initMeasurements(m);
        return measurement;
      });
    }
  }
  get sizes() : string[] {
    const size = this.product.Variations?.find((s) => s.Name === 'Size');
    return size?.Options?.map((s) => s.Name) || [];
  }
  get measurements() {
    // return this.product.Measurements || [];
    return [];
  }
  get isCustom() {
    return this.product.IsJustInTime === 'Custom';
  }

  get hasMeasurements() {
    let hasMeasurements = true;
    this.mappedMeasurements.forEach((m) => {
      if (!m.Value) {
        hasMeasurements = false;
      }
    });
    return hasMeasurements;
  }
  selectSize(size: string) {
    this.selectedSize = size;
    this.sizedSelected.emit(size);
    if (this.selectedSize === this.measurementKey) {
      this.showMeasurements = true;
      this.sizedSelected.emit('Measurements');
    }
  }

  selectSizeType(type: string) {
    this.sizeType = type;
  }
}
