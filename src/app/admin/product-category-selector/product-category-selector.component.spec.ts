import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCategorySelectorComponent } from './product-category-selector.component';

describe('ProductCategorySelectorComponent', () => {
  let component: ProductCategorySelectorComponent;
  let fixture: ComponentFixture<ProductCategorySelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductCategorySelectorComponent]
    });
    fixture = TestBed.createComponent(ProductCategorySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
