import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimaonailsSettingsComponent } from './testimaonails-settings.component';

describe('TestimaonailsSettingsComponent', () => {
  let component: TestimaonailsSettingsComponent;
  let fixture: ComponentFixture<TestimaonailsSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestimaonailsSettingsComponent]
    });
    fixture = TestBed.createComponent(TestimaonailsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
