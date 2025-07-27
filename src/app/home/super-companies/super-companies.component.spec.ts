import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperCompaniesComponent } from './super-companies.component';

describe('SuperCompaniesComponent', () => {
  let component: SuperCompaniesComponent;
  let fixture: ComponentFixture<SuperCompaniesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuperCompaniesComponent]
    });
    fixture = TestBed.createComponent(SuperCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
