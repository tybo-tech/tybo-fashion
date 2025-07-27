import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-float-add',
  templateUrl: './float-add.component.html',
  styleUrls: ['./float-add.component.scss']
})
export class FloatAddComponent {
@Output() add = new EventEmitter<any>();
}
