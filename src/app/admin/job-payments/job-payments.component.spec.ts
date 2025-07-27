import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPaymentsComponent } from './job-payments.component';

describe('JobPaymentsComponent', () => {
  let component: JobPaymentsComponent;
  let fixture: ComponentFixture<JobPaymentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobPaymentsComponent]
    });
    fixture = TestBed.createComponent(JobPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
