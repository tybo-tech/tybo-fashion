import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Company } from 'src/models/Company';
import { initImage,Image } from 'src/models/Image';

@Component({
  selector: 'app-testimaonails-settings',
  templateUrl: './testimaonails-settings.component.html',
  styleUrls: ['./testimaonails-settings.component.scss']
})
export class TestimaonailsSettingsComponent {
  @Input() company?: Company;
  @Output() updated = new EventEmitter<Company>();
  @Output() closed = new EventEmitter<any>();
  initImage: Image = initImage();

  getImage(url: string): Image {
    return { ...this.initImage, Url: url };
  }
  addTestimonial() {
    this.company &&
      this.company.Metadata &&
      this.company.Metadata.Testimonials.push({
        Name: '',
        ImageUrl: '',
        Testimonial: '',
      });
  }

  removeTestimonial(index: number) {
    this.company &&
      this.company.Metadata &&
      this.company.Metadata.Testimonials.splice(index, 1);
  }

}
