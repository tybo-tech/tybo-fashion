import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  Customer,
  CustomerDetailResponse,
  CustomersPageResponse,
} from 'src/models/Customer';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  url: string;
  constructor(private http: HttpClient) {
    this.url = environment.api;
  }
  save(data: any): Observable<Customer> {
    return this.http.post<Customer>(`${this.url}/customer/save.php`, data);
  }
  getCustomers(CompanyId : string, CustomerType = 'Customer'): Observable<Customer[]> {
    return this.http.get<Customer[]>(
      `${this.url}/customer/list.php?CustomerType=${CustomerType}&CompanyId=${CompanyId}`
    );
  }

  /**
   * One lean, server-paginated page of admin customers from
   * /customer/get-admin-customers.php (Sprint 2). Optional parameters are
   * omitted from the request when empty. getCustomers() above remains
   * untouched for the New Job embedded picker and rollback.
   */
  getAdminCustomersPage(
    companyId: string,
    page = 1,
    pageSize = 20,
    q = ''
  ): Observable<CustomersPageResponse> {
    let params = new HttpParams()
      .set('CompanyId', companyId)
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    if (q && q.trim()) params = params.set('q', q.trim());
    return this.http.get<CustomersPageResponse>(
      `${this.url}/customer/get-admin-customers.php`,
      { params }
    );
  }
  getCustomersByUser(userId: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(
      `${this.url}/customer/list-for-user.php?UserId=${userId}`
    );
  }
  getCustomer(customerId: string): Observable<Customer> {
    return this.http.get<Customer>(
      `${this.url}/customer/get.php?CustomerId=${customerId}`
    );
  }

  /**
   * Focused admin customer detail from /customer/get-admin-customer-detail.php
   * (Sprint 3). Scoped by both CompanyId and CustomerId. Returns the editable
   * customer fields plus only the analytics the detail page renders. The
   * legacy getCustomer()/get.php above remains untouched for rollback.
   */
  getAdminCustomerDetail(
    companyId: string,
    customerId: string
  ): Observable<CustomerDetailResponse> {
    return this.http.get<CustomerDetailResponse>(
      `${this.url}/customer/get-admin-customer-detail.php`,
      {
        params: new HttpParams()
          .set('CompanyId', companyId)
          .set('CustomerId', customerId),
      }
    );
  }
  checkIfCustomerExist(email: string,companyId:string): Observable<Customer> {
    return this.http.get<Customer>(
      `${this.url}/customer/get-by-email.php?Email=${email}&CompanyId=${companyId}`
    );
  }
}
