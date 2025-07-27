import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutCustomerComponent } from './checkout-customer.component';

describe('CheckoutCustomerComponent', () => {
  let component: CheckoutCustomerComponent;
  let fixture: ComponentFixture<CheckoutCustomerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CheckoutCustomerComponent]
    });
    fixture = TestBed.createComponent(CheckoutCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
