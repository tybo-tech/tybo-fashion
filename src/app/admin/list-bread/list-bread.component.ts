import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-bread',
  templateUrl: './list-bread.component.html',
  styleUrls: ['./list-bread.component.scss']
})
export class ListBreadComponent {
@Input() currentPage: string = '';
@Input() prevPage: string = '';
@Input() prevLink: string = '';
@Input() showDelete = false;
@Output() onDelete = new EventEmitter();

}
