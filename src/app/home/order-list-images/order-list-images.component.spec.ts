import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListImagesComponent } from './order-list-images.component';

describe('OrderListImagesComponent', () => {
  let component: OrderListImagesComponent;
  let fixture: ComponentFixture<OrderListImagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderListImagesComponent]
    });
    fixture = TestBed.createComponent(OrderListImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
