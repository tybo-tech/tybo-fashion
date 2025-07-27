import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-bread',
  templateUrl: './bread.component.html',
  styleUrls: ['./bread.component.scss'],
})
export class BreadComponent {
  @Input({ required: true }) currentPage: string = '';
  @Input() prevPage: string = '';
  @Input() prevLink: string = '';
  @Input() showDelete = false;
  @Output() onDelete = new EventEmitter();

  @Input() links: { name: string; link: string }[] = [];
}
