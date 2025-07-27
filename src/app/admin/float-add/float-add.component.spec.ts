import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatAddComponent } from './float-add.component';

describe('FloatAddComponent', () => {
  let component: FloatAddComponent;
  let fixture: ComponentFixture<FloatAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FloatAddComponent]
    });
    fixture = TestBed.createComponent(FloatAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
