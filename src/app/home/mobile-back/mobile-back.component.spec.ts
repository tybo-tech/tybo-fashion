import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileBackComponent } from './mobile-back.component';

describe('MobileBackComponent', () => {
  let component: MobileBackComponent;
  let fixture: ComponentFixture<MobileBackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MobileBackComponent]
    });
    fixture = TestBed.createComponent(MobileBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
