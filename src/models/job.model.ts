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

  // Enhanced fields from backend
  IsOverdue?: boolean;
  DaysRemaining?: number;
  FormattedCost?: string;
  StatusDisplay?: string;
  PaymentStatus?: string;
  PercentagePaid?: number;
}

/**
 * Lean jobs-list row returned by /job/get-admin-jobs.php.
 * The admin Jobs list renders exactly these four fields; no full Job payload
 * is downloaded on that path. See sprints/1-jobs-server-side-query.md.
 */
export interface JobListItem {
  JobId: string;
  JobNo: string;
  CustomerName: string;
  Status: string;
}

export interface JobsPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface JobsPageResponse {
  items: JobListItem[];
  pagination: JobsPagination;
}
