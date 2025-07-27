import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBettaComponent } from './product-betta.component';

describe('ProductBettaComponent', () => {
  let component: ProductBettaComponent;
  let fixture: ComponentFixture<ProductBettaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductBettaComponent]
    });
    fixture = TestBed.createComponent(ProductBettaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
