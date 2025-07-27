import { Component, Input } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent {
  intro = 'assets/images/tui/intro.png';
  ABOUT = `
  At Tybo Fashion, we bring together local fashion designers dedicated to
      creating luxurious, high-quality clothing. Each piece is crafted with
      meticulous attention to detail and the finest materials, ensuring
      uniqueness and durability. Discover exclusive designs that stand out and
      enjoy a seamless shopping experience with us.
`;
  HEADING = 'We are committed to Quality and Unique Designs.';
  @Input() company?: Company;
  get heading() {
    return this.company?.Metadata?.AboutTitle || this.HEADING;
  }
  get about() {
    return this.company?.Metadata?.About || this.ABOUT;
  }
  get image() {
    return this.company?.Metadata?.AboutImage || this.intro;
  }
}
