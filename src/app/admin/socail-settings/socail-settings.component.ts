import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-socail-settings',
  templateUrl: './socail-settings.component.html',
  styleUrls: ['./socail-settings.component.scss'],
})
export class SocailSettingsComponent {
  @Input() company?: Company;
  @Output() updated = new EventEmitter<Company>();
  @Output() closed = new EventEmitter<any>();
}
