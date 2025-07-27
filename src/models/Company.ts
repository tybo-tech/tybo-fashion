import { Category } from 'src/services/category.service';
import { ICollection } from './Category';
import { Product } from './Product';
import { OtherInfo } from './other-info.model';

export interface CompanyMetadata {
  Slides: { Image: string; Link: string; Type: string }[]; // Type can be 'Product' or 'Category'
  Facebook: string;
  Twitter: string;
  TikTok?: string;
  Instagram: string;
  AboutTitle: string;
  About: string;
  AboutImage: string;
  Testimonials: Testimonial[];
  Stat: { Name: string; Count: string; Units: string }[];
  //Order
  ProccessingDays?: string;
  InvoiceNotes?: string[];
  InvoiceAnnouncement?: string;

  // Home page
  HomePageTitle?: string;
  HomePageDescription?: string;
  HomePageImage?: string;

  WebLogo?: string;
}
export interface Testimonial {
  Name: string;
  ImageUrl: string;
  Testimonial: string;
}
export interface Company {
  Metadata?: CompanyMetadata;
  CompanyId: string;
  ParentCompanyId: string;
  Name: string;
  Slug: string;
  Description: string;
  ShowOnline: any;
  CompanyType: string;
  Dp: string;
  Background: string;
  Color: any;
  Phone: string;
  Email: string;
  Location: any;

  AddressLine: string;
  AddressLine2: string;
  City: string;
  PostalCode: string;

  BankName: string;
  BankAccNo: string;
  BankAccHolder: string;
  BankBranch: string;

  IsDeleted: string;
  CreateDate: string;
  CreateUserId: string;
  ModifyDate: string;
  ModifyUserId: string;
  StatusId: string;
  Products?: Product[];
  Categories?: Category[];
  Styles?: OtherInfo<ICollection>[];
  PinnedProducts?: Product[];
  RecentProducts?: Product[];
  whatsappLink?: string;

  // Ux properties
  InfoList?: OtherInfo<any>[];
  Info?: OtherInfo<any>;
}

export interface ICounts {
  ProductCount: number;
  CustomerCount: number;
  UserCount: number;
  JobCount: number;
  JobItemCount: number;
  CategoryCount: number;
  CollectionCount: number;
}
