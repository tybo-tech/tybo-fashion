import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsCarouselComponent } from './cards-carousel.component';

describe('CardsCarouselComponent', () => {
  let component: CardsCarouselComponent;
  let fixture: ComponentFixture<CardsCarouselComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardsCarouselComponent]
    });
    fixture = TestBed.createComponent(CardsCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
