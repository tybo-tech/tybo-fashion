import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneNavComponent } from './phone-nav.component';

describe('PhoneNavComponent', () => {
  let component: PhoneNavComponent;
  let fixture: ComponentFixture<PhoneNavComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PhoneNavComponent]
    });
    fixture = TestBed.createComponent(PhoneNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
