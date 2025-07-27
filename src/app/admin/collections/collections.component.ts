import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ICollection, initCategory } from 'src/models/Category';
import {
  initOtherInfo,
  OTHER_TYPES,
  OtherInfo,
} from 'src/models/other-info.model';
import { OtherInfoService } from 'src/services/other-info.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
})
export class CollectionsComponent {
  user = this.userService.getUser;
  categories?: OtherInfo<ICollection>[];

  constructor(
    private categoryInfoService: OtherInfoService<ICollection>,
    private uxService: UxService,
    private productService: ProductService,
    private userService: UserService,
    private router: Router
  ) {
    this.getCollections();
  }

  getCollections(skipLoad = false) {
    if (!skipLoad) this.uxService.load(true);
    this.user &&
      this.categoryInfoService
        .collections(this.user.CompanyId)
        .subscribe((data) => {
          if (data && data.length) {
            this.categories = data;
          }
          if (!skipLoad) this.uxService.load(false);
        });
  }

  add(name: string) {
    const cat: OtherInfo<ICollection> = initOtherInfo(
      OTHER_TYPES.Collections,
      this.user?.CompanyId || '',
      initCategory()
    );
    cat.Name = name;
    cat.ItemValue.Name = name;
    cat.Status = 'Active';
    this.categoryInfoService.save(cat).subscribe((data) => {
      if(data && data.Id){
        this.router.navigate(['/store/admin/collection', data.Id]);
      }
    });
  }
}
