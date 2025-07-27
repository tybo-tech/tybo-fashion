import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProductsToCollectionComponent } from './add-products-to-collection.component';

describe('AddProductsToCollectionComponent', () => {
  let component: AddProductsToCollectionComponent;
  let fixture: ComponentFixture<AddProductsToCollectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddProductsToCollectionComponent]
    });
    fixture = TestBed.createComponent(AddProductsToCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
