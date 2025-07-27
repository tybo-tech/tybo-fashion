import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-icon-home',
  templateUrl: './list-icon-home.component.html',
  styleUrls: ['./list-icon-home.component.scss']
})
export class ListIconHomeComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) color!: string;
  @Output() iconClick = new EventEmitter<any>();
}
