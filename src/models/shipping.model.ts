export interface Shipping {
  ShippingId: string;
  CompanyId: string;
  Name: string;
  Description: string;
  Price: number;
  ImageUrl: string;
  CreateDate?: string;
  CreateUserId?: string;
  ModifyDate?: string;
  ModifyUserId?: string;
  StatusId: number;
  Selected: boolean;
}


export const customShipping: Shipping = {
  ShippingId: 'Custom',
  CompanyId: '',
  Name: 'Custom',
  Description: '',
  Price: 0,
  ImageUrl: '',
  StatusId: 1,
  Selected: false,
};

export const systemShippings: Shipping[] = [
  {
    ShippingId: 'courier',
    CompanyId: '',
    Name: 'Courier',
    Description: '',
    Price: 100,
    ImageUrl: '',
    StatusId: 1,
    Selected: false,
  },
  {
    ShippingId: '',
    CompanyId: '',
    Name: 'Paxi,7 to 9 days',
    Description: '',
    Price: 59.95,
    ImageUrl: '',
    StatusId: 1,
    Selected: false,
  },
  {
    ShippingId: '',
    CompanyId: '',
    Name: 'Paxi,3 to 5 days',
    Description: '',
    Price: 100,
    ImageUrl: '',
    StatusId: 1,
    Selected: false,
  },
  {
    ShippingId: 'Free',
    CompanyId: '',
    Name: 'Free',
    Description: '',
    Price: 0,
    ImageUrl: '',
    StatusId: 1,
    Selected: false,
  },
  {
    ShippingId: 'Collection',
    CompanyId: '',
    Name: 'Collection',
    Description: '',
    Price: 0,
    ImageUrl: '',
    StatusId: 1,
    Selected: false,
  },
  customShipping,
];
