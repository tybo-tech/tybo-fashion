import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobItemFormComponent } from './job-item-form.component';

describe('JobItemFormComponent', () => {
  let component: JobItemFormComponent;
  let fixture: ComponentFixture<JobItemFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobItemFormComponent]
    });
    fixture = TestBed.createComponent(JobItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
