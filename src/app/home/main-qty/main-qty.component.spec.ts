import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainQtyComponent } from './main-qty.component';

describe('MainQtyComponent', () => {
  let component: MainQtyComponent;
  let fixture: ComponentFixture<MainQtyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MainQtyComponent]
    });
    fixture = TestBed.createComponent(MainQtyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
