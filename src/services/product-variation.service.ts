import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductVariationService {
  private apiUrl = environment.api;

  constructor(private http: HttpClient) {}

  // Product Variations
  addProductVariation(data: ProductVariation): Observable<any> {
    return this.http.post(`${this.apiUrl}/product-variation/add.php`, data);
  }

  removeProductVariation(productId: string, variationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/product-variation/remove.php?productId=${productId}&variationId=${variationId}`);
  }

  getVariationsByProduct(productId: string): Observable<Variation[]> {
    return this.http.get<Variation[]>(`${this.apiUrl}/product-variation/list.php?productId=${productId}`);
  }

  // Product Variation Options
  addProductVariationOption(data: ProductVariationOption): Observable<any> {
    return this.http.post(`${this.apiUrl}/product-variation-option/add.php`, data);
  }

  removeProductVariationOption(productId: string, optionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/product-variation-option/delete.php?productId=${productId}&optionId=${optionId}`);
  }

  getVariationOptionsByProduct(productId: string): Observable<VariationOption[]> {
    return this.http.get<VariationOption[]>(`${this.apiUrl}/product-variation-option/list.php?productId=${productId}`);
  }
}

// -----------------------------
// Interfaces
// -----------------------------

export interface ProductVariation {
    Id?: number;
    ProductId: string;
    VariationId: number;
    CreateUserId: string;
    ModifyUserId: string;
    StatusId: number;
  }
  
  export interface ProductVariationOption {
    Id?: number;
    ProductId: string;
    VariationOptionId: number;
    CreateUserId: string;
    ModifyUserId: string;
    StatusId: number;
  }
  
  export interface Variation {
    VariationId: number;
    Name: string;
    VariationType: string;
    Description: string;
    Options?: VariationOption[];
  }
  
  export interface VariationOption {
    VariationOptionId: number;
    Name: string;
    Description?: string;
    ImageUrl?: string;
  }