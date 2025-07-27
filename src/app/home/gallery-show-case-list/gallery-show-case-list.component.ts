import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Company } from 'src/models/Company';
import { ShopService } from 'src/services/shop.service';

@Component({
  selector: 'app-gallery-show-case-list',
  templateUrl: './gallery-show-case-list.component.html',
  styleUrls: ['./gallery-show-case-list.component.scss'],
})
export class GalleryShowCaseListComponent {
  companyId = '';
  slug = '';
  company?: Company;
  loading = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private shopService: ShopService
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.companyId = r['companyId'];
      this.slug = r['slug'];
      this.loading = true;

      shopService.getCompany(this.companyId).subscribe((data) => {
        this.loading = false;

        if (data && data.CompanyId) {
          this.company = data;
        }
      });
    });
  }
}
