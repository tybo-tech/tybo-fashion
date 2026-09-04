import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Contact Picker API — typed wrapper
 * Spec: https://w3c.github.io/contact-picker/
 * MDN: https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API
 *
 * Browser support (2026): Chrome/Edge on Android (and ChromeOS) only.
 * Requires secure context (HTTPS), user gesture, and transient activation.
 * No persistent permission — user must pick each time.
 */

export type ContactProperty = 'name' | 'email' | 'tel' | 'address' | 'icon';

export interface ContactAddress {
  addressLine?: string[];
  city?: string;
  country?: string;
  dependentLocality?: string;
  organization?: string;
  phone?: string;
  postalCode?: string;
  recipient?: string;
  region?: string;
  sortingCode?: string;
  toJSON?(): Record<string, unknown>;
}

export interface ContactInfo {
  name?: string[];
  email?: string[];
  tel?: string[];
  address?: ContactAddress[];
  icon?: Blob[];
}

export interface ContactsManager {
  getProperties(): Promise<ContactProperty[]>;
  select(
    properties: ContactProperty[],
    options?: { multiple?: boolean }
  ): Promise<ContactInfo[]>;
}

// Augment Navigator for TS — safe even if lib.dom already defines it partially
declare global {
  interface Navigator {
    contacts?: ContactsManager;
  }
}

@Injectable({
  providedIn: 'root',
})
export class ContactPickerService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /** True only in a browser with the API exposed. */
  isSupported(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    if (typeof navigator === 'undefined') return false;
    // MDN recommends checking both
    return 'contacts' in navigator && 'ContactsManager' in window;
  }

  /** Secure contexts only — required by spec. localhost is considered secure by browsers. */
  isSecureContext(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return typeof window !== 'undefined' && window.isSecureContext === true;
  }

  /** Full readiness check (support + secure context). */
  isAvailable(): boolean {
    return this.isSupported() && this.isSecureContext();
  }

  /** Which properties the current UA / device actually exposes (name, email, tel, address, icon). */
  async getSupportedProperties(): Promise<ContactProperty[]> {
    if (!this.isSupported() || !navigator.contacts) return [];
    try {
      const props = await navigator.contacts.getProperties();
      return props as ContactProperty[];
    } catch {
      return [];
    }
  }

  /**
   * Opens the system contact picker. Must be called from a user gesture (click/tap).
   * @param properties - subset of ContactProperty you need
   * @param options - { multiple: true } to let user pick many
   * @returns array of contacts (empty if user cancelled — some UAs resolve [] , others throw)
   * @throws DOMException (NotAllowedError, InvalidStateError, SecurityError, NotSupportedError, AbortError)
   */
  async select(
    properties: ContactProperty[],
    options: { multiple?: boolean } = { multiple: false }
  ): Promise<ContactInfo[]> {
    if (!this.isSupported() || !navigator.contacts) {
      throw new DOMException('Contact Picker API not supported', 'NotSupportedError');
    }
    if (!this.isSecureContext()) {
      throw new DOMException('Secure context required (HTTPS)', 'SecurityError');
    }
    // De-dupe + filter to known values
    const props = [...new Set(properties)] as ContactProperty[];
    return navigator.contacts.select(props, options);
  }

  /**
   * Convenience helper — maps a ContactInfo to a partial patch for Customer.
   * Does NOT mutate — caller decides what to apply.
   */
  toCustomerPatch(contact: ContactInfo): {
    fullName?: string;
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    addressLineHome?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    region?: string;
    country?: string;
    iconBlob?: Blob;
  } {
    const patch: ReturnType<ContactPickerService['toCustomerPatch']> = {};

    const fullName = contact.name?.[0]?.trim();
    if (fullName) {
      patch.fullName = fullName;
      const { firstName, lastName } = this.splitName(fullName);
      patch.name = firstName;
      patch.surname = lastName;
    }

    if (contact.email?.[0]) patch.email = contact.email[0].trim();
    if (contact.tel?.[0]) patch.phone = contact.tel[0].trim();

    const addr = contact.address?.[0];
    if (addr) {
      if (addr.addressLine?.length) {
        patch.addressLineHome = addr.addressLine[0]?.trim() || undefined;
        if (addr.addressLine.length > 1) {
          patch.addressLine2 = addr.addressLine.slice(1).join(', ').trim() || undefined;
        }
      }
      if (addr.city) patch.city = addr.city.trim();
      if (addr.postalCode) patch.postalCode = addr.postalCode.trim();
      if (addr.region) patch.region = addr.region.trim();
      if (addr.country) patch.country = addr.country.trim();
    }

    if (contact.icon?.[0]) patch.iconBlob = contact.icon[0];

    return patch;
  }

  /** Split "John Michael Doe" → { firstName: "John", lastName: "Michael Doe" } */
  private splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  }

  /** Convert Blob (e.g. contact icon) → data URL for preview / fallback storage. */
  blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
}
