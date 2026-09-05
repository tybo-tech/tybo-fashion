import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-admin-topbar',
  templateUrl: './admin-topbar.component.html',
  styleUrls: ['./admin-topbar.component.scss'],
})
export class AdminTopbarComponent {
  @Input() company?: Company;
  @Output() logout = new EventEmitter<void>();

  get storeUrl(): string {
    return '/' + (this.company?.Slug || this.company?.CompanyId);
  }
}
