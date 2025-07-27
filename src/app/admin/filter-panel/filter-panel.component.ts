import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IProductFilter } from 'src/models/IProductFilter';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss']
})
export class FilterPanelComponent {
@Output() onSearch = new EventEmitter<string>();
@Output() onAdd = new EventEmitter<any>();
  @Output() onApply = new EventEmitter<IProductFilter[]>();
@Input() addText = '';
search = '';
showFilters = false;
}
