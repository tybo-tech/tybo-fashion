import { Component, Input, OnInit } from '@angular/core';
import { Testimonial } from 'src/models/Company';

@Component({
  selector: 'app-shop-feedback',
  templateUrl: './shop-feedback.component.html',
  styleUrls: ['./shop-feedback.component.scss'],
})
export class ShopFeedbackComponent implements OnInit {
  @Input({ required: true }) testimonials!: Testimonial[];
  index = 0;
  next() {
    this.index = (this.index + 1) % this.testimonials.length;
  }
  prev() {
    this.index =
      (this.index - 1 + this.testimonials.length) % this.testimonials.length;
  }
  ngOnInit(): void {
    setInterval(() => {
      this.next();
    }, 5000);
  }
}
