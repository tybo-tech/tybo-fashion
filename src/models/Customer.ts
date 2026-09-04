import { User } from './user.model';
import { IMeasurement } from './measurement.model';

export interface UiModel {
  Selected?: boolean;
}
export interface Customer extends UiModel {
  CustomerId: string;
  CompanyId: string;
  CustomerType: string;
  Name: string;
  Surname: string;
  Email: string;
  PhoneNumber: string;
  Password: string;
  Dp: string;
  CreateDate: string;
  CreateUserId: string;
  ModifyDate: string;
  ModifyUserId: string;
  StatusId: number;
  UserToken: string;
  AddressLineHome: string;
  AddressUrlHome: string;
  AddressLineWork: string;
  AddressUrlWork: string;
  BuildingType: string;
  AddressLine2: string;
  Suburb: string;
  City: string;
  PostalCode: string;
  CompanyName: string;
  UserId: string;
  Measurements: IMeasurement[];
  Metadata: { Source: string };

  // Enhanced fields from optimized API
  TotalJobs?: number;
  CompletedJobs?: number;
  ActiveJobs?: number;
  TotalJobValue?: number;
  AverageJobValue?: number;
  TotalPaidAmount?: number;
  TotalDueAmount?: number;
  PaymentCompletionRate?: number;
  OutstandingBalance?: number;
  CustomerLifetimeValue?: number;
  CustomerStatus?: string;
  CustomerPriority?: string;
  ProfileCompleteness?: number;
  LastJobDate?: string;
  LastActivityDate?: string;
  FullName?: string;
  HasEmail?: string;
  HasPhone?: string;
  HasAddress?: string;
  HasMeasurements?: string;
  PreferredContact?: string;
  CreateDateFormatted?: string;
  LastActivityFormatted?: string;
}

/**
 * Lean customers-list row returned by /customer/get-admin-customers.php.
 * The admin Customers list renders exactly these four fields; no full
 * Customer payload is downloaded on that path. See
 * docs/2-customers-server-side-query-and-lean-list.md.
 */
export interface CustomerListItem {
  CustomerId: string;
  CustomerName: string;
  PhoneNumber: string;
  Email: string;
}

export interface CustomersPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CustomersPageResponse {
  items: CustomerListItem[];
  pagination: CustomersPagination;
}

/**
 * Focused admin customer detail returned by
 * /customer/get-admin-customer-detail.php (Sprint 3). The `customer` group
 * carries the editable fields the form round-trips; the `analytics` group is
 * the single source for the computed metrics. Analytics distinguish
 * null/missing from legitimate numeric zero (e.g. PaymentCompletionRate is
 * null when there is no job value, never a fabricated 0).
 */
export interface CustomerDetailAnalytics {
  TotalJobs: number;
  ActiveJobs: number;
  CompletedJobs: number;
  CustomerLifetimeValue: number;
  OutstandingBalance: number;
  PaymentCompletionRate: number | null;
  ProfileCompleteness: number | null;
  LastActivityDate: string | null;
}

export interface CustomerDetailResponse {
  customer: Customer;
  analytics: CustomerDetailAnalytics;
}

export function initUserDependant(): CustomerDependant {
  return {
    Id: '',
    Name: '',
    Surname: '',
    Relationship: '',
    Measurements: [],
  };
}
export interface CustomerDependant {
  Id: string;
  Name: string;
  Surname: string;
  Relationship: string;
  Measurements: IMeasurement[];
}

export const initCustomer = (CompanyId = ''): Customer => {
  return {
    CustomerId: '',
    CompanyId: CompanyId,
    CustomerType: 'Customer',
    Name: '',
    Surname: '',
    Email: '',
    PhoneNumber: '',
    Password: '',
    Dp: '',
    UserId: '',
    CreateDate: '',
    CreateUserId: '',
    ModifyDate: '',
    ModifyUserId: '',
    StatusId: 1,
    UserToken: '',
    AddressLineHome: '',
    AddressUrlHome: '',
    AddressLineWork: '',
    AddressUrlWork: '',
    AddressLine2: '',
    BuildingType: '',
    City: '',
    CompanyName: '',
    PostalCode: '',
    Suburb: '',
    Measurements: [],
    Metadata: { Source: 'Customer' },
  };
};

export function initCustomerFromUser(user: User, companyId: string) {
  const customer: Customer = {
    CustomerId: '',
    Name: user.Name,
    Email: user.Email,
    AddressLine2: user.AddressLine2,
    BuildingType: user.BuildingType,
    CompanyId: companyId,
    CompanyName: user.CompanyName,
    CreateDate: '',
    ModifyDate: '',
    Suburb: user.Suburb,
    UserToken: '',
    Selected: false,
    PhoneNumber: user.PhoneNumber,
    Password: user.Password,
    StatusId: 1,
    CustomerType: 'Customer',
    Dp: user.Dp || '',
    Measurements: user.Measurements || [],
    AddressLineHome: user.AddressLineHome,
    City: user.City,
    PostalCode: user.PostalCode,
    AddressLineWork: user.AddressLineWork,
    AddressUrlHome: user.AddressUrlHome,
    AddressUrlWork: user.AddressUrlWork,
    Surname: user.Surname,
    UserId: user.UserId,
    CreateUserId: user.UserId,
    ModifyUserId: user.UserId,
    Metadata: user.Metadata,
  };
  return customer;
}

export function updateCustomerFromUser(user: User, dbCustomer: Customer) {
  const customer: Customer = {
    CustomerId: dbCustomer.CustomerId,
    Name: user.Name,
    Email: user.Email,
    AddressLine2: user.AddressLine2,
    BuildingType: user.BuildingType,
    CompanyId: dbCustomer.CompanyId,
    CompanyName: user.CompanyName,
    CreateDate: dbCustomer.CreateDate,
    ModifyDate: dbCustomer.ModifyDate,
    Suburb: user.Suburb,
    UserToken: dbCustomer.UserToken,
    Selected: false,
    PhoneNumber: user.PhoneNumber,
    Password: user.Password,
    Measurements: [],
    StatusId: 1,
    CustomerType: 'Customer',
    Dp: user.Dp || '',
    AddressLineHome: user.AddressLineHome,
    City: user.City,
    PostalCode: user.PostalCode,
    AddressLineWork: user.AddressLineWork,
    AddressUrlHome: user.AddressUrlHome,
    AddressUrlWork: user.AddressUrlWork,
    Surname: user.Surname,
    UserId: user.UserId,
    CreateUserId: dbCustomer.UserId,
    ModifyUserId: dbCustomer.UserId,
    Metadata: user.Metadata || { Source: 'Customer' },
  };
  return customer;
}

export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  debugger;
  let num = phone.replace(/\D/g, '');

  // Check if the number is 11 digits long and starts with '27'
  if (num.length === 11 && num.startsWith('27')) {
    // Convert '27' to '0', e.g., '27795717927' => '0795717927'
    num = '0' + num.slice(2);
  }

  return num;
}
