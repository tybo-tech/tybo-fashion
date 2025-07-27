import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewInComponent } from './new-in.component';

describe('NewInComponent', () => {
  let component: NewInComponent;
  let fixture: ComponentFixture<NewInComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewInComponent]
    });
    fixture = TestBed.createComponent(NewInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
