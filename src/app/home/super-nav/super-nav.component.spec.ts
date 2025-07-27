import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperNavComponent } from './super-nav.component';

describe('SuperNavComponent', () => {
  let component: SuperNavComponent;
  let fixture: ComponentFixture<SuperNavComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuperNavComponent]
    });
    fixture = TestBed.createComponent(SuperNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
