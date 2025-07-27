import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Company } from 'src/models/Company';
import { HeroHeaderData } from 'src/models/HeroHeaderData';
import { Category, CategoryService } from 'src/services/category.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
})
export class CollectionsComponent {
  companyId = '';
  categoryId = '';
  prevPage: string = 'Zalou';
  prevLink: string = '/zalou';
  category?: Category;
  heroHeaderData?: HeroHeaderData;
  loading = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.companyId = r['companyId'];
      this.categoryId = r['categoryId'] || '';
      this.getCategoryAndChildren();
    });
  }
  getCategoryAndChildren() {
    this.loading = true;
    this.categoryService
      .getCategoryAndChildren(this.companyId, this.categoryId)
      .subscribe((data) => {
        this.loading = false;
        if (data && data.CategoryId) {
          this.category = data;
          this.heroHeaderData = {
            title: data.Name,
            description: data.Description,
            image: data.ImageUrl || 'https://tybofashion.co.za/api/api/upload/uploads/-1738993039357.png',
            slug:'',
          };
        }
      });
  }
  get company(){
    return this.category?.Company;
  }
}
