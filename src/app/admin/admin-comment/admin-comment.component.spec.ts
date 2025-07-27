import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCommentComponent } from './admin-comment.component';

describe('AdminCommentComponent', () => {
  let component: AdminCommentComponent;
  let fixture: ComponentFixture<AdminCommentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminCommentComponent]
    });
    fixture = TestBed.createComponent(AdminCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
