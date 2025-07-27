import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductVariationSelectorComponent } from './product-variation-selector.component';

describe('ProductVariationSelectorComponent', () => {
  let component: ProductVariationSelectorComponent;
  let fixture: ComponentFixture<ProductVariationSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductVariationSelectorComponent]
    });
    fixture = TestBed.createComponent(ProductVariationSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
