import { Component } from '@angular/core';
import { ICollection } from 'src/models/Category';
import { ICardCarousel } from 'src/models/ICardCarousel';
import { OtherInfo } from 'src/models/other-info.model';
import { Product } from 'src/models/Product';
import { OtherInfoService } from 'src/services/other-info.service';
import { ProductService } from 'src/services/product.service';

@Component({
  selector: 'app-tui-home',
  templateUrl: './tui-home.component.html',
  styleUrls: ['./tui-home.component.scss'],
})
export class TuiHomeComponent {
logout() {
throw new Error('Method not implemented.');
}
openCart() {
throw new Error('Method not implemented.');
}
  dots = 'assets/images/tui/dots.svg';
  grid = 'assets/images/tui/grid.svg';
  gridBg = `url('assets/images/tui/grid.svg')`;
  slides = [
    {
      classes: 'carousel-item active',
      alt: 'Slide 1',
      src: 'assets/images/tui/hero-tybo-fashion.webp',
    },
  ];
  categories?: OtherInfo<any>[];
  cards: ICardCarousel[] = [];
  products:Product[] = [];
user: any;
company: any;
collections: any[] = [];
  constructor(
    private otherInfoService: OtherInfoService<ICollection>,
    private productService: ProductService
  ) {
    otherInfoService
      .categories('80edddf9-6fc0-11eb-9698-12911df8ace9')
      .subscribe((data) => {
        if (data && data.length) {
          //sort by CountProducts
          this.categories = data.sort(
            (a, b) => (b.CountProducts || 1) - (a.CountProducts || 1)
          );
        }
        this.pamProductsList();
      });
  }
  pamProductsList() {
    this.productService.$products.subscribe((products) => {
      if (products && products.length) {
        this.products = products;
        this.cards = products.map((product) => {
          return {
            buttonText: 'View',
            heading: product.Name,
            image: product.FeaturedImageUrl,
            subheading: 'R' + product.RegularPrice,
            buttonLink: `/product/${product.Slug || product.ProductId}`,
          };
        });
      }
    });
  }
  onCardClick(selectedCard: ICardCarousel) {
    alert(selectedCard.heading);
  }
}
