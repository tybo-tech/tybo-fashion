import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileOrderComponent } from './profile-order.component';

describe('ProfileOrderComponent', () => {
  let component: ProfileOrderComponent;
  let fixture: ComponentFixture<ProfileOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileOrderComponent]
    });
    fixture = TestBed.createComponent(ProfileOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
