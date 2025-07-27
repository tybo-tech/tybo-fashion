import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopPlaceholderComponent } from './shop-placeholder.component';

describe('ShopPlaceholderComponent', () => {
  let component: ShopPlaceholderComponent;
  let fixture: ComponentFixture<ShopPlaceholderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShopPlaceholderComponent]
    });
    fixture = TestBed.createComponent(ShopPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
