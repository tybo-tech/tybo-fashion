// export interface IDiscount {
//   id: number;
//   name: string;
//   description: string;
//   discountValue: number;
//   discountValueType: 'Percentage' | 'Amount';
//   discountType: DiscountType;
//   method: 'Discount Code' | 'Automatic';
//   startDate: string;
//   startTime: string;
//   endDate: string;
//   endTime: string;
// }

export const discountMethods = ['Discount Code', 'Automatic'];
export const discountValueTypes = ['Percentage', 'Amount'];
//discountType
export type DiscountType =
  | ''
  | 'amountOffProducts'
  | 'amountOffOrder'
  | 'buyXGetYFree'
  | 'shippingDiscount';

export const discountTypesOptions: ISelectDiscountType[] = [
  {
    value: 'amountOffProducts',
    label: 'Amount off products',
    type: 'Product discount',
    className: '',
  },
  {
    value: 'amountOffOrder',
    label: 'Amount off order',
    type: 'Order discount',
    className: '',
  },
  {
    value: 'buyXGetYFree',
    label: 'Buy X get Y free',
    type: 'Product discount',
    className: '',
  },
  {
    value: 'shippingDiscount',
    label: 'Shipping discount',
    type: 'Shipping discount',
    className: '',
  },
];

export const discountTypesOptionMap = {
  amountOffOrder : 'Amount off order',
  amountOffProducts : 'Amount off products',
  buyXGetYFree : 'Buy X get Y free',
  shippingDiscount : 'Shipping discount'
}

// export function initDiscount(): IDiscount {
//   return {
//     id: 0,
//     name: '',
//     description: '',
//     method: 'Automatic',
//     discountValueType: 'Percentage',
//     discountValue: 0,
//     discountType: '',
//     startDate: new Date().toISOString(),
//     endDate: new Date().toISOString(),
//     startTime: '00:00',
//     endTime: '23:59',
//   };
// }

export interface ISelectDiscountType {
  value: string;
  label: string;
  type: string;
  className: string;
}
