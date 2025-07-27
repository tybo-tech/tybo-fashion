import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { initWorkGallery, IWorkGallery } from 'src/models/IWorkGallery';
import {
  OtherInfo,
  initOtherInfo,
  OTHER_TYPES,
} from 'src/models/other-info.model';
import { OtherInfoService } from 'src/services/other-info.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-work-gallery',
  templateUrl: './work-gallery.component.html',
  styleUrls: ['./work-gallery.component.scss'],
})
export class WorkGalleryComponent {
  user = this.userService.getUser;
  items?: OtherInfo<IWorkGallery>[];
  loading = false;
  constructor(
    private otherInfoService: OtherInfoService<IWorkGallery>,
    private uxService: UxService,
    private userService: UserService,
    private router: Router
  ) {
    this.fetchWorkGalleryItems();
  }

  fetchWorkGalleryItems() {
    this.loading = true;
    this.user &&
      this.otherInfoService
        .workGallery(this.user.CompanyId)
        .subscribe((data) => {
          this.loading = false;
          if (data && data.length) {
            this.items = data;
          }
        });
  }

  add(name: string) {
    const cat: OtherInfo<IWorkGallery> = initOtherInfo(
      OTHER_TYPES.WorkGallery,
      this.user?.CompanyId || '',
      initWorkGallery()
    );
    cat.ItemValue.title = name;
    cat.Name = cat.ItemValue.title;
    cat.Status = 'Active';
    this.loading = true;
    this.otherInfoService.save(cat).subscribe((data) => {
      this.loading = false;
      if (data && data.Id) {
        this.fetchWorkGalleryItems();
        this.router.navigate(['/store/admin/edit-work-gallery', data.Id]);
      }
    });
  }
}
