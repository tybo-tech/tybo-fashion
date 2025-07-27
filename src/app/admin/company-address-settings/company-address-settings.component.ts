import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-company-address-settings',
  templateUrl: './company-address-settings.component.html',
  styleUrls: ['./company-address-settings.component.scss']
})
export class CompanyAddressSettingsComponent {
  @Input() company?: Company;
  @Output() updated = new EventEmitter<Company>();
  @Output() closed = new EventEmitter<any>();
}
