import { Company } from './Company';
import { Product } from './Product';
import { Job } from './job.model';
import { IMeasurement } from './measurement.model';

export interface UserShift {
  Type: string;
  ShiftId: string;
  UserId: string;
  ShiftDate: string;
  StartTime: string;
  EndTime: string;
  CreateDate: string;
  CreateUserId: string;
  Status: string;
  Notes: string;
  Price: number;
  TotalPrice: number;
}
export interface User {
  UserId: string;
  CompanyId: string;
  ParentCompanyId: string;
  UserType: string;
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
  ReferralCode: string;
  ParentReferralCode: string;
  Company?: Company;
  Measurements: IMeasurement[];
  Favorites?: Product[];
  Metadata: UserMetadata;
  BuildingType: string;
  Suburb: string;
  City: string;
  PostalCode: string;
  CompanyName: string;
  AddressLine2: string;
  SaveMyDetails: string;
}


export interface UserMetadata {
  RatePerDay: number;
  RatePerNight: number;
  Source: string;
  DraftOrder?: Job;
  UserShifts?: UserShift[];
  DraftOrderId?: string;
  Favorites: string[];
}

export function initUserMetadata() {
  return {
    RatePerDay: 0,
    RatePerNight: 0,
    Source: 'User',
    DraftOrder: undefined,
    UserShifts: [],
    DraftOrderId: '',
    Favorites: [],
  };
}
export function initUser(userType: string) {
  const user: User = {
    UserId: '',
    Name: '',
    Email: '',
    PhoneNumber: '',
    Password: '',
    AddressLineHome: '',
    City: '',
    PostalCode: '',
    Measurements: [],
    AddressLine2: '',
    BuildingType: '',
    CompanyName: '',
    SaveMyDetails: 'Yes',
    Suburb: '',
    AddressLineWork: '',
    AddressUrlHome: '',
    AddressUrlWork: '',
    CompanyId: '',
    CreateDate: '',
    CreateUserId: '',
    Dp: '',
    ModifyDate: '',
    ModifyUserId: '',
    ParentCompanyId: '',
    ParentReferralCode: '',
    ReferralCode: '',
    StatusId: 1,
    Surname: '',
    UserToken: '',
    UserType: userType,
    Metadata: initUserMetadata(),
  };
  return user;
}

export function initUserShift(): UserShift {
  const date = new Date();
  //2024-07-08 11:55:18
  const formted = new Date().toISOString().substring(0, 10);
  return {
    ShiftId: '',
    UserId: '',
    ShiftDate: formted,
    Type: 'Day',
    StartTime: '09:00',
    EndTime: '17:00',
    CreateDate: `${new Date()}`,
    CreateUserId: '',
    Status: '',
    Price: 0,
    TotalPrice: 0,
    Notes: '',
  };
}

