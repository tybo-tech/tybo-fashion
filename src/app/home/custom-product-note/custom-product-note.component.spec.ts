import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomProductNoteComponent } from './custom-product-note.component';

describe('CustomProductNoteComponent', () => {
  let component: CustomProductNoteComponent;
  let fixture: ComponentFixture<CustomProductNoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomProductNoteComponent]
    });
    fixture = TestBed.createComponent(CustomProductNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
