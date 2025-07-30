import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from 'src/models/Product';
import { getId } from 'src/constants/Constants';
import { Category } from './category.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  url: string;
  private productSub = new BehaviorSubject<Product>(this.initProduct());
  private productListSub = new BehaviorSubject<Product[]>([]);
  $products = this.productListSub.asObservable();
  $product = this.productSub.asObservable();
  constructor(private http: HttpClient) {
    this.url = environment.api;
  }
  add(data: any): Observable<Product> {
    return this.http.post<Product>(`${this.url}/products/add.php`, data);
  }

  save(product: Product) {
    return this.http.post<Product>(`${this.url}/products/save.php`, product);
  }

  //update-feature.php
  updateFeatured(product: Product) {
    return this.http.post<{ featured: boolean }>(
      `${this.url}/products/update-feature.php`,
      product
    );
  }

  // Deprecated

  /** @deprecated */

  updateRange(toUpdate: Product[]) {
    return this.http.post<Product[]>(
      `${this.url}/products/update-range.php`,
      toUpdate
    );
  }
  updateProductListState(products: Product[]) {
    this.productListSub.next(products);
  }
  updateImages(product: { ProductId: string; Images: string[] }) {
    return this.http.post<Product>(
      `${this.url}/products/update-images.php`,
      product
    );
  }
  products(companyId = '', isAdmin: boolean = false): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.url}/products/products.php?CompanyId=${companyId}&isAdmin=${isAdmin}`
    );
  }
  cleanImages() {
    return this.http.get<Product[]>(
      `https://tybofashion.co.za/api/api/utils/clean-up-images.php`
    );
  }
  getProducts(
    filter = { CompanyId: '80edddf9-6fc0-11eb-9698-12911df8ace9' }
  ): Observable<Product[]> {
    return this.http.post<Product[]>(`${this.url}/products/list.php`, filter);
  }
  featured(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.url}/products/fetured.php`);
  }
  newIn(count = 3, companyId = ''): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.url}/products/new-in.php?count=${count}&companyId=${companyId}`
    );
  }
  getProduct(productId: string, isAdmin: 'yes' | '' = ''): Observable<Product> {
    return this.http.get<Product>(
      `${this.url}/products/get.php?ProductId=${productId}&IsAdmin=${isAdmin}`
    );
  }
  deleteProduct(productId: string): Observable<Product> {
    return this.http.get<Product>(
      `${this.url}/products/delete.php?ProductId=${productId}`
    );
  }
  getByCategory(categoryId: string, limit = 100): Observable<Category> {
    return this.http.get<Category>(
      `${this.url}/products/products-by-category.php?categoryId=${categoryId}&limit=${limit}`
    );
  }

  parseString(s: string) {
    if (typeof s === 'object') return s;
    const json = JSON.parse(s);
    if (typeof json === 'string') {
      this.parseString(json);
    }
    return json;
  }

  next(p: Product) {
    this.productSub.next(p);
  }

  updateArrayValue(
    prop: 'Measurements' | 'Sizes' | 'Categories',
    companyId: string,
    oldValue: string,
    newValue: string
  ) {
    let url = `${this.url}/products/update-array-value.php?`;
    url += `prop=${prop}`;
    url += `&companyId=${companyId}`;
    url += `&oldValue=${oldValue}`;
    url += `&newValue=${newValue}`;
    return this.http.get<Product>(url);
  }

  query(value: string, prop: string, companyId: string) {
    let url = `${this.url}/products/query.php?`;
    url += `value=${value}`;
    url += `&prop=${prop}`;
    url += `&companyId=${companyId}`;
    return this.http.get<Product>(url);
  }

  initProduct(): Product {
    return {
      ProductId: getId('product'),
      CompanyId: '',
      Name: '',
      Slug: '',
      Description: '',
      Categories: [],
      ProductType: '',
      CreateDate: '',
      Code: '',
      CreateUserId: '',
      EstimatedDeliveryDays: 0,
      FeaturedImageUrl: '',
      Id: '',
      Images: [],
      IsJustInTime: 'Ready to wear',
      StockType: 'Made To Order',
      ModifyDate: '',
      ModifyUserId: '',
      IsFeatured: 'No',
      OrderLimit: 0,
      ParentCompanyId: '',
      PickId: '',
      PriceFrom: 0,
      PriceTo: 0,
      ProductSlug: '',
      ProductStatus: '',
      RegularPrice: undefined,
      ReturnPolicy: '',
      ShowOnline: '1',
      ShowRemainingItems: 0,
      StatusId: 1,
      SupplierId: '',
      TotalStock: undefined,
    };
  }
}
