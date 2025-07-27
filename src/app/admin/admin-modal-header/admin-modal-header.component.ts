import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin-modal-header',
  templateUrl: './admin-modal-header.component.html',
  styleUrls: ['./admin-modal-header.component.scss'],
})
export class AdminModalHeaderComponent {
  @Input() title = '';
  @Input() show_x = true;
  @Output() onClose = new EventEmitter<any>();
}
