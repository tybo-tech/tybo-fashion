import { Category } from 'src/services/category.service';
import { Company } from './Company';
import { Image } from './Image';
import { ProductCombination } from './ProductCombination';
import { Variation } from 'src/services/variation.service';

export interface Product {
  Checked?: boolean;
  Id: string;
  ProductId: string;
  Slug: string;
  CompanyId: string;
  ParentCompanyId: string;
  Name: string;
  RegularPrice: any;
  OldPrice?: any;
  PriceFrom: any;
  PriceTo: any;
  TotalStock: any;
  Description: string;
  Code: string;
  PickId: any;
  ReturnPolicy: string;
  ProductSlug: string;
  FeaturedImageUrl: string;
  IsJustInTime: string;
  IsFeatured: 'Yes' | 'No';
  ShowOnline: string;
  StockType: string;
  EstimatedDeliveryDays: number;
  ShowRemainingItems: number;
  OrderLimit: number;
  SupplierId: string;
  ProductType: string;
  ProductStatus: string;
  CreateDate: string;
  CreateUserId: string;
  ModifyDate: string;
  ModifyUserId: string;
  StatusId: number;
  Images: string[];
  Image?: Image;
  Company?: Company;
  SelectedQuantity?: number;
  SelectedSize?: string;
  SelectedColor?: string;
  Metadata?: any;
  RelatedProducts?: Product[];
  Categories? : Category[]
  Variations? : Variation[]
  ProductVariationPayload?: ProductVariationPayload[];

  // The following were removed from DB so we keep only if needed for compatibility/migration
  // ColorCode: string;
  // ColorName: string;
  // Sizes: string[];
  // Categories: string[];
  // Collections?: string[];
  // Measurements: string[];
  // SelectMeasurements: IMeasurement[];
  // AllowMeasurements: 'Yes' | 'No';
  // VariationId?: string;
}


export interface ProductVariationPayload {
  VariationId: number;
  OptionIds: number[];
}
