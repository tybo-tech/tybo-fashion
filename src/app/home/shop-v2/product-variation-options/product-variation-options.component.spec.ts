import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductVariationOptionsComponent } from './product-variation-options.component';

describe('ProductVariationOptionsComponent', () => {
  let component: ProductVariationOptionsComponent;
  let fixture: ComponentFixture<ProductVariationOptionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductVariationOptionsComponent]
    });
    fixture = TestBed.createComponent(ProductVariationOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
