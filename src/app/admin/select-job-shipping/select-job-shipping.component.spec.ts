import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectJobShippingComponent } from './select-job-shipping.component';

describe('SelectJobShippingComponent', () => {
  let component: SelectJobShippingComponent;
  let fixture: ComponentFixture<SelectJobShippingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectJobShippingComponent]
    });
    fixture = TestBed.createComponent(SelectJobShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
