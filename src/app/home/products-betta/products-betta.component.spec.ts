import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsBettaComponent } from './products-betta.component';

describe('ProductsBettaComponent', () => {
  let component: ProductsBettaComponent;
  let fixture: ComponentFixture<ProductsBettaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductsBettaComponent]
    });
    fixture = TestBed.createComponent(ProductsBettaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
