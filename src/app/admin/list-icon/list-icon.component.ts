import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-icon',
  templateUrl: './list-icon.component.html',
  styleUrls: ['./list-icon.component.scss'],
})
export class ListIconComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) color!: string;
  @Output() iconClick = new EventEmitter<any>();
}
