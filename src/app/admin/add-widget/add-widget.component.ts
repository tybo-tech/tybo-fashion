import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-add-widget',
  templateUrl: './add-widget.component.html',
  styleUrls: ['./add-widget.component.scss'],
})
export class AddWidgetComponent {
  @Input() name = '';
  @Input() title = 'Add Widget';
  @Input() placeholder = 'Item Name...';
  @Input() saveText = 'Next';
  @Output() add = new EventEmitter<string>();
  show = false;
}
