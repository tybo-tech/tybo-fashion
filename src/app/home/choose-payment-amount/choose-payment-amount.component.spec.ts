import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePaymentAmountComponent } from './choose-payment-amount.component';

describe('ChoosePaymentAmountComponent', () => {
  let component: ChoosePaymentAmountComponent;
  let fixture: ComponentFixture<ChoosePaymentAmountComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChoosePaymentAmountComponent]
    });
    fixture = TestBed.createComponent(ChoosePaymentAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
