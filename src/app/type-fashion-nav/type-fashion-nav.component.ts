import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-type-fashion-nav',
  templateUrl: './type-fashion-nav.component.html',
  styleUrls: ['./type-fashion-nav.component.scss'],
})
export class TypeFashionNavComponent {
  @Input() user: any = null;
  @Input() company: any = null;
  @Input() slug: string = '';
  @Input() collections: any[] = [];

  @Output() logoutUser = new EventEmitter<void>();
  @Output() onCartClick = new EventEmitter<void>();

  logout() {
    this.logoutUser.emit();
  }

  cartClick() {
    this.onCartClick.emit();
  }
}
