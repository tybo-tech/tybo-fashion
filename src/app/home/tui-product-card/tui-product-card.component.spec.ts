import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuiProductCardComponent } from './tui-product-card.component';

describe('TuiProductCardComponent', () => {
  let component: TuiProductCardComponent;
  let fixture: ComponentFixture<TuiProductCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TuiProductCardComponent]
    });
    fixture = TestBed.createComponent(TuiProductCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
