import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Customer, sanitizePhoneNumber } from 'src/models/Customer';
import { initMeasurements } from 'src/models/measurement.model';
import { loading, stop_loading } from 'src/models/ux.model';
import { CustomerService } from 'src/services/customer.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent implements OnInit {
  @Input() customer?: Customer;
  @Output() onSave = new EventEmitter<Customer>();
  constructor(private cus: CustomerService, private ux: UxService) {}
  ngOnInit(): void {
    if (this.customer && !this.customer.Measurements?.length) {
      this.customer.Measurements = [
        initMeasurements('Waist'),
        initMeasurements('Chest'),
        initMeasurements('Hips'),
        initMeasurements('Neck'),
        initMeasurements('Shoulder'),
        initMeasurements('Sleeve'),
        initMeasurements('Length'),
        initMeasurements('Bust'),
        initMeasurements('Thigh'),
        initMeasurements('Inseam'),
        initMeasurements('Outseam'),
        initMeasurements('Crotch'),
        initMeasurements('Bicep'),
        initMeasurements('Wrist'),
        initMeasurements('Ankle'),
        initMeasurements('Collar'),
        initMeasurements('Cuff'),
      ];
    }
  }
  save() {
    if (this.customer) {
      loading();
      if(this.customer.PhoneNumber)
      this.customer.PhoneNumber = sanitizePhoneNumber(this.customer.PhoneNumber);
      this.cus.save(this.customer).subscribe((data) => {
        stop_loading();
        if (data && data.CustomerId) {
          !this.isNew &&
            this.ux.show_toast('Customer updated successfully', 'Success');
          this.isNew &&
            this.ux.show_toast('Customer created successfully', 'Success');
          this.onSave.emit(data);
        }else{
          this.ux.show_toast('Failed to save customer', 'Error', ['bg-danger']);
        }
      });
    }
  }
  add_measurement() {
    if (this.customer) {
      this.customer.Measurements?.push({ ...initMeasurements('') });
    }
  }
  delete(index: number) {
    if (this.customer && this.customer.Measurements) {
      this.customer.Measurements.splice(index, 1);
    }
  }
  get isNew() {
    return !this.customer?.CreateDate;
  }
}
