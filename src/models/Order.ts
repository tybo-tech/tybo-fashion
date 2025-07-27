import { Constants, getId } from 'src/constants/Constants';
import { Company } from './Company';
import { Customer } from './Customer';
import { Orderproduct } from './Orderproduct';
import { User } from './user.model';

export interface Order {
PercentagePaid?: any;
  UserToCreate?:User;
  CustomerToCreate?:Customer;
  Classes?: string[];
  OrdersId: string;
  OrderNo: string;
  CompanyId: string;
  ParentCompanyId: any;
  CustomerId: any;
  AddressId: string;
  Notes: string;
  OrderType: string;
  Total: number;
  ItemsTotal: number;
  Paid: number;
  Due: number;
  Shipping: string;
  ShippingPrice: number;
  InvoiceDate: string;
  DueDate: string;
  EstimatedDeliveryDate: any;
  OrderSource: string;
  CreateDate: string;
  CreateUserId: string;
  ModifyDate: string;
  ModifyUserId: string;
  Status: string;
  JobId: string;
  PaymentMethod: string;
  PaymentStatus: string;
  PaymentType: string;
  FulfillmentStatus: string;
  StatusId: number;
  UserId: string;
  Customer?: Customer;
  Orderproducts: Orderproduct[];
  Company?: Company;
  CountOrders?: number;
  Metadata: OrderMetadata;
  CartCout: number;
}

export interface IPayment {
  Id: string;
  Date: string;
  Amount: any;
  Type: string;
  Method: string;
  Notes: string;
  Status: string;
  Attachment1: string;
  Attachment2: string;
  User: { Name: string; Type: string; Id: string };
}
export interface OrderMetadata {
  Payments: IPayment[];
}

export const initPayment = (): IPayment => {
  return {
    Id: getId('pay'),
    Amount: '',
    Date: `${new Date()}`,
    Notes: '',
    Method: '',
    Status: Constants.PaymentStatus.Pending,
    Type: '',
    Attachment1: '',
    Attachment2: '',
    User: { Id: '', Name: '', Type: '' },
  };
};

export const initOrder = (): Order => {
  return {
    OrdersId: '',
    OrderNo: '',
    CompanyId: '',
    ParentCompanyId: 'tybofashion.co.za',
    CustomerId: '',
    AddressId: '',
    Notes: '',
    PaymentMethod: '',
    JobId: '',
    PaymentStatus: Constants.PaymentStatus.Pending,
    UserId: '',
    OrderType: 'Invoice',
    PaymentType: Constants.PaymentTypes.Full,
    Total: 0,
    Paid: 0,
    ItemsTotal: 0,
    CartCout: 0,
    Due: 0,
    Shipping: Constants.Shippings.Collect,
    ShippingPrice: 0,
    InvoiceDate: '',
    DueDate: '',
    EstimatedDeliveryDate: '',
    OrderSource: '',
    CreateDate: '',
    CreateUserId: '',
    ModifyDate: '',
    ModifyUserId: '',
    Metadata: {
      Payments: [initPayment()],
    },
    Status: Constants.OrderStatus.Cart,
    FulfillmentStatus: '',
    StatusId: 1,
    Orderproducts: [],
  };
};
