import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQtyComponent } from './admin-qty.component';

describe('AdminQtyComponent', () => {
  let component: AdminQtyComponent;
  let fixture: ComponentFixture<AdminQtyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminQtyComponent]
    });
    fixture = TestBed.createComponent(AdminQtyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
