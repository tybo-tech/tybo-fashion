import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyShopContentComponent } from './my-shop-content.component';

describe('MyShopContentComponent', () => {
  let component: MyShopContentComponent;
  let fixture: ComponentFixture<MyShopContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyShopContentComponent]
    });
    fixture = TestBed.createComponent(MyShopContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
