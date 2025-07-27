import { Component, Input } from "@angular/core";
import { Product } from "src/models/Product";

@Component({
  selector: 'app-featured-products-section',
  templateUrl: './featured-products-section.component.html',
  styleUrls: ['./featured-products-section.component.scss']
})
export class FeaturedProductsSectionComponent {
  @Input() products: Product[] = [];
  @Input() heading = 'Featured Products';
  @Input() link = '';
}
