import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsModalComponent } from './contact-us-modal.component';

describe('ContactUsModalComponent', () => {
  let component: ContactUsModalComponent;
  let fixture: ComponentFixture<ContactUsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactUsModalComponent]
    });
    fixture = TestBed.createComponent(ContactUsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
