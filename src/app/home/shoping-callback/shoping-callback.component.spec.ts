import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopingCallbackComponent } from './shoping-callback.component';

describe('ShopingCallbackComponent', () => {
  let component: ShopingCallbackComponent;
  let fixture: ComponentFixture<ShopingCallbackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShopingCallbackComponent]
    });
    fixture = TestBed.createComponent(ShopingCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
