import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { IForm } from 'src/models/IForm';
import { IMeasurement, initMeasurements } from 'src/models/measurement.model';
import { OTHER_TYPES, OtherInfo } from 'src/models/other-info.model';
import { MeasurementsService } from 'src/services/measurements.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-system-measurements',
  templateUrl: './system-measurements.component.html',
  styleUrls: ['./system-measurements.component.scss'],
})
export class SystemMeasurementsComponent implements OnInit {
  @Output() closed = new EventEmitter<any>();
  @Output() doneSelecting = new EventEmitter<string[]>();
  oldValue = '';
  form: IForm = {
    id: 'add',
    title: 'Add Measurement',
    submitText: 'Add',
    items: [
      {
        label: 'Name',
        type: 'text',
        value: '',
        placeholder: 'Measurement Name...',
        options: [],
      },
    ],
  };
  mainForm: IForm = {
    id: 'main',
    title: 'Measurement help',
    submitText: 'Save',
    items: [
      {
        label: 'Help Image',
        type: 'image',
        value: '',
        placeholder: '',
        options: [],
      },
      // Description
      {
        label: 'Description',
        type: 'textarea',
        value: '',
        placeholder: 'Description...',
        options: [],
      },
    ],
  };
  show_add = false;
  show_edit = false;
  show_main = false;
  measurement?: OtherInfo<IMeasurement[]>;
  user = this.userService.getUser;
  index = -1;
  colors: string[] = [];
  query = '';
  constructor(
    private uxService: UxService,
    private userService: UserService,
    private measurementsService: MeasurementsService,
    private productService: ProductService
  ) {}
  ngOnInit(): void {
    this.getMeasurements();
  }
  getMeasurements() {
    if (this.user) {
      this.measurementsService
        .measurements(this.user.CompanyId)
        .subscribe((data) => {
          if (data && data.length && data[0].ItemValue) {
            this.getnerateColors(data[0].ItemValue.length);
            this.measurement = data[0];
            this.mainForm.items[0].value = this.measurement.ImageUrl || '';
            this.mainForm.items[1].value = this.measurement.Decription || '';
            // sort the measurement name
            this.measurement.ItemValue = this.measurement.ItemValue.sort(
              (a, b) => {
                return a.Name.localeCompare(b.Name);
              }
            );
          }
        });
    }
  }
  getnerateColors(limit: number) {
    this.colors = [];
    for (let i = 0; i < limit; i++) {
      const color = this.color;
      this.colors.push(color);
    }
  }
  delete_item(index: number) {
    if (
      this.measurement &&
      confirm('Are you sure you want to delete this measurement?')
    ) {
      this.measurement.ItemValue.splice(index, 1);
      this.update('Measurement Deleted', 'Measurement Deleted', [
        'bg-red',
        'text-white',
      ]);
    }
  }

  add() {
    this.index = -1;
    this.show_add = true;
    this.form.items[0].value = '';
    this.form.title = 'Add Measurement';
  }
  afterAdd(form: IForm) {
    const name: string = form.items[0].value;
    if (!name) {
      this.uxService.show_toast('Please enter a name', 'Error', [
        'bg-red',
        'text-white',
      ]);
      return;
    }
    if (this.measurement && Array.isArray(this.measurement.ItemValue)) {
      this.measurement.ItemValue.push(initMeasurements(name));
      this.update('Measurement Added', 'Measurement Added', [
        'bg-success',
        'text-white',
      ]);
      this.show_add = false;
    }
  }
  update(message: string = '', title = '', classess: string[] = []) {
    if (this.measurement) {
      this.measurementsService.save(this.measurement).subscribe((data) => {
        if (data && data.Id) {
          this.measurement = data;
          if (message) {
            this.uxService.show_toast(message, title, classess);
          }
        }
      });
    }
  }

  edit(index: number, value: IMeasurement) {
    this.index = index;
    this.show_edit = true;
    this.form.items[0].value = value.Name;
    this.form.title = 'Edit Measurement';
    this.oldValue = value.Name;
  }
  afterEdit(form: IForm) {
    if (this.index > -1 && this.measurement) {
      const name: string = form.items[0].value;
      this.measurement.ItemValue[this.index].Name = name;
      this.update('Measurement Updated', 'Measurement Updated', [
        'bg-success',
        'text-white',
      ]);
      this.show_edit = false;
      this.form.items[0].value = '';
      this.index = -1;
      this.form.title = 'Add Measurement';
      this.user &&
        this.productService
          .updateArrayValue(
            'Measurements',
            this.user.CompanyId,
            this.oldValue,
            name
          )
          .subscribe((data) => {});
    }
  }

  afterEditMain($event: IForm) {
    this.show_main = false;
    const image = $event.items[0].value;
    const description = $event.items[1].value;
    if ((!image && !description) || !this.measurement) return;
    this.measurement.ImageUrl = image || '';
    this.measurement.Decription = description || '';
    this.update('Image Updated', 'Image Updated', ['bg-success', 'text-white']);
  }
  get color() {
    // returns a random color for icons
    return this.uxService.randomSoftColor(Math.random().toString());
  }
  onDone() {}
}
