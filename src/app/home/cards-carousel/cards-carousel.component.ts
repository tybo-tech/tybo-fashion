import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICardCarousel } from 'src/models/ICardCarousel';
import { Product } from 'src/models/Product';

@Component({
  selector: 'app-cards-carousel',
  templateUrl: './cards-carousel.component.html',
  styleUrls: ['./cards-carousel.component.scss']
})
export class CardsCarouselComponent {
  @Input() cards: Product[] = [];
  @Output() cardClick = new EventEmitter<Product>();

  onCardClick(card: Product) {
    this.cardClick.emit(card);
  }
}
