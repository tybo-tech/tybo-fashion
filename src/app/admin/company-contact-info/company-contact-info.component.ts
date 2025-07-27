import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-company-contact-info',
  templateUrl: './company-contact-info.component.html',
  styleUrls: ['./company-contact-info.component.scss'],
})
export class CompanyContactInfoComponent {
  @Input() company?: Company;
  @Output() updated = new EventEmitter<Company>();
  @Output() closed = new EventEmitter<any>();
}
