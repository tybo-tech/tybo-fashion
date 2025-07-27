import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyShopBettaComponent } from './my-shop-betta.component';

describe('MyShopBettaComponent', () => {
  let component: MyShopBettaComponent;
  let fixture: ComponentFixture<MyShopBettaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyShopBettaComponent]
    });
    fixture = TestBed.createComponent(MyShopBettaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
