import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileJobItemComponent } from './profile-job-item.component';

describe('ProfileJobItemComponent', () => {
  let component: ProfileJobItemComponent;
  let fixture: ComponentFixture<ProfileJobItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileJobItemComponent]
    });
    fixture = TestBed.createComponent(ProfileJobItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
