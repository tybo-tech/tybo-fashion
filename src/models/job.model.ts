import { Discount } from 'src/services/discounts.service';
import { Company } from './Company';
import { Customer } from './Customer';
import { Order } from './Order';
import { IComment } from './comment.model';
import { JobItem } from './job-item.model';

export interface JobInstruction {
  Details: string;
  DateTime: string;
  Id: string;
}
export interface JobMetadata {
  Source: string;
  InvoiceNo: string;
  paymentProof?: string;
  paymentRef?: string;
  paidAmount?: number;
  dueAmount?: number;
  dueToday?: number;
  selectedPaymentAmountName?: string;
  isOnlinePaymentComplete?: boolean;
  payments?: { Amount?: number; Date: string; Type: 'Manual' | 'Online' }[];
  Special_instructions?: IComment[];
  // Promo codes
  discount?: Discount;
  discountAmount?: number;
  amountBeforeDiscount?: number;
  amountAfterDiscount?: number;
  hasDiscount?: boolean;
}
export interface Job {
  ShippingPrice: number;
  Shipping: string;
  JobId: string;
  CompanyId: string;
  CustomerId: string;
  CustomerName: string;
  JobNo: string;
  Tittle: string;
  JobType: string;
  Description: string;
  TotalCost: number;
  TotalDays: 0;
  StartDate?: any;
  DueDate?: any;
  Status: string;
  Class: string;
  OrderId?: string;
  CreateDate?: string;
  CreateUserId: string;
  ModifyDate?: string;
  ModifyUserId: string;
  StatusId: number;
  CountOrders: number;
  Customer?: Customer;
  Company?: Company;
  Tasks?: any[];
  JobItems?: JobItem[];
  //Orders?: Order[];
  Order?: Order;
  Metadata: JobMetadata;

  PaymentMethod?: string;
  PaymentAmount?: string;

  deliveryDate?: Date;
  images?: string[];
}
