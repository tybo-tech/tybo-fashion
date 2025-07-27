import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Customer } from 'src/models/Customer';

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
  checkIfCustomerExist(email: string,companyId:string): Observable<Customer> {
    return this.http.get<Customer>(
      `${this.url}/customer/get-by-email.php?Email=${email}&CompanyId=${companyId}`
    );
  }
}
