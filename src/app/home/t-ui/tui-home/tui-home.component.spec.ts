import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuiHomeComponent } from './tui-home.component';

describe('TuiHomeComponent', () => {
  let component: TuiHomeComponent;
  let fixture: ComponentFixture<TuiHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TuiHomeComponent]
    });
    fixture = TestBed.createComponent(TuiHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
