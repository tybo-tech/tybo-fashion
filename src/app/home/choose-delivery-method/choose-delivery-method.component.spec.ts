import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseDeliveryMethodComponent } from './choose-delivery-method.component';

describe('ChooseDeliveryMethodComponent', () => {
  let component: ChooseDeliveryMethodComponent;
  let fixture: ComponentFixture<ChooseDeliveryMethodComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChooseDeliveryMethodComponent]
    });
    fixture = TestBed.createComponent(ChooseDeliveryMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
