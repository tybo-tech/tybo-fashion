import { Component, EventEmitter, Output } from '@angular/core';
import { IProductFilter } from 'src/models/IProductFilter';

@Component({
  selector: 'app-product-filters-admin',
  templateUrl: './product-filters-admin.component.html',
  styleUrls: ['./product-filters-admin.component.scss'],
})
export class ProductFiltersAdminComponent {
  @Output() onClose = new EventEmitter<any>();
  @Output() onApply = new EventEmitter<IProductFilter[]>();
  filters: IProductFilter[] = [
    {
      label: 'Visible Online',
      options: ['Yes', 'No'],
      value: '',
      property: 'ShowOnline',
    },
    {
      label: 'Featured',
      options: ['Yes', 'No'],
      value: '',
      property: 'IsFeatured',
    },
  ];
}
