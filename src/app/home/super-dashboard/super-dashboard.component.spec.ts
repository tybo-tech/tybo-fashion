import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperDashboardComponent } from './super-dashboard.component';

describe('SuperDashboardComponent', () => {
  let component: SuperDashboardComponent;
  let fixture: ComponentFixture<SuperDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuperDashboardComponent]
    });
    fixture = TestBed.createComponent(SuperDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
