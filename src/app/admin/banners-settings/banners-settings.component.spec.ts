import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannersSettingsComponent } from './banners-settings.component';

describe('BannersSettingsComponent', () => {
  let component: BannersSettingsComponent;
  let fixture: ComponentFixture<BannersSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BannersSettingsComponent]
    });
    fixture = TestBed.createComponent(BannersSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
