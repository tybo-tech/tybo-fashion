import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePaymentMethodComponent } from './choose-payment-method.component';

describe('ChoosePaymentMethodComponent', () => {
  let component: ChoosePaymentMethodComponent;
  let fixture: ComponentFixture<ChoosePaymentMethodComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChoosePaymentMethodComponent]
    });
    fixture = TestBed.createComponent(ChoosePaymentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
