import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopStatComponent } from './shop-stat.component';

describe('ShopStatComponent', () => {
  let component: ShopStatComponent;
  let fixture: ComponentFixture<ShopStatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShopStatComponent]
    });
    fixture = TestBed.createComponent(ShopStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
