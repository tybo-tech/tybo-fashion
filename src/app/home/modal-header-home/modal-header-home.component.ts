import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-header-home',
  templateUrl: './modal-header-home.component.html',
  styleUrls: ['./modal-header-home.component.scss']
})
export class ModalHeaderHomeComponent {
  @Input() title = '';
  @Input() show_x = true;
  @Output() onClose = new EventEmitter<any>();
}
