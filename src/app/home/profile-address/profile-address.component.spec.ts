import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileAddressComponent } from './profile-address.component';

describe('ProfileAddressComponent', () => {
  let component: ProfileAddressComponent;
  let fixture: ComponentFixture<ProfileAddressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileAddressComponent]
    });
    fixture = TestBed.createComponent(ProfileAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
