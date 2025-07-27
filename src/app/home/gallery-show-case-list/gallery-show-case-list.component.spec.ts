import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryShowCaseListComponent } from './gallery-show-case-list.component';

describe('GalleryShowCaseListComponent', () => {
  let component: GalleryShowCaseListComponent;
  let fixture: ComponentFixture<GalleryShowCaseListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GalleryShowCaseListComponent]
    });
    fixture = TestBed.createComponent(GalleryShowCaseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
