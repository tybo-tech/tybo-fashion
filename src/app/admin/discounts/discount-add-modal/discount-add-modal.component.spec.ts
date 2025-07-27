import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountAddModalComponent } from './discount-add-modal.component';

describe('DiscountAddModalComponent', () => {
  let component: DiscountAddModalComponent;
  let fixture: ComponentFixture<DiscountAddModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiscountAddModalComponent]
    });
    fixture = TestBed.createComponent(DiscountAddModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
