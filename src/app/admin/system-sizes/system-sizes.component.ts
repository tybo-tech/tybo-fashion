import { Component, EventEmitter, Output } from '@angular/core';
import { SIZES } from 'src/constants/sizes';
import {
  OTHER_TYPES,
  OtherInfo,
  initOtherInfo,
} from 'src/models/other-info.model';
import { OtherInfoService } from 'src/services/other-info.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-system-sizes',
  templateUrl: './system-sizes.component.html',
  styleUrls: ['./system-sizes.component.scss'],
})
export class SystemSizesComponent {
  @Output() closed = new EventEmitter<any>();
  show_add = false;
  name = '';
  item_data?: OtherInfo<string[]>;
  user = this.userService.getUser;
  constructor(
    private otherInfoService: OtherInfoService<string[]>,
    private uxService: UxService,
    private userService: UserService
  ) {}
  ngOnInit(): void {
    if (this.user) {
      this.otherInfoService
        .search({
          ItemType: OTHER_TYPES.Sizes,
          ParentId: this.user.CompanyId,
        })
        .subscribe((data) => {
          if (data && data.length) {
            this.item_data = data[0];
          } else {
            this.create_item();
          }
        });
    }
  }
  create_item() {
    if (!this.user) return;
    const item = initOtherInfo<string[]>(
      OTHER_TYPES.Sizes,
      this.user.CompanyId,
      SIZES
    );
    this.otherInfoService.save(item).subscribe((data) => {
      if (data && data.Id) {
        this.item_data = data;
      }
    });
  }
  delete_item(index: number) {
    if (this.item_data) {
      this.item_data.ItemValue.splice(index, 1);
      this.update('Size Deleted', 'Size Deleted', ['bg-red', 'text-white']);
    }
  }
  add() {
    if (
      this.item_data &&
      this.name &&
      Array.isArray(this.item_data.ItemValue)
    ) {
      this.item_data.ItemValue.push(this.name);
      this.update('Size Added', 'Size Added', ['bg-success', 'text-white']);
      this.name = '';
      this.show_add = false;
    }
  }
  update(message: string = '', title = '', classess: string[] = []) {
    if (this.item_data) {
      this.otherInfoService.save(this.item_data).subscribe((data) => {
        if (data && data.Id) {
          this.item_data = data;
          if (message) {
            this.uxService.show_toast(message, title, classess);
          }
        }
      });
    }
  }
  onDone() {}
}
