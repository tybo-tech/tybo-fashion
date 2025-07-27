import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopingCancelledComponent } from './shoping-cancelled.component';

describe('ShopingCancelledComponent', () => {
  let component: ShopingCancelledComponent;
  let fixture: ComponentFixture<ShopingCancelledComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShopingCancelledComponent]
    });
    fixture = TestBed.createComponent(ShopingCancelledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
