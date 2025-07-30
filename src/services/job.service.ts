import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Job } from 'src/models/job.model';
import { JobCard, JobItem } from 'src/models/job-item.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from 'src/models/Product';
import { getId } from 'src/constants/Constants';
import { UserService } from './user.service';
import { initCustomerFromUser } from 'src/models/Customer';
import { IResonse } from 'src/models/response';
import { UxService } from './ux.service';
import { IMeasurement } from 'src/models/measurement.model';
import { Company } from 'src/models/Company';
import { UX_MODALS } from 'src/models/ux.model';
import { OtherInfo } from 'src/models/other-info.model';
import { Discount, DiscountService } from './discounts.service';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  url: string;
  private jobBs = new BehaviorSubject<Job | null>(null);
  $job = this.jobBs.asObservable();

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private discountService: DiscountService,
    private uxService: UxService
  ) {
    this.url = environment.api;
    const job = this.get_job_state();
    if (job) {
      this.jobBs.next(job);
    }
  }

  update_job_state(job: Job) {
    this.jobBs.next(job);
    localStorage.setItem('current__job', JSON.stringify(job));
  }
  clear_order_state() {
    this.jobBs.next(null);
    localStorage.removeItem('current__job');
  }
  get_job_state(): Job | null {
    const data = localStorage.getItem('current__job');
    if (data) {
      const job: Job = JSON.parse(data);
      return job;
    }
    return null;
  }
  add(job: Job) {
    return this.http.post<Job>(`${this.url}/job/add-job.php`, job);
  }
  count(companyId: string) {
    return this.http.get<any>(
      `${this.url}/job/count.php?CompanyId=${companyId}`
    );
  }
  getJobItemsByUser(userId: string) {
    return this.http.get<JobItem[]>(
      `${this.url}/job-item/get-job-item-by-user.php?Id=${userId}`
    );
  }
  getJobItemsByStatus(userId: number) {
    return this.http.get<JobCard[]>(
      `${this.url}/job-item/get-job-item-by-status.php?Id=${userId}`
    );
  }
  //get-discount-code
  // $company_id =  $_GET['CompanyId'];
  // $code =  $_GET['Code'];

  error = '';
  fetchDiscountCode(code: string) {
    this.error = '';
    const job = this.get_job_state();
    if (!job || !job.CompanyId) return;
    this.discountService.getByCode(job.CompanyId || '', code).subscribe((res) => {
      if (res &&  job && job.Metadata) {
        const discount = res;

        job.Metadata.discount = { ...discount};
        this.update_cart(job);
        this.error = '';
      } else {
        this.error = 'Invalid discount code';
      }
    });
  }
  place_order(job: Job) {
    const user = this.userService.getUser;
    if (user && user.UserId) {
      const customer = initCustomerFromUser(user, job.CompanyId);
      job.Customer = customer;
      job.CreateUserId = user.UserId;
      job.JobType = 'Online Shop';
      job.JobItems?.map((x) => (x.CreateUserId = user.UserId));
    }
    return this.http
      .post<IResonse<Job>>(`${this.url}/job/place-order.php`, job)
      .subscribe((placed) => {
        if (placed && placed.data?.JobNo) {
          console.log('Order placed', placed);
          this.uxService.show_toast('Order placed successfully', 'success');
          this.clear_order_state();
          // this.router.navigate(['/home/my-profile']);
          location.href = `/home/order-successful/${placed.data.JobId}`;
          this.uxService.show_modal(UX_MODALS.profile_order, placed.data.JobId);
        }
      });
  }
  update(job: Job) {
    return this.http.post<Job>(`${this.url}/job/update-job.php`, job);
  }
  getJobs(companyId: string, key = 'CompanyId') {
    return this.http.get<Job[]>(
      `${this.url}/job/get-jobs.php?${key}=${companyId}`
    );
  }

  getjob(jobId: string) {
    return this.http.get<Job>(`${this.url}/job/get-job.php?JobId=${jobId}`);
  }

  addJobItem(jobItem: JobItem) {
    return this.http.post<JobItem>(
      `${this.url}/job-item/add-job-item.php`,
      jobItem
    );
  }
  updateJobItem(jobItem: JobItem) {
    return this.http.post<JobItem>(
      `${this.url}/job-item/update-job-item.php`,
      jobItem
    );
  }
  deleteJobItem(jobItemId: string) {
    return this.http.get<JobItem>(
      `${this.url}/job-item/delete-job-item.php?JobItemId=${jobItemId}`
    );
  }
  getJobItems(jobId: string) {
    return this.http.get<JobItem[]>(
      `${this.url}/job-item/get-job-items.php?JobId=${jobId}`
    );
  }
  getJobItemById(jobItemId: string) {
    return this.http.get<JobItem>(
      `${this.url}/job-item/get-job-item.php?JobItemId=${jobItemId}`
    );
  }

  getjobSync(jobId: string) {
    return this.http.get<Job>(`${this.url}/job/get-job.php?JobId=${jobId}`);
  }
  getJobWorksSync(jobId: string) {
    return this.http.get<Job>(
      `${this.url}/job/get-job-work.php?JobId=${jobId}`
    );
  }

  // Cart and orders in Tybo Fashion are jobs
  // And from job we can create invoice
  // Where job items are derived from product
  add_to_cart(
    company: Company,
    product: Product,
    size: string,
    quantity: number,
    measurements: IMeasurement[] = []
  ) {
    let job = this.get_job_state();

    if (!job) {
      job = this.initJob(product.CompanyId, 'online-shop');
      job.JobType = 'Online Shop';
    }

    let jobItem = this.findJobItem(job, product, size);
    if (jobItem) {
      jobItem.Quantity += quantity;
    } else {
      jobItem = this.createJobItem(product, size, quantity);
      jobItem.Metadata.Measurements = measurements;
      job.JobItems = job.JobItems || [];
      job.JobItems.push(jobItem);
    }
    if (company.Metadata?.ProccessingDays)
      job.DueDate = this.delivery_date(+company.Metadata.ProccessingDays);
    job.TotalCost = this.cart_total(job);
    this.update_job_state(job);
  }
  private delivery_date(numberOfDays: number) {
    //Add 7 days to the job created date
    const date = new Date();
    date.setDate(date.getDate() + numberOfDays);
    return date;
  }
  private findJobItem(
    job: Job,
    product: Product,
    size: string
  ): JobItem | undefined {
    return job.JobItems?.find(
      (item) =>
        item.ItemName === product.Name &&
        item.Size === size &&
        item.ItemType === product.Id
    );
  }

  private createJobItem(
    product: Product,
    size: string,
    quantity: number
  ): JobItem {
    const jobItem = this.initJobItem(
      product.Id,
      product.CompanyId,
      'online-shop'
    );
    jobItem.Metadata.ProductId = product.Id;
    jobItem.ItemName = product.Name;
    jobItem.Size = size;
    jobItem.JobItemId = getId('job-item');
    jobItem.ItemType = product.Id;
    jobItem.UnitPrice = product.RegularPrice;
    jobItem.FeaturedImageUrl = product.FeaturedImageUrl;
    jobItem.Quantity = quantity;
    jobItem.SubTotal = (product.RegularPrice * quantity).toFixed(2);
    return jobItem;
  }

  initJobItem(jobId: string, companyId: string, userId: string): JobItem {
    return {
      JobItemId: '',
      JobId: jobId,
      CompanyId: companyId,
      FeaturedImageUrl: '',
      Size: '',
      Colour: '',
      ItemName: '',
      Measurements: [],
      ItemType: '',
      UnitPrice: 0,
      SalePrice: 0,
      Quantity: 1,
      SubTotal: '',
      CreateUserId: userId,
      ModifyUserId: userId,
      StatusId: 1,
      Metadata: { ProductId: '' },
    };
  }

  initJob(companyId: string, userId: string): Job {
    return {
      JobId: '',
      CompanyId: companyId,
      CustomerId: '',
      CustomerName: '',
      JobNo: '',
      Tittle: '',
      Description: '',
      JobType: JOB_TYPE_INTERNAL,
      TotalCost: 0,
      TotalDays: 0,
      CountOrders: 0,
      StartDate: '',
      DueDate: '',
      Status: 'Not started',
      Class: 'not-started',
      CreateUserId: userId,
      ModifyUserId: userId,
      StatusId: 1,
      Tasks: [],
      Customer: undefined,
      Shipping: '',
      ShippingPrice: 0,
      Metadata: { Source: 'Online Shop', InvoiceNo: '' },
    };
  }

  delete_from_cart(job: Job, jobItem: JobItem) {
    if (!job) return;
    job.JobItems = job.JobItems?.filter(
      (item) => item.JobItemId !== jobItem.JobItemId
    );
    if (!job.JobItems?.length) {
      job.Metadata = {
        InvoiceNo: '',
        Source: 'Online Shop',
        amountAfterDiscount: 0,
      };
      job.TotalCost = 0;
      this.update_job_state(job);
      this.clear_order_state();
      return;
    }
    job.TotalCost = this.cart_total(job);
    job.Metadata.paidAmount = this.calculatePaidAmount(job);
    job.Metadata.dueAmount = this.calculateDueAmount(job);
    this.update_job_state(job);
  }
  update_qty(job: Job, qty: number, item: JobItem) {
    if (!job) return;
    item.Quantity = qty;
    item.SubTotal = (item.UnitPrice * qty).toFixed(2);
    job.TotalCost = this.cart_total(job);
    this.update_job_state(job);
  }

  update_delivery(job: Job | undefined, shipping: string, fee: number) {
    if (!job) return;
    job.Shipping = shipping;
    job.ShippingPrice = fee;
    job.TotalCost = this.cart_total(job);
    job.Metadata.dueToday = this.dueAmount(job);
    this.update_job_state(job);
  }
  dueAmount(job: Job): number {
    const isDeposit = job.PaymentAmount === 'deposit';
    if (isDeposit) return job.TotalCost / 2;
    return job.TotalCost;
  }
  update_cart(job: Job) {
    if (!job) return;
    job.TotalCost = this.cart_total(job);
    this.update_job_state(job);
  }

  cart_count(job: Job) {
    if (!job) return 0;
    let sum = 0;
    job.JobItems?.forEach((item) => {
      sum += item.Quantity;
    });
    return sum || 0;
  }

  cart_total(job: Job) {
    if (!job) return 0;
    let sum = Number(job.ShippingPrice) || 0;
    let itemsSubTotal = 0;
    job.JobItems?.forEach((item) => {
      item.SubTotal = (Number(item.UnitPrice) * Number(item.Quantity)).toFixed(
        2
      );
      itemsSubTotal += parseFloat(item.SubTotal);
    });

    // Apply discount

    sum += this.applyDiscount(job, itemsSubTotal);
    return sum || 0;
  }

  // Make sure we onpy apply discount to cart items not delivery fees
  applyDiscount(job: Job, itemsSubTotal: number): number {
    let total = itemsSubTotal;
    const discount: Discount | undefined = job.Metadata?.discount;
    // Make sure discount is not applied twice
    // if (!discount || job.Metadata.hasDiscount) return total;
    if (!discount) return total;
    console.log('Applying discount', discount);

    if (
      discount.DiscountType === 'amountOffOrder' &&
      discount.DiscountValueType === 'Percentage'
    ) {
      const discountPercentage = discount.DiscountValue / 100;

      // Discount Big Three
      job.Metadata.discountAmount = total * discountPercentage;
      job.Metadata.amountBeforeDiscount = total;
      job.Metadata.amountAfterDiscount = total - total * discountPercentage;
      job.Metadata.hasDiscount = true;
      return job.Metadata.amountAfterDiscount;
    }
    return total;
  }
  calculatePaidAmount(job: Job): number {
    if (!job || !job.Metadata?.payments) return 0;
    let sum = 0;
    job.Metadata.payments.forEach((payment) => {
      sum += payment.Amount || 0;
    });
    return sum;
  }
  calculateDueAmount(job: Job): number {
    return job.TotalCost - this.calculatePaidAmount(job);
  }
  check_total(job: Job) {
    const total = this.cart_total(job);
    if (Number(job.TotalCost) !== total) {
      job.TotalCost = total;
      this.update(job).subscribe();
    }
    const paid = this.calculatePaidAmount(job);
    if (Number(job.Metadata.paidAmount) !== paid) {
      job.Metadata.paidAmount = paid;
      this.update(job).subscribe();
    }

    const due = this.calculateDueAmount(job);
    if (Number(job.Metadata.dueAmount) !== due) {
      job.Metadata.dueAmount = due;
      this.update(job).subscribe();
    }
  }
}
export const JOB_TYPE_INTERNAL = 'Internal';
