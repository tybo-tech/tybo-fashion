import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListIconHomeComponent } from './list-icon-home.component';

describe('ListIconHomeComponent', () => {
  let component: ListIconHomeComponent;
  let fixture: ComponentFixture<ListIconHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListIconHomeComponent]
    });
    fixture = TestBed.createComponent(ListIconHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
