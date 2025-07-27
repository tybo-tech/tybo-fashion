import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipPickerComponent } from './chip-picker.component';

describe('ChipPickerComponent', () => {
  let component: ChipPickerComponent;
  let fixture: ComponentFixture<ChipPickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChipPickerComponent]
    });
    fixture = TestBed.createComponent(ChipPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
