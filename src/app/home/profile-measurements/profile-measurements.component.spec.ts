import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileMeasurementsComponent } from './profile-measurements.component';

describe('ProfileMeasurementsComponent', () => {
  let component: ProfileMeasurementsComponent;
  let fixture: ComponentFixture<ProfileMeasurementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileMeasurementsComponent]
    });
    fixture = TestBed.createComponent(ProfileMeasurementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
