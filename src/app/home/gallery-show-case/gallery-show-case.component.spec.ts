import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryShowCaseComponent } from './gallery-show-case.component';

describe('GalleryShowCaseComponent', () => {
  let component: GalleryShowCaseComponent;
  let fixture: ComponentFixture<GalleryShowCaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GalleryShowCaseComponent]
    });
    fixture = TestBed.createComponent(GalleryShowCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
