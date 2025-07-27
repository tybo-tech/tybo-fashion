import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocailSettingsComponent } from './socail-settings.component';

describe('SocailSettingsComponent', () => {
  let component: SocailSettingsComponent;
  let fixture: ComponentFixture<SocailSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SocailSettingsComponent]
    });
    fixture = TestBed.createComponent(SocailSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
