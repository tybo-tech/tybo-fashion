import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopFeaturedComponent } from './shop-featured.component';

describe('ShopFeaturedComponent', () => {
  let component: ShopFeaturedComponent;
  let fixture: ComponentFixture<ShopFeaturedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShopFeaturedComponent]
    });
    fixture = TestBed.createComponent(ShopFeaturedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
