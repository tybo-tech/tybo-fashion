import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JobItem } from 'src/models/job-item.model';
import { IMeasurement } from 'src/models/measurement.model';
import { OtherInfo } from 'src/models/other-info.model';
import { Product } from 'src/models/Product';
import { User } from 'src/models/user.model';
import { OtherInfoService } from 'src/services/other-info.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-admin-select-size',
  templateUrl: './admin-select-size.component.html',
  styleUrls: ['./admin-select-size.component.scss'],
})
export class AdminSelectSizeComponent implements OnInit {
  @Input() size = '';
  @Input() measurements: IMeasurement[] = [];
  @Input({ required: true }) user!: User;
  @Input({ required: true }) jobItem!: JobItem;

  @Output() selectSize = new EventEmitter<string>();
  @Output() on_measurements_captured = new EventEmitter<IMeasurement[]>();
  systemMeasurements: string[] = [];
  show_new_size = false;
  name: string = '';
  updating = false;
  sizes?: OtherInfo<string[]>;
  constructor(private otherInfoService: OtherInfoService<string[]>, private uxService: UxService) {}
  ngOnInit(): void {
    this.user &&
      this.otherInfoService.sizes(this.user.CompanyId).subscribe((data) => {
        if (data && data.length && Array.isArray(data[0].ItemValue)) {
          this.sizes = data[0]
        }

        this.otherInfoService
          .measurements(this.user.CompanyId)
          .subscribe((data) => {
            if (data && data.length && Array.isArray(data[0].ItemValue)) {
              this.systemMeasurements = data[0].ItemValue;
              // this.measurements = this.systemMeasurements.map((m) => {
              //   const i: IMeasurement = {
              //     Image: '',
              //     Name: m,
              //     Units: '',
              //     Value: '',
              //   };
              //   return i;
              // });
            }
          });
      });
  }
  show_sizes = false;
  show_measurement = false;

  measurements_captured(measurements: IMeasurement[]) {
    //emit the measurements
    this.hide_modals();
    this.on_measurements_captured.emit(measurements);
    this.selectSize.emit('Measurements');
  }

  hide_modals() {
    this.hide_sizes();
    this.hide_measurements();
  }
  hide_sizes() {
    this.show_sizes = false;
  }
  hide_measurements() {
    this.show_measurement = false;
  }
  show_sizes_modal() {
    this.hide_modals();
    this.show_sizes = true;
  }
  show_measurements() {
    this.hide_modals();
    this.show_measurement = true;
  }
  toggle_sizes() {
    this.show_sizes = !this.show_sizes;
  }
  toggle_measurements() {
    this.show_measurement = !this.show_measurement;
  }
  confirm_later() {
    this.hide_modals();
    this.selectSize.emit('Later');
  }

  addSize() {
    const label = this.name.trim();
    if (!this.sizes || !label || !Array.isArray(this.sizes.ItemValue)) {
      return;
    }
    // Audit fix §7.12: no duplicate-size guard existed — the same label
    // could be pushed repeatedly into the shared library.
    const exists = this.sizes.ItemValue.some(
      (existing) => existing.toLowerCase() === label.toLowerCase()
    );
    if (exists) {
      this.uxService.show_toast(
        `"${label}" is already in the size list`,
        'Duplicate size',
        ['bg-warning', 'text-dark']
      );
      this.name = '';
      this.show_new_size = false;
      return;
    }
    this.updating = true;
    // Audit fix §7.11: single shared add-size path (OtherInfoService).
    // Audit fix §7.10: the new size is applied to the garment immediately —
    // the user no longer has to find and click the new button afterwards.
    this.otherInfoService.addNewSize(this.user.CompanyId, label).subscribe(
      (saved) => {
        this.updating = false;
        if (saved && Array.isArray(saved.ItemValue)) {
          this.sizes = saved;
          this.selectSize.emit(label);
        } else {
          this.uxService.show_toast(
            'Could not add the size. Please try again.',
            'Error',
            ['bg-danger', 'text-white']
          );
        }
        this.name = '';
        this.show_new_size = false;
      }
    );
  }

  update(message: string = '', title = '', classess: string[] = []) {
    if (this.sizes && !this.updating) {
      this.updating = true;
      this.otherInfoService.save(this.sizes).subscribe((data) => {
        this.updating = false;
        if (data && data.Id) {
          this.sizes = data;
          if (message) {
            this.uxService.show_toast(message, title, classess);
          }
        }
      });
    }
  }
}
