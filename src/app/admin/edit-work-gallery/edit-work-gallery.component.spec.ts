import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWorkGalleryComponent } from './edit-work-gallery.component';

describe('EditWorkGalleryComponent', () => {
  let component: EditWorkGalleryComponent;
  let fixture: ComponentFixture<EditWorkGalleryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditWorkGalleryComponent]
    });
    fixture = TestBed.createComponent(EditWorkGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
