import { Component, Input } from '@angular/core';
import { User } from 'src/models/user.model';

@Component({
  selector: 'app-view-user-contact',
  templateUrl: './view-user-contact.component.html',
  styleUrls: ['./view-user-contact.component.scss'],
})
export class ViewUserContactComponent {
  @Input() user?: User;
  @Input() show_shipping = false;
}
