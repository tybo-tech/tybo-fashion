import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Company } from 'src/models/Company';
import { initImage ,Image} from 'src/models/Image';

@Component({
  selector: 'app-stat-settings',
  templateUrl: './stat-settings.component.html',
  styleUrls: ['./stat-settings.component.scss']
})
export class StatSettingsComponent {
  @Input() company?: Company;
  @Output() updated = new EventEmitter<Company>();
  @Output() closed = new EventEmitter<any>();
  initImage: Image = initImage();

  getImage(url: string): Image {
    return { ...this.initImage, Url: url };
  }
  
  addStat() {
    this.company &&
      this.company.Metadata &&
      this.company.Metadata.Stat.push({ Name: '', Count: '', Units: '' });
  }

  removeStat(index: number) {
    this.company &&
      this.company.Metadata &&
      this.company.Metadata.Stat.splice(index, 1);
  }
}
