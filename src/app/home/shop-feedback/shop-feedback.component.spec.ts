import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopFeedbackComponent } from './shop-feedback.component';

describe('ShopFeedbackComponent', () => {
  let component: ShopFeedbackComponent;
  let fixture: ComponentFixture<ShopFeedbackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShopFeedbackComponent]
    });
    fixture = TestBed.createComponent(ShopFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
