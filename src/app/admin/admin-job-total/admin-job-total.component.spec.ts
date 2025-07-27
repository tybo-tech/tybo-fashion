import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminJobTotalComponent } from './admin-job-total.component';

describe('AdminJobTotalComponent', () => {
  let component: AdminJobTotalComponent;
  let fixture: ComponentFixture<AdminJobTotalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminJobTotalComponent]
    });
    fixture = TestBed.createComponent(AdminJobTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
