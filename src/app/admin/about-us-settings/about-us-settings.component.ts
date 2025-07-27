import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Company } from 'src/models/Company';
import { initImage ,Image} from 'src/models/Image';

@Component({
  selector: 'app-about-us-settings',
  templateUrl: './about-us-settings.component.html',
  styleUrls: ['./about-us-settings.component.scss']
})
export class AboutUsSettingsComponent {
  @Input() company?: Company;
  @Output() updated = new EventEmitter<Company>();
  @Output() closed = new EventEmitter<any>();
  initImage: Image = initImage();
  getImage(url: string): Image {
    return { ...this.initImage, Url: url };
  }
}
