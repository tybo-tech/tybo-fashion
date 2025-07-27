import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopCtaComponent } from './shop-cta.component';

describe('ShopCtaComponent', () => {
  let component: ShopCtaComponent;
  let fixture: ComponentFixture<ShopCtaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShopCtaComponent]
    });
    fixture = TestBed.createComponent(ShopCtaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
