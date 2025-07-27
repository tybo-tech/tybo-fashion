import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICollection } from 'src/models/Category';
import { OtherInfo } from 'src/models/other-info.model';
import { Product } from 'src/models/Product';
import { OtherInfoService } from 'src/services/other-info.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent {
  category?: OtherInfo<ICollection>;
  id = this.activatedRoute.snapshot.params['id'];
  prevPage = '/store/admin/collections';
  show_modal = false;
  show_add = false;

  constructor(
    private otherInfoService: OtherInfoService<ICollection>,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.get();
  }
  get() {
    this.otherInfoService.get(this.id, 'product','Collections').subscribe((data) => {
      if (data && data.Id) {
        this.category = data;
      }
    });
  }
  onDelete() {
    this.otherInfoService.delete(this.id).subscribe((data) => {
      this.router.navigate([this.prevPage]);
    });
  }
  save() {
    this.category &&
      this.otherInfoService.save(this.category).subscribe((data) => {
        this.router.navigate([this.prevPage]);
      });
  }
  get products(): Product[] {
    return [];
  }
}
