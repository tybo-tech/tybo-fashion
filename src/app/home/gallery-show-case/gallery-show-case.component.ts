import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Company } from 'src/models/Company';
import { IWorkGallery } from 'src/models/IWorkGallery';
import { OTHER_TYPES, OtherInfo } from 'src/models/other-info.model';
import { OtherInfoService } from 'src/services/other-info.service';
import { ShopService } from 'src/services/shop.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-gallery-show-case',
  templateUrl: './gallery-show-case.component.html',
  styleUrls: ['./gallery-show-case.component.scss'],
})
export class GalleryShowCaseComponent implements OnInit {
  @Input({ required: true }) company!: Company;
  @Input() showMore = true;
  @Input() pageSize = 0;
  loading = false;
  items?: OtherInfo<IWorkGallery>[];
  galleryItem?: OtherInfo<IWorkGallery>;
  constructor(
    private otherInfoService: OtherInfoService<IWorkGallery>,
    private shopService: ShopService
  ) {}
  ngOnInit(): void {
    this.fetchWorkGalleryItems();
    this.companyInfo();
  }

  fetchWorkGalleryItems() {
    this.loading = true;
    this.company &&
      this.otherInfoService
        .workGallery(this.company.CompanyId)
        .subscribe((data) => {
          this.loading = false;
          this.sliceData(data);
        });
  }
  sliceData(data: OtherInfo<IWorkGallery>[]) {
    if (data && data.length && !this.pageSize) {
      this.items = data;
    }
    if (data && data.length && this.pageSize) {
      this.items = data.slice(0, this.pageSize);
    }
    this.items?.map((x) => (x.ItemCode = `home/work-show-details/${x.Id}`));
  }

  companyInfo() {
    this.loading = true;
    this.company &&
      this.shopService
        .companyInfo({
          CompanyId: this.company.CompanyId,
          ItemId: '',
          ItemType: OTHER_TYPES.WorkGallery,
        })
        .subscribe((data) => {
          this.loading = false;
          if (data && data.CompanyId) {
            this.company = data;
            this.sliceData(data.InfoList || []);
          }
        });
  }
}
