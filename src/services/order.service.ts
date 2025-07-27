import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order, initOrder } from 'src/models/Order';
import { Constants } from 'src/constants/Constants';
import { Product } from 'src/models/Product';
import { initOrderproduct } from 'src/models/Orderproduct';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  invoiceUrl = 'docs/48f1/invoice.php';
  url: string;
  private ORDERBS: BehaviorSubject<Order>;
  public $order: Observable<Order>;
  constructor(private http: HttpClient) {
    this.url = environment.api;
    let order: Order = initOrder();
    const local = localStorage.getItem(Constants.LocalOrder);
    if (local) {
      const o: Order = JSON.parse(local);
      if (o.OrdersId) order = o;
    }
    this.ORDERBS = new BehaviorSubject<Order>(order);
    this.$order = this.ORDERBS.asObservable();
  }
  save(data: any): Observable<Order> {
    return this.http.post<Order>(`${this.url}/order/save.php`, data);
  }
  update(data: any): Observable<Order> {
    return this.http.post<Order>(`${this.url}/order/update.php`, data);
  }

  getInvoiceURL(orderId: string) {
    return `${this.url}/${this.invoiceUrl}?guid=${orderId}`;
  }
  download(url: string, filename: string) {
    this.http.get<Blob>(url,{responseType: 'blob' as 'json'}).subscribe((response) => {
      console.log(response);
      let dataType = response.type;
      let binaryData = [];
      binaryData.push(response);
      let downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
      if (filename)
          downloadLink.setAttribute('download', filename);
      document.body.appendChild(downloadLink);
      downloadLink.click();
    });
  }
  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(
      `${this.url}/order/get.php?OrdersId=${orderId}`
    );
  }
  pay(data: any): Observable<any> {
    return this.http.post<any>(
      `https://www.payfast.co.za/onsite/​process`,
      data
    );
  }
  getOrders(companyId: string, status: string) {
    return this.http.get<Order[]>(
      `${this.url}/order/list.php?CompanyId=${companyId}&StatusId=${status}`
    );
  }
  getOrdersForUser(userId: string) {
    return this.http.get<Order[]>(
      `${this.url}/order/list-for-user.php?UserId=${userId}`
    );
  }
  updateState(order: Order) {
    this.ORDERBS.next(order);
    localStorage.setItem(Constants.LocalOrder, JSON.stringify(order));
  }
  clearState() {
    this.ORDERBS.next(initOrder());
    localStorage.removeItem(Constants.LocalOrder);
  }
  addToCart(product: Product) {
    const order = this.ORDERBS.value;
    if (!order) return;
    if (!order.Orderproducts) order.Orderproducts = [];
    if (!order.CompanyId) order.CompanyId = product.CompanyId;
    order.Orderproducts.push(initOrderproduct(product));
    this.calculateTotal(order);
    return order;
  }
  calculateTotal(order: Order) {
    order.Total = 0;
    order.ItemsTotal = 0;
    order.CartCout = 0;
    order.Orderproducts.filter((x) => x.StatusId !== 99).forEach((product) => {
      product.SubTotal = Number(product.UnitPrice) * Number(product.Quantity);
      order.ItemsTotal += Number(product.SubTotal);
      order.CartCout += Number(product.Quantity);
    });
    order.Total += Number(order.ShippingPrice);
    order.Total += Number(order.ItemsTotal);

    order.Paid = 0;
    if (order.Metadata?.Payments?.length) {
      order.Metadata.Payments.forEach((p) => {
        if (order && p.Status === Constants.PaymentStatus.Paid) {
          order.Paid += Number(p.Amount);
        }
      });
    }
    order.Due = order.Total - order.Paid;
    return order;
  }
}
