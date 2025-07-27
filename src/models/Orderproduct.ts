import { Product } from './Product';
import { JobItem } from './job-item.model';
import { IMeasurement } from './measurement.model';

export interface Orderproduct {
  Id: string;
  OrderId: string;
  ProductId: string;
  CompanyId: string;
  FeaturedImageUrl: any;
  CustomerId: string;
  Size: string;
  Colour: string;
  ColorCode: string;
  ProductName: string;
  ProductType: string;
  UnitPrice: number;
  Quantity: number;
  SubTotal: number;
  CreateDate: string;
  CreateUserId: string;
  ModifyDate: string;
  ModifyUserId: string;
  StatusId: number;
  Measurements: IMeasurement[];
}

export const initOrderproduct = (product: Product): Orderproduct => {
  return {
    Id: '',
    OrderId: '',
    ProductId: product.ProductId,
    CompanyId: '',
    CustomerId: '',
    FeaturedImageUrl: product.FeaturedImageUrl,
    Size: product.SelectedSize || '',
    Colour: '',
    ColorCode: '',
    ProductName: product.Name,
    ProductType: product.ProductType,
    UnitPrice: product.RegularPrice,
    Measurements:  [],
    Quantity: product.SelectedQuantity || 1,
    SubTotal:
      Number(product.RegularPrice) * Number(product.SelectedQuantity || 1),
    CreateDate: '',
    CreateUserId: '',
    ModifyDate: '',
    ModifyUserId: '',
    StatusId: 1,
  };
};

export const initOrderproductFromJobItem = (product: JobItem): Orderproduct => {
  return {
    Id: '',
    OrderId: '',
    ProductId: product.JobItemId,
    ColorCode: '',
    CompanyId: '',
    FeaturedImageUrl: product.FeaturedImageUrl,
    Size: product.Size,
    Colour: product.Colour,
    ProductName: product.ItemName,
    ProductType: 'Job Item',
    UnitPrice: product.UnitPrice,
    Quantity: product.Quantity,
    SubTotal: Number(product.UnitPrice) * Number(product.Quantity || 1),
    CreateDate: '',
    CreateUserId: '',
    CustomerId: '',
    ModifyDate: '',
    ModifyUserId: '',
    StatusId: 1,
    Measurements: [],
  };
};
