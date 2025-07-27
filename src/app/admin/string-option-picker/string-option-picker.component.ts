import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OtherInfoService } from 'src/services/other-info.service';
import { UxService } from 'src/services/ux.service';
interface Setting {
  name: string;
  selected: boolean;
}
@Component({
  selector: 'app-string-option-picker',
  templateUrl: './string-option-picker.component.html',
  styleUrls: ['./string-option-picker.component.scss'],
})
export class StringOptionPickerComponent implements OnInit {
  @Input() availableSettings: string[] = [];
  @Input() selectedSettings: string[] = [];
  @Input({ required: true }) key!: 'sizes' | 'categories' | 'measurements' | 'collections';
  @Input({ required: true }) selectorTitle!: string;
  @Input({ required: true }) companyId!: string;
  @Output() selectionChanged = new EventEmitter<string[]>();
  show_modal = false;
  show_add = false;
  settings: Setting[] = [];
  newSetting = '';
  constructor(
    private uxService: UxService,
    private otherInfoService: OtherInfoService<string[]>
  ) {}
  ngOnInit() {
    this.settings = this.availableSettings.map((setting) => ({
      name: setting,
      selected: this.selectedSettings.some(
        (selected) => selected.toLowerCase() === setting.toLowerCase()
      ),
    }));
  }

  onDone() {
    this.selectedSettings = this.settings
      .filter((setting) => setting.selected)
      .map((setting) => setting.name);
    this.selectionChanged.emit(this.selectedSettings);
    this.show_modal = false;
  }

  doneAdding() {
    this.show_add = false;
    this.show_modal = true;
    if (this.newSetting) {
      switch (this.key) {
        case 'sizes':
          this.otherInfoService.addNewSize(this.companyId, this.newSetting);
          break;
        case 'categories':
          this.otherInfoService.addNewCategory(this.companyId, this.newSetting);
          break;
        case 'measurements':
          this.otherInfoService.addNewMeasurement(
            this.companyId,
            this.newSetting
          );
          break;

        case 'collections':
          this.otherInfoService.addNewCollection(
            this.companyId,
            this.newSetting
          );
          break;
      }
      this.uxService.show_toast('New setting added successfully', 'Success', [
        'bg-success',
      ]);
      this.settings.push({
        name: this.newSetting,
        selected: true,
      });
    } else {
      this.uxService.show_toast(
        'Operation cancelled, due to empty value',
        'Nothing to add',
        ['bg-secondary']
      );
    }
  }
  toogleAdd() {
    this.show_add = !this.show_add;
    this.show_modal = !this.show_modal;
  }
}
