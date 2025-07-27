import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
 
  url: string;
  constructor(private http: HttpClient) {
    this.url = environment.api;
  }
  save(data: any): Observable<Discount> {
    return this.http.post<Discount>(`${this.url}/discounts/save.php`, data);
  }
  getByParentId(CompanyId: string): Observable<Discount[]> {
    return this.http.get<Discount[]>(
      `${this.url}/discounts/list.php?parentId=${CompanyId}`
    );
  }
  get(id: string): Observable<Discount> {
    return this.http.get<Discount>(
      `${this.url}/discounts/get.php?id=${id}`
    );
  }
  getByCode(parentId: string, code: string) {
    return this.http.get<Discount>(
      `${this.url}/discounts/get-by-code.php?parentId=${parentId}&code=${code}`
    );
  }
  delete(id: string): Observable<Discount> {
    return this.http.get<Discount>(
      `${this.url}/discounts/delete.php?id=${id}`
    );
  }
}

export interface Discount {
  Id?: number; // Optional, since it will be auto-generated
  ParentId: string;
  Name: string;
  Method: 'Automatic' | 'Discount Code'; // Restrict to valid methods
  DiscountValueType: 'Percentage' | 'Fixed'; // Restrict to known types
  DiscountValue: number;
  DiscountType: string;
  DiscountCode: string;
  StartDate: string; // Use ISO 8601 format (YYYY-MM-DD)
  EndDate: string;
  StartTime: string; // Use HH:mm:ss format
  EndTime: string;

  // Target
  StyleId: string;
  CollectionId: string;

  // Limits
  MaxUses: number;
  MaxUsesPerUser: number;
}


export function initDiscount(ParentId: string): Discount {
    return {
        ParentId,
        Name: '',
        Method: 'Automatic',
        DiscountValueType: 'Percentage',
        DiscountValue: 0,
        MaxUses: 100,
        MaxUsesPerUser: 1,
        DiscountType: '',
        DiscountCode: '',
        StartDate: '',
        EndDate: '',
        StartTime: '',
        EndTime: '',
        StyleId: '',
        CollectionId: '',
    };
}