import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFormComponent } from './customer-form.component';
import { CustomerService } from 'src/services/customer.service';
import { UxService } from 'src/services/ux.service';
import { ContactPickerService } from 'src/services/contact-picker.service';
import { UploadService } from 'src/services/upload.service';
import { PLATFORM_ID } from '@angular/core';

describe('CustomerFormComponent', () => {
  let component: CustomerFormComponent;
  let fixture: ComponentFixture<CustomerFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerFormComponent],
      providers: [
        { provide: CustomerService, useValue: { save: () => ({ subscribe: () => {} }) } },
        { provide: UxService, useValue: { show_toast: () => {} } },
        { provide: UploadService, useValue: { url: '', uploadFilev2: () => ({ subscribe: () => {} }) } },
        { provide: ContactPickerService, useValue: { isSupported: () => false, isSecureContext: () => true, getSupportedProperties: () => Promise.resolve([]), select: () => Promise.resolve([]), toCustomerPatch: () => ({}), blobToDataUrl: () => Promise.resolve('') } },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    fixture = TestBed.createComponent(CustomerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide import button when not supported', () => {
    expect(component.isContactPickerSupported).toBeFalse();
  });
});
