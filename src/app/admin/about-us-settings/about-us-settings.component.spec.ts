import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutUsSettingsComponent } from './about-us-settings.component';

describe('AboutUsSettingsComponent', () => {
  let component: AboutUsSettingsComponent;
  let fixture: ComponentFixture<AboutUsSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AboutUsSettingsComponent]
    });
    fixture = TestBed.createComponent(AboutUsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
