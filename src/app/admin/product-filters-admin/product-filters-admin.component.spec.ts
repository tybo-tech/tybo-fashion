import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFiltersAdminComponent } from './product-filters-admin.component';

describe('ProductFiltersAdminComponent', () => {
  let component: ProductFiltersAdminComponent;
  let fixture: ComponentFixture<ProductFiltersAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductFiltersAdminComponent]
    });
    fixture = TestBed.createComponent(ProductFiltersAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
