import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-trash',
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.scss'],
})
export class TrashComponent {
  @Output() delete = new EventEmitter<any>();
}
