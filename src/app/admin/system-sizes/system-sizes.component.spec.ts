import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemSizesComponent } from './system-sizes.component';

describe('SystemSizesComponent', () => {
  let component: SystemSizesComponent;
  let fixture: ComponentFixture<SystemSizesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SystemSizesComponent]
    });
    fixture = TestBed.createComponent(SystemSizesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
