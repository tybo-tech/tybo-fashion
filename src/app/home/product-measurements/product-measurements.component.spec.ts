import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductMeasurementsComponent } from './product-measurements.component';

describe('ProductMeasurementsComponent', () => {
  let component: ProductMeasurementsComponent;
  let fixture: ComponentFixture<ProductMeasurementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductMeasurementsComponent]
    });
    fixture = TestBed.createComponent(ProductMeasurementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
