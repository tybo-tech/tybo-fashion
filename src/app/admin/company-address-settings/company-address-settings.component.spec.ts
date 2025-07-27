import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyAddressSettingsComponent } from './company-address-settings.component';

describe('CompanyAddressSettingsComponent', () => {
  let component: CompanyAddressSettingsComponent;
  let fixture: ComponentFixture<CompanyAddressSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompanyAddressSettingsComponent]
    });
    fixture = TestBed.createComponent(CompanyAddressSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
