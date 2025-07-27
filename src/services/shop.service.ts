import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from 'src/models/Product';
import { Company, ICounts } from 'src/models/Company';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  url: string;
  private shopBs = new BehaviorSubject<Company | null>(null);
  $shop = this.shopBs.asObservable();
  constructor(private http: HttpClient) {
    this.url = environment.api;
  }
  getFeatured(request: IShopRequest): Observable<IShop> {
    return this.http.post<IShop>(`${this.url}/shop/get.php`, request);
  }
  getShop(request: IShopRequest): Observable<Company> {
    return this.http.post<Company>(`${this.url}/shop/get-shop.php`, request);
  }
  update_shop_state(shop: Company) {
    this.shopBs.next(shop);
  }
  getCompany(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.url}/company/get.php?id=${id}`);
  }
  counts(id: string): Observable<ICounts> {
    return this.http.get<ICounts>(`${this.url}/company/counts.php?id=${id}`);
  }
  active(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.url}/company/active.php`);
  }

  save(company: Company) {
    return this.http.post<Company>(`${this.url}/company/save.php`, company);
  }
  //api/other_info/company-info.php
  companyInfo(input: {
    ItemId: number | string;
    CompanyId: string;
    ItemType: string;
  }): Observable<Company> {
    let params = new URLSearchParams();
    params.set('ItemId', input.ItemId.toString());
    params.set('CompanyId', input.CompanyId);
    params.set('ItemType', input.ItemType);
    return this.http.get<Company>(
      `${this.url}/other_info/company-info.php?${params.toString()}`
    );
  }
}

export interface IShop {
  FeaturedStockProducts: Product[];
  FeaturedCustomProducts: Product[];
}

export interface IShopRequest {
  ShopId: string;
  AllFeatured?: boolean;
  IncludeCategories?: boolean;
  IncludeCustom?: boolean;
  IncludeStock?: boolean;
  IncludeFeaturedCustomProducts?: boolean;
  IncludeFeaturedStockProducts?: boolean;
  CategoriesId?: string;
}
