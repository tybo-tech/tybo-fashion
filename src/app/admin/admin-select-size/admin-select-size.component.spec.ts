import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSelectSizeComponent } from './admin-select-size.component';

describe('AdminSelectSizeComponent', () => {
  let component: AdminSelectSizeComponent;
  let fixture: ComponentFixture<AdminSelectSizeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminSelectSizeComponent]
    });
    fixture = TestBed.createComponent(AdminSelectSizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
