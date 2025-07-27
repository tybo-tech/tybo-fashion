import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminModalHeaderComponent } from './admin-modal-header.component';

describe('AdminModalHeaderComponent', () => {
  let component: AdminModalHeaderComponent;
  let fixture: ComponentFixture<AdminModalHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminModalHeaderComponent]
    });
    fixture = TestBed.createComponent(AdminModalHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
