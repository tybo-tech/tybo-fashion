import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerJobDetailsComponent } from './customer-job-details.component';

describe('CustomerJobDetailsComponent', () => {
  let component: CustomerJobDetailsComponent;
  let fixture: ComponentFixture<CustomerJobDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerJobDetailsComponent]
    });
    fixture = TestBed.createComponent(CustomerJobDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
