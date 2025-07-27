import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserContactComponent } from './view-user-contact.component';

describe('ViewUserContactComponent', () => {
  let component: ViewUserContactComponent;
  let fixture: ComponentFixture<ViewUserContactComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewUserContactComponent]
    });
    fixture = TestBed.createComponent(ViewUserContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
