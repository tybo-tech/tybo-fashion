import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinUsCtaComponent } from './join-us-cta.component';

describe('JoinUsCtaComponent', () => {
  let component: JoinUsCtaComponent;
  let fixture: ComponentFixture<JoinUsCtaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JoinUsCtaComponent]
    });
    fixture = TestBed.createComponent(JoinUsCtaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
