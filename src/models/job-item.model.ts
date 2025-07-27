import { IMeasurement } from './measurement.model';

export interface JobItem {
  JobItemId: string;
  JobId: string;
  CompanyId: string;
  FeaturedImageUrl: string;
  Size: string;
  Colour: string;
  ItemName: string;
  ItemType: string;
  UnitPrice: number;
  SalePrice: number;
  Quantity: number;
  SubTotal: string;
  CreateUserId: string;
  ModifyUserId: string;
  Measurements: IMeasurement[];
  StatusId: number;
  Metadata: {
    AssignedTo?: any;
    AssignedToName?: any;
    Notes?: any;
    ProductId: string;
    Measurements?: IMeasurement[];
  };
}



export interface JobCard {
  JobId: string;
  JobNo: string;
  TotalCost: string;
  TotalDays: string;
  JobStatus: string;
  DueDate: string;
  JobItemId: string;
  ItemName: string;
  ItemType: string;
  UnitPrice: string;
  Quantity: string;
  SubTotal: string;
  AssignedToName: string;
  JobItemStatus: number;
  CustomerId: string;
  CustomerName: string;
  CustomerSurname: string;
  CustomerEmail: string;
  Measurements?: any; // Adjust the type according to your actual data
  Metadata?: any; // Adjust the type according to your actual data
}
