import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Company } from 'src/models/Company';
import { ShopService } from 'src/services/shop.service';

@Component({
  selector: 'app-super-company',
  templateUrl: './super-company.component.html',
  styleUrls: ['./super-company.component.scss'],
})
export class SuperCompanyComponent {
  company?: Company;
  constructor(
    private shopService: ShopService,
    private activatedRoute: ActivatedRoute
  ) {
    shopService.getCompany(
      this.activatedRoute.snapshot.paramMap.get('id') || ''
    ).subscribe((companies) => {
      this.company = companies;
    });
  }
  save(){
    if(this.company){
      this.shopService.save(this.company).subscribe((company) => {
        this.company = company;
      });
    }
  }
}
