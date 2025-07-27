import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StringOptionPickerComponent } from './string-option-picker.component';

describe('StringOptionPickerComponent', () => {
  let component: StringOptionPickerComponent;
  let fixture: ComponentFixture<StringOptionPickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StringOptionPickerComponent]
    });
    fixture = TestBed.createComponent(StringOptionPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
