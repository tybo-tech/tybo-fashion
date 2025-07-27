import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneTopBarComponent } from './phone-top-bar.component';

describe('PhoneTopBarComponent', () => {
  let component: PhoneTopBarComponent;
  let fixture: ComponentFixture<PhoneTopBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PhoneTopBarComponent]
    });
    fixture = TestBed.createComponent(PhoneTopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
