import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyContactInfoComponent } from './company-contact-info.component';

describe('CompanyContactInfoComponent', () => {
  let component: CompanyContactInfoComponent;
  let fixture: ComponentFixture<CompanyContactInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompanyContactInfoComponent]
    });
    fixture = TestBed.createComponent(CompanyContactInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
