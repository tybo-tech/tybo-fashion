import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Company } from 'src/models/Company';
import { initImage, Image } from 'src/models/Image';

@Component({
  selector: 'app-banners-settings',
  templateUrl: './banners-settings.component.html',
  styleUrls: ['./banners-settings.component.scss'],
})
export class BannersSettingsComponent {
  @Input() company?: Company;
  @Output() updated = new EventEmitter<Company>();
  @Output() closed = new EventEmitter<any>();

  initImage: Image = initImage();
  products = [
    { id: '1', name: 'Product 1' },
    { id: '2', name: 'Product 2' },
  ]; // Example products
  categories = [
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' },
  ]; // Example categories
  getImage(url: string): Image {
    return { ...this.initImage, Url: url };
  }

  addSlide() {
    this.company &&
      this.company.Metadata &&
      this.company.Metadata.Slides.push({
        Image: '',
        Link: '',
        Type: 'Product',
      });
  }

  removeSlide(index: number) {
    this.company &&
      this.company.Metadata &&
      this.company.Metadata.Slides.splice(index, 1);
  }
}
