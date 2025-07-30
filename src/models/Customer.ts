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
