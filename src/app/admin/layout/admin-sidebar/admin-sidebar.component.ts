import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IMenuGroup } from '../menu.model';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
})
export class AdminSidebarComponent {
  @Input() menu: IMenuGroup[] = [];
  @Input() currentUrl = '';
  @Output() logout = new EventEmitter<void>();
}
