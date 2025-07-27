import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalHeaderHomeComponent } from './modal-header-home.component';

describe('ModalHeaderHomeComponent', () => {
  let component: ModalHeaderHomeComponent;
  let fixture: ComponentFixture<ModalHeaderHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalHeaderHomeComponent]
    });
    fixture = TestBed.createComponent(ModalHeaderHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
