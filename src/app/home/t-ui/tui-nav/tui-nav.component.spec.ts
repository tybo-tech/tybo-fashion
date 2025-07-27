import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuiNavComponent } from './tui-nav.component';

describe('TuiNavComponent', () => {
  let component: TuiNavComponent;
  let fixture: ComponentFixture<TuiNavComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TuiNavComponent]
    });
    fixture = TestBed.createComponent(TuiNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
