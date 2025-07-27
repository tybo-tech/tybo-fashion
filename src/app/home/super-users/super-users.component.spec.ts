import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperUsersComponent } from './super-users.component';

describe('SuperUsersComponent', () => {
  let component: SuperUsersComponent;
  let fixture: ComponentFixture<SuperUsersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuperUsersComponent]
    });
    fixture = TestBed.createComponent(SuperUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
