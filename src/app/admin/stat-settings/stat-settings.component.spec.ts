import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatSettingsComponent } from './stat-settings.component';

describe('StatSettingsComponent', () => {
  let component: StatSettingsComponent;
  let fixture: ComponentFixture<StatSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatSettingsComponent]
    });
    fixture = TestBed.createComponent(StatSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
