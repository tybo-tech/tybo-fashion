import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICollection } from 'src/models/Category';
import { IWorkGallery } from 'src/models/IWorkGallery';
import { OtherInfo } from 'src/models/other-info.model';
import { Product } from 'src/models/Product';
import { OtherInfoService } from 'src/services/other-info.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-edit-work-gallery',
  templateUrl: './edit-work-gallery.component.html',
  styleUrls: ['./edit-work-gallery.component.scss'],
})
export class EditWorkGalleryComponent {
  showUpload = false;
  workGallery?: OtherInfo<IWorkGallery>;
  id = this.activatedRoute.snapshot.params['id'];
  prevPage = '/store/admin/work-gallery';
  show_modal = false;
  show_add = false;

  constructor(
    private otherInfoService: OtherInfoService<IWorkGallery>,
    private activatedRoute: ActivatedRoute,
    private uxService: UxService,
    private router: Router
  ) {
    this.get();
  }
  get() {
    this.otherInfoService.get(this.id).subscribe((data) => {
      if (data && data.Id) {
        this.workGallery = data;
      }
    });
  }
  onDelete() {
    this.otherInfoService.delete(this.id).subscribe((data) => {
      this.router.navigate([this.prevPage]);
    });
  }
  save() {
    this.workGallery &&
      this.otherInfoService.save(this.workGallery).subscribe((data) => {
        this.router.navigate([this.prevPage]);
      });
  }
  onImageRemoved(images: string[]) {
    if (!this.workGallery) return;
    this.workGallery.ItemValue.Images = images;
    this.saveAndStay('Image removed');
  }
  onImageSetAsMain(image: string) {
    console.log(image);

    if (!this.workGallery) return;
    this.workGallery.ItemValue.coverImage = image;
    this.workGallery.ImageUrl = image;
    // reorder images, make sure the main image is the first
    this.workGallery.ItemValue.Images =
      this.workGallery.ItemValue.Images.filter((i) => i !== image);
    this.workGallery.ItemValue.Images.unshift(image);
    this.saveAndStay('Main image updated');
  }

  fileUploaded(files: string[]) {
    if (!this.workGallery) return;
    if (!this.workGallery.ItemValue.Images)
      this.workGallery.ItemValue.Images = [];
    this.workGallery.ItemValue.Images =
      this.workGallery.ItemValue.Images.concat(files);
    this.showUpload = false;
    if (
      !this.workGallery.ItemValue.coverImage &&
      this.workGallery.ItemValue.Images.length
    ) {
      this.workGallery.ItemValue.coverImage =
        this.workGallery.ItemValue.Images[0];
      this.workGallery.ImageUrl = this.workGallery.ItemValue.coverImage;
    }
    this.saveAndStay('Image uploaded');
  }
  saveAndStay(message?: string) {
    this.workGallery &&
      this.otherInfoService.save(this.workGallery).subscribe((data) => {
        data &&
          data.Id &&
          message &&
          this.uxService.show_toast(message || 'Saved', 'Success');
      });
  }
  get products(): Product[] {
    return [];
  }
}
