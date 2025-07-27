import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileJobItemsComponent } from './profile-job-items.component';

describe('ProfileJobItemsComponent', () => {
  let component: ProfileJobItemsComponent;
  let fixture: ComponentFixture<ProfileJobItemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileJobItemsComponent]
    });
    fixture = TestBed.createComponent(ProfileJobItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
