import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeMeasurementsComponent } from './home-measurements.component';

describe('HomeMeasurementsComponent', () => {
  let component: HomeMeasurementsComponent;
  let fixture: ComponentFixture<HomeMeasurementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeMeasurementsComponent]
    });
    fixture = TestBed.createComponent(HomeMeasurementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
