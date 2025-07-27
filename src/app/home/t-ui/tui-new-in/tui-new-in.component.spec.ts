import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuiNewInComponent } from './tui-new-in.component';

describe('TuiNewInComponent', () => {
  let component: TuiNewInComponent;
  let fixture: ComponentFixture<TuiNewInComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TuiNewInComponent]
    });
    fixture = TestBed.createComponent(TuiNewInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
