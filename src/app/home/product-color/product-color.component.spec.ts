import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductColorComponent } from './product-color.component';

describe('ProductColorComponent', () => {
  let component: ProductColorComponent;
  let fixture: ComponentFixture<ProductColorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductColorComponent]
    });
    fixture = TestBed.createComponent(ProductColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
