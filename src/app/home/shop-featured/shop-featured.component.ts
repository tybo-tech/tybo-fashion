import { Component, Input } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-shop-featured',
  templateUrl: './shop-featured.component.html',
  styleUrls: ['./shop-featured.component.scss']
})
export class ShopFeaturedComponent {
  @Input() company?: Company;
  testimonials = [
    {
      text: 'I love this company',
      img: 'https://app.tybo.co.za/api/upload/uploads/1614544200iio.jpg',
    },
    {
      text: 'My dress was perfect',
      img: 'https://app.tybo.co.za/api/upload/uploads/1614544200iio.jpg',
    },
    {
      text: 'Wow! I am so happy with my purchase',
      img: 'https://app.tybo.co.za/api/upload/uploads/1614544200iio.jpg',
    },
  ];
}
