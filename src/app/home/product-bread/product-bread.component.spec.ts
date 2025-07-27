import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBreadComponent } from './product-bread.component';

describe('ProductBreadComponent', () => {
  let component: ProductBreadComponent;
  let fixture: ComponentFixture<ProductBreadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductBreadComponent]
    });
    fixture = TestBed.createComponent(ProductBreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
