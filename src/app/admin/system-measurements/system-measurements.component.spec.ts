import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemMeasurementsComponent } from './system-measurements.component';

describe('SystemMeasurementsComponent', () => {
  let component: SystemMeasurementsComponent;
  let fixture: ComponentFixture<SystemMeasurementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SystemMeasurementsComponent]
    });
    fixture = TestBed.createComponent(SystemMeasurementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
