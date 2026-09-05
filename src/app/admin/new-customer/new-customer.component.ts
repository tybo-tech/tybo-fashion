import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Customer, CustomerListItem, initCustomer, sanitizePhoneNumber } from 'src/models/Customer';
import { loading, stop_loading } from 'src/models/ux.model';
import { CustomerService } from 'src/services/customer.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';
import {
  ContactInfo,
  ContactPickerService,
  ContactProperty,
} from 'src/services/contact-picker.service';
import { UploadService } from 'src/services/upload.service';

type WizardStep = 'basic' | 'address' | 'measurements';

const STEP_ORDER: WizardStep[] = ['basic', 'address', 'measurements'];

// Local-storage key for the in-progress New Customer draft. Persisted across
// step navigations and page refreshes so the user can freely refresh on any
// step without losing what they filled in. Cleared on successful save.
const DRAFT_KEY = 'tybo_new_customer_draft';

/**
 * Multi-step New Customer flow (Sprint 4). Replaces the add-customer modal:
 * a URL-supported page at /store/admin/customers/new/:step with
 * basic details -> address (skippable) -> measurements (skippable).
 *
 * The URL is the single source of truth for the step. The component instance
 * is reused across step navigations (param-only change), so the draft
 * survives Next/Back/Skip. A full refresh restarts the draft — intentional
 * and documented in sprints/4.
 *
 * Every step has a sticky footer action bar, so Next/Skip is always visible
 * without scrolling.
 */
@Component({
  selector: 'app-new-customer',
  templateUrl: './new-customer.component.html',
  styleUrls: ['./new-customer.component.scss'],
})
export class NewCustomerComponent implements OnInit, OnDestroy {
  readonly stepOrder = STEP_ORDER;

  step: WizardStep = 'basic';
  customer: Customer;

  // Duplicate-submit guard: prevents a second save while one is in flight.
  saving = false;

  // When the wizard was entered from the Add Job picker, the URL carries
  // ?return=picker. After a successful save the flow returns to the jobs
  // page, which reopens Add Job with the new customer preselected.
  returnToPicker = false;

  // Contact Picker state — service drives capability, component drives UI state
  isContactPickerSupported = false;
  isContactPickerLoading = false;

  private paramSub?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private cus: CustomerService,
    private userService: UserService,
    private ux: UxService,
    private contactPicker: ContactPickerService,
    private uploadService: UploadService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const user = this.userService.getUser;
    this.customer = this.loadDraft() || initCustomer(user?.CompanyId || '');
    if (!user) {
      this.router.navigate(['/home/sign-in']);
    }
  }

  ngOnInit(): void {
    if (!this.userService.getUser) return;

    // URL drives the step; the component persists across param changes.
    this.paramSub = this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const requested = params.get('step') as WizardStep | null;
        // Optional steps require the basic details first: a deep link (or a
        // refresh, which restarts the draft) landing directly on address or
        // measurements would expose actions that silently do nothing. Route
        // the user to the first step instead.
        const needsBasicFirst =
          (!requested || !STEP_ORDER.includes(requested)) ||
          (requested !== 'basic' && !this.canLeaveBasic);
        if (needsBasicFirst) {
          this.router.navigate(['/store/admin/customers/new', 'basic'], {
            replaceUrl: true,
            // Keep ?return=picker so the origin survives the redirect.
            queryParamsHandling: 'preserve',
          });
          return;
        }
        this.step = requested;
      });

    // ?return=picker marks the Add Job picker as the origin.
    this.returnToPicker = this.route.snapshot.queryParamMap.get('return') === 'picker';

    this.isContactPickerSupported = this.contactPicker.isSupported();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.paramSub?.unsubscribe();
  }

  // Persist the current step's input on refresh/close so nothing is lost.
  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.saveDraft();
  }

  get stepIndex(): number {
    return STEP_ORDER.indexOf(this.step);
  }

  get canLeaveBasic(): boolean {
    return !!(
      this.customer.Name?.trim() &&
      this.customer.Email?.trim() &&
      this.customer.PhoneNumber?.trim()
    );
  }

  get hasAddressInput(): boolean {
    return !!(
      this.customer.AddressLineHome?.trim() ||
      this.customer.AddressLine2?.trim() ||
      this.customer.City?.trim() ||
      this.customer.PostalCode?.trim()
    );
  }

  goBack(): void {
    if (this.stepIndex <= 0) {
      this.leave();
      return;
    }
    this.goToStep(STEP_ORDER[this.stepIndex - 1]);
  }

  next(): void {
    if (this.step === 'basic' && !this.canLeaveBasic) return;
    if (this.stepIndex >= STEP_ORDER.length - 1) {
      this.save();
      return;
    }
    this.goToStep(STEP_ORDER[this.stepIndex + 1]);
  }

  // Skip is only offered on the optional steps (address, measurements);
  // the template hides it elsewhere.
  skip(): void {
    if (this.stepIndex >= STEP_ORDER.length - 1) {
      this.save();
      return;
    }
    this.goToStep(STEP_ORDER[this.stepIndex + 1]);
  }

  leave(): void {
    this.router.navigate(
      this.returnToPicker ? ['/store/admin/jobs'] : ['/store/admin/customers']
    );
  }

  private goToStep(step: WizardStep): void {
    // Persist the draft before navigating so a refresh on the next step
    // restores everything filled in so far.
    this.saveDraft();
    // Preserve query params across steps so ?return=picker survives Next,
    // Back and Skip — and a refresh on a later step still returns to the
    // Add Job flow after saving.
    this.router.navigate(['/store/admin/customers/new', step], {
      queryParamsHandling: 'preserve',
    });
  }

  save(): void {
    if (!this.canLeaveBasic || this.saving) return;
    this.saving = true;
    loading();
    if (this.customer.PhoneNumber) {
      this.customer.PhoneNumber = sanitizePhoneNumber(this.customer.PhoneNumber);
    }
    // Skipping measurements means: no empty rows sent. Only real entries go.
    this.customer.Measurements = (this.customer.Measurements || []).filter(
      (m) => m.Name && m.Name.trim()
    );
    this.cus
      .save(this.customer)
      .pipe(
        finalize(() => {
          stop_loading();
          this.saving = false;
        })
      )
      .subscribe({
        next: (data) => {
          if (data && data.CustomerId) {
            this.clearDraft();
            this.ux.show_toast('Customer created successfully', 'Success');
            this.navigateAfterSave(data);
          } else {
            this.ux.show_toast('Failed to save customer', 'Error', ['bg-danger']);
          }
        },
        error: () => {
          this.ux.show_toast('Failed to save customer', 'Error', ['bg-danger']);
        },
      });
  }

  private navigateAfterSave(saved: Customer): void {
    if (this.returnToPicker) {
      // Back into the job flow: the jobs page reopens Add Job with this
      // customer preselected via navigation state.
      const item: CustomerListItem = {
        CustomerId: saved.CustomerId,
        CustomerName: saved.FullName || saved.Name,
        PhoneNumber: saved.PhoneNumber,
        Email: saved.Email,
      };
      this.router.navigate(['/store/admin/jobs'], { state: { addJobFor: item } });
      return;
    }
    this.router.navigate(['/store/admin/customer', saved.CustomerId]);
  }

  // ── Draft persistence (localStorage) ───────────────────────────────────
  // The draft survives step navigations and page refreshes so the user can
  // freely refresh on any step. Cleared on successful save.

  private saveDraft(): void {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(this.customer));
    } catch {
      // Storage unavailable (private mode / quota) — non-blocking.
    }
  }

  private loadDraft(): Customer | null {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      // Merge over a fresh init so any missing fields get sane defaults.
      const user = this.userService.getUser;
      const base = initCustomer(user?.CompanyId || '');
      return { ...base, ...parsed };
    } catch {
      return null;
    }
  }

  private clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Non-blocking.
    }
  }

  /** User-gesture entry point — opens OS contact picker and patches the form */
  async importFromContacts(): Promise<void> {
    if (this.isContactPickerLoading) return;
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
      const props: ContactProperty[] =
        supportedProps.length > 0 ? desired.filter((p) => supportedProps.includes(p)) : desired;
      const effectiveProps = props.length ? props : (['name', 'tel'] as ContactProperty[]);

      const contacts = await this.contactPicker.select(effectiveProps, { multiple: false });
      if (!contacts || contacts.length === 0) return;

      this.applyContactToCustomer(contacts[0]);
      this.ux.show_toast('Contact imported — review fields then save', 'Success');
    } catch (err: any) {
      const name = err?.name as string | undefined;
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
    const patch = this.contactPicker.toCustomerPatch(contact);

    if (patch.fullName) this.customer.Name = patch.fullName;
    else if (patch.name) this.customer.Name = patch.name;
    if (patch.surname) this.customer.Surname = patch.surname;
    if (patch.phone) this.customer.PhoneNumber = patch.phone;
    if (patch.email) this.customer.Email = patch.email;

    if (patch.addressLineHome) this.customer.AddressLineHome = patch.addressLineHome;
    if (patch.addressLine2) this.customer.AddressLine2 = patch.addressLine2;
    if (patch.city) this.customer.City = patch.city;
    if (patch.postalCode) this.customer.PostalCode = patch.postalCode;
    if (patch.region && !this.customer.City) this.customer.City = patch.region;

    if (patch.iconBlob) {
      void this.handleContactIcon(patch.iconBlob);
    }
  }

  private async handleContactIcon(blob: Blob): Promise<void> {
    try {
      const dataUrl = await this.contactPicker.blobToDataUrl(blob);
      this.customer.Dp = dataUrl;

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
          const filename = typeof res === 'string' ? res : res?.filename || res?.file || '';
          if (filename && typeof filename === 'string' && filename.length > 5) {
            this.customer.Dp = `${this.uploadService.url}/upload/${filename}`;
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
}
