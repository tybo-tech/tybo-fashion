import { Component } from '@angular/core';
import { Company } from 'src/models/Company';
import { ShopService } from 'src/services/shop.service';

@Component({
  selector: 'app-super-companies',
  templateUrl: './super-companies.component.html',
  styleUrls: ['./super-companies.component.scss'],
})
export class SuperCompaniesComponent {
  companies?: Company[];
  constructor(private shopService: ShopService) {
    shopService.active().subscribe((companies) => {
      this.companies = companies;
    });
  }
}
