import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Company } from 'src/models/Company';
import { IWorkGallery } from 'src/models/IWorkGallery';
import { OtherInfo } from 'src/models/other-info.model';
import { OtherInfoService } from 'src/services/other-info.service';
import { ShopService } from 'src/services/shop.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-gallery-details',
  templateUrl: './gallery-details.component.html',
  styleUrls: ['./gallery-details.component.scss'],
})
export class GalleryDetailsComponent {
  id = '';
  @Input({ required: true }) galleryItem!: OtherInfo<IWorkGallery>;
  @Input({ required: true }) company!: Company;
  @Output() onClose = new EventEmitter();
  constructor(
    private uxService: UxService,
    private a: ActivatedRoute,
    private shopService: ShopService,
    private otherInfoService: OtherInfoService<IWorkGallery>
  ) {
    a.params.subscribe((x) => {
      this.id = x['id'];
      this.get();
    });
  }
  showBookConsultation = false;
  loading = false;
  private intervalId?: number;

  imageClass = 'slide-from-right';
  index = 0;

  get images() {
    return (
      this.galleryItem?.ItemValue?.Images?.filter(
        (x) => x !== this.galleryItem.ImageUrl
      ) || []
    );
  }
  get() {
    this.otherInfoService.get(this.id).subscribe((data) => {
      if (data && data.Id) {
        this.galleryItem = data;
        this.shopService.getCompany(data.ParentId).subscribe((company) => {
          if (company && company.CompanyId) {
            this.company = company;
          }
        });
      }
    });
  }
  onShare() {
    if (!this.galleryItem) return;
    this.uxService.onShare(this.galleryItem.Name, this.galleryItem.Decription);
  }
  prevImage() {
    if (!this.galleryItem) return;
    this.imageClass = 'slide-from-left';
    this.index =
      this.index === 0
        ? this.galleryItem.ItemValue.Images.length - 1
        : this.index - 1;
    this.resetImageSlider();
  }

  nextImage() {
    if (!this.galleryItem) return;
    this.imageClass = 'slide-from-right';
    this.index =
      this.index === this.galleryItem.ItemValue.Images.length - 1
        ? 0
        : this.index + 1;
    this.resetImageSlider();
  }

  private startImageSlider() {
    this.clearInterval();
    this.intervalId = window.setInterval(() => {
      this.nextImage();
    }, 10000);
  }

  private resetImageSlider() {
    this.clearInterval();
    this.startImageSlider();
  }

  private clearInterval() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }
}
