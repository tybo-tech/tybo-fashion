import { Image, initImage } from "./Image";
import { Product } from "./Product";

export interface OtherInfo<T> {
    Id: number;
    Name: string;
    ItemType: string;
    ImageUrl: string;
    ParentId: string;
    Notes: string;
    ItemValue: T;
    Status: string;
    Decription: string;
    Rules: string;
    ItemCode: string;
    CreateDate?: string;
    Image?:Image;
    CountProducts?:number;
    Classes?:string[];
    Products?:Product[];
    Cover?:{background:string};
  }

  export interface OtherInfoSearchModel {
    Key?: string;
    ItemType: string;
    ParentId?: string;
    ProductCount?: 'Yes' | 'No';
  }
  export interface ItemValueSize {
    Name: string;
    Value: string;
    Code: string;
  }

  export function initOtherInfo<T>(type: string, parentId: string = '1',val:T): OtherInfo<T> {
    return {
      Id: 0,
      Name: '',
      ItemType: type,
      ImageUrl: '',
      ParentId: parentId,
      Notes: '',
      ItemValue: val,
      Status: '',
      Decription: '',
      Rules: '',
      ItemCode: '',
      Image: initImage()
    };
  }
  

  export const OTHER_TYPES = {
    Color: 'Color',
    Colors: 'Colors',
    Size: 'Size',
    // Sizes: 'Sizes',
    Sizes: 'SystemSizes',
    Category: 'Category',
    // Measurements: 'Measurements',
    Measurements: 'SystemMeasurement',
    Super: 'tybo-fashion',
    Discounts: 'Discounts',
    Collections: 'Collections',
    WorkGallery: 'WorkGallery',
  }