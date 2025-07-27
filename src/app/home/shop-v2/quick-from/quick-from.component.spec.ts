import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickFromComponent } from './quick-from.component';

describe('QuickFromComponent', () => {
  let component: QuickFromComponent;
  let fixture: ComponentFixture<QuickFromComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuickFromComponent]
    });
    fixture = TestBed.createComponent(QuickFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
