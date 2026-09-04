import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Customer, sanitizePhoneNumber } from 'src/models/Customer';
import { initMeasurements } from 'src/models/measurement.model';
import { loading, stop_loading } from 'src/models/ux.model';
import { CustomerService } from 'src/services/customer.service';
import { UxService } from 'src/services/ux.service';
import {
  ContactInfo,
  ContactPickerService,
  ContactProperty,
} from 'src/services/contact-picker.service';
import { UploadService } from 'src/services/upload.service';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent implements OnInit {
  @Input() customer?: Customer;
  @Output() onSave = new EventEmitter<Customer>();

  // Duplicate-submit guard: prevents a second save while one is in flight.
  saving = false;

  // Contact Picker state — service drives capability, component drives UI state
  isContactPickerSupported = false;
  isContactPickerLoading = false;

  constructor(
    private cus: CustomerService,
    private ux: UxService,
    private contactPicker: ContactPickerService,
    private uploadService: UploadService
  ) {}
  ngOnInit(): void {
    if (this.customer && !this.customer.Measurements?.length) {
      this.customer.Measurements = [
        initMeasurements('Waist'),
        initMeasurements('Chest'),
        initMeasurements('Hips'),
        initMeasurements('Neck'),
        initMeasurements('Shoulder'),
        initMeasurements('Sleeve'),
        initMeasurements('Length'),
        initMeasurements('Bust'),
        initMeasurements('Thigh'),
        initMeasurements('Inseam'),
        initMeasurements('Outseam'),
        initMeasurements('Crotch'),
        initMeasurements('Bicep'),
        initMeasurements('Wrist'),
        initMeasurements('Ankle'),
        initMeasurements('Collar'),
        initMeasurements('Cuff'),
      ];
    }
    // Feature-detect once; hide button on unsupported browsers (Firefox/Safari/desktop)
    this.isContactPickerSupported = this.contactPicker.isSupported();
  }

  /** User-gesture entry point — opens OS contact picker and patches the form */
  async importFromContacts(): Promise<void> {
    if (this.isContactPickerLoading) return;
    if (!this.customer) return;
    // Re-check at click time (in case of SSR/hydration timing)
    if (!this.contactPicker.isSupported()) {
      this.ux.show_toast('Contacts not supported on this device or browser', 'Not supported', [
        'bg-danger',
      ]);
      return;
    }
    if (!this.contactPicker.isSecureContext()) {
      this.ux.show_toast('Contacts require a secure context (HTTPS)', 'Secure context required', [
        'bg-warning',
        'text-dark',
      ]);
      return;
    }

    this.isContactPickerLoading = true;
    try {
      const supportedProps = await this.contactPicker.getSupportedProperties();
      const desired: ContactProperty[] = ['name', 'tel', 'email', 'icon', 'address'];
      // Only request props the device actually supports; fallback to name+tel
      const props: ContactProperty[] =
        supportedProps.length > 0 ? desired.filter((p) => supportedProps.includes(p)) : desired;
      const effectiveProps = props.length ? props : (['name', 'tel'] as ContactProperty[]);

      const contacts = await this.contactPicker.select(effectiveProps, { multiple: false });

      if (!contacts || contacts.length === 0) {
        // Some UAs resolve [] on cancel; treat as no-op
        return;
      }

      this.applyContactToCustomer(contacts[0]);
      this.ux.show_toast('Contact imported — review fields then save', 'Success');
    } catch (err: any) {
      const name = err?.name as string | undefined;
      // User-cancel / picker dismissed is not an error — stay quiet
      if (name === 'AbortError' || name === 'InvalidStateError') return;
      if (name === 'NotAllowedError') {
        this.ux.show_toast('Permission denied — please allow access to contacts', 'Permission denied', [
          'bg-warning',
          'text-dark',
        ]);
        return;
      }
      if (name === 'NotSupportedError') {
        this.ux.show_toast('Contacts not supported on this device', 'Not supported', ['bg-danger']);
        return;
      }
      if (name === 'SecurityError') {
        this.ux.show_toast('Contacts require HTTPS', 'Secure context required', [
          'bg-warning',
          'text-dark',
        ]);
        return;
      }
      this.ux.show_toast(err?.message || 'Could not import contact', 'Error', ['bg-danger']);
    } finally {
      this.isContactPickerLoading = false;
    }
  }

  private applyContactToCustomer(contact: ContactInfo): void {
    if (!this.customer) return;
    const patch = this.contactPicker.toCustomerPatch(contact);

    // Customer form binds a single "Full Name" input to customer.Name.
    // Keep full name visible, but also populate Surname for backend completeness.
    if (patch.fullName) this.customer.Name = patch.fullName;
    else if (patch.name) this.customer.Name = patch.name;
    if (patch.surname) this.customer.Surname = patch.surname;

    if (patch.phone) this.customer.PhoneNumber = patch.phone;
    if (patch.email) this.customer.Email = patch.email;

    // Address — only patch fields the contact actually has; never clobber with undefined
    if (patch.addressLineHome) this.customer.AddressLineHome = patch.addressLineHome;
    if (patch.addressLine2) this.customer.AddressLine2 = patch.addressLine2;
    if (patch.city) this.customer.City = patch.city;
    if (patch.postalCode) this.customer.PostalCode = patch.postalCode;
    // region can be province/state — map to City fallback if City empty, or Suburb
    if (patch.region && !this.customer.City) this.customer.City = patch.region;

    // Avatar — patch immediately via data URL for preview, then upload in background for persistence
    if (patch.iconBlob) {
      void this.handleContactIcon(patch.iconBlob);
    }
  }

  private async handleContactIcon(blob: Blob): Promise<void> {
    if (!this.customer) return;
    try {
      // Immediate preview so user sees result without waiting for upload
      const dataUrl = await this.contactPicker.blobToDataUrl(blob);
      if (this.customer) this.customer.Dp = dataUrl;

      // Background upload to get a persistent URL (api/upload/upload.php)
      const mime = blob.type || 'image/jpeg';
      const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
      const file = new File([blob], `contact-avatar.${ext}`, { type: mime });
      const rand = Math.floor(1000 + Math.random() * 9000);
      const name = `tybo${rand}contact.${ext}`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);

      this.uploadService.uploadFilev2(formData).subscribe({
        next: (res: any) => {
          // API returns filename string on success (e.g. "abc123.jpg")
          const filename = typeof res === 'string' ? res : res?.filename || res?.file || '';
          if (filename && typeof filename === 'string' && filename.length > 5) {
            const uri = `${this.uploadService.url}/upload/${filename}`;
            if (this.customer) this.customer.Dp = uri;
          }
        },
        error: () => {
          // Preview data URL already set — upload failure is non-blocking
        },
      });
    } catch {
      // Preview failed — non-blocking
    }
  }
  save() {
    if (this.customer && !this.saving) {
      this.saving = true;
      loading();
      if(this.customer.PhoneNumber)
      this.customer.PhoneNumber = sanitizePhoneNumber(this.customer.PhoneNumber);
      this.cus
        .save(this.customer)
        .pipe(
          finalize(() => {
            // Always release the guard and the global loading overlay, whether
            // the request succeeds, fails at HTTP/network level, or is
            // cancelled. Without this, a failed save would leave `saving`
            // true and the overlay attached, permanently blocking later saves.
            stop_loading();
            this.saving = false;
          })
        )
        .subscribe({
          next: (data) => {
            if (data && data.CustomerId) {
              !this.isNew &&
                this.ux.show_toast('Customer updated successfully', 'Success');
              this.isNew &&
                this.ux.show_toast('Customer created successfully', 'Success');
              this.onSave.emit(data);
            } else {
              this.ux.show_toast('Failed to save customer', 'Error', ['bg-danger']);
            }
          },
          error: () => {
            this.ux.show_toast('Failed to save customer', 'Error', ['bg-danger']);
          },
        });
    }
  }
  add_measurement() {
    if (this.customer) {
      this.customer.Measurements?.push({ ...initMeasurements('') });
    }
  }
  delete(index: number) {
    if (this.customer && this.customer.Measurements) {
      this.customer.Measurements.splice(index, 1);
    }
  }
  get isNew() {
    return !this.customer?.CreateDate;
  }
}
