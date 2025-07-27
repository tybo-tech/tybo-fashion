import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CleanUpImagesComponent } from './clean-up-images.component';

describe('CleanUpImagesComponent', () => {
  let component: CleanUpImagesComponent;
  let fixture: ComponentFixture<CleanUpImagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CleanUpImagesComponent]
    });
    fixture = TestBed.createComponent(CleanUpImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
