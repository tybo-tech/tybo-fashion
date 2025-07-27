import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkGalleryComponent } from './work-gallery.component';

describe('WorkGalleryComponent', () => {
  let component: WorkGalleryComponent;
  let fixture: ComponentFixture<WorkGalleryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkGalleryComponent]
    });
    fixture = TestBed.createComponent(WorkGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
