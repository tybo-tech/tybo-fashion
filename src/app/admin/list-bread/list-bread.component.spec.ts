import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBreadComponent } from './list-bread.component';

describe('ListBreadComponent', () => {
  let component: ListBreadComponent;
  let fixture: ComponentFixture<ListBreadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListBreadComponent]
    });
    fixture = TestBed.createComponent(ListBreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
