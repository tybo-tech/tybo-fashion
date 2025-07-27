import { Component, Input } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
})
export class TestimonialsComponent {
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
