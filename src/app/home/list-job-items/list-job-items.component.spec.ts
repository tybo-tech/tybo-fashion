import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListJobItemsComponent } from './list-job-items.component';

describe('ListJobItemsComponent', () => {
  let component: ListJobItemsComponent;
  let fixture: ComponentFixture<ListJobItemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListJobItemsComponent]
    });
    fixture = TestBed.createComponent(ListJobItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
