import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VariationService {
  url: string;

  constructor(private http: HttpClient) {
    this.url = environment.api;
  }

  // ===== VARIATION CRUD =====
  save(data: Variation): Observable<Variation> {
    return this.http.post<Variation>(`${this.url}/variation/save.php`, data);
  }

  update(data: Variation): Observable<Variation> {
    return this.http.post<Variation>(`${this.url}/variation/update.php`, data);
  }
  listByCompanyId(companyId: string): Observable<Variation[]> {
    return this.http.get<Variation[]>(`${this.url}/variation/list-by-company-id.php?companyId=${companyId}`);
  }
  get(id: number): Observable<Variation> {
    return this.http.get<Variation>(`${this.url}/variation/get.php?id=${id}`);
  }

  list(): Observable<Variation[]> {
    return this.http.get<Variation[]>(`${this.url}/variation/list.php`);
  }

  delete(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/variation/delete.php?id=${id}`);
  }

  // ===== VARIATION OPTION CRUD =====
  saveOption(data: VariationOption): Observable<VariationOption> {
    return this.http.post<VariationOption>(
      `${this.url}/variation/save-option.php`,
      data
    );
  }

  listOptions(variationId: number): Observable<VariationOption[]> {
    return this.http.get<VariationOption[]>(
      `${this.url}/variation-options/list.php?variationId=${variationId}`
    );
  }

  deleteOption(optionId: number): Observable<any> {
    return this.http.get<any>(
      `${this.url}/variation-options/delete.php?id=${optionId}`
    );
  }
}

// ----------------------------------
// Interfaces & Initializers
// ----------------------------------

export interface Variation {
  _selected: boolean;
  VariationId: number;
  Name: string;
  CompanyId: string;
  VariationType: 'Select' | 'Color' | 'Size' | 'Measurement';
  CompanyType: string;
  Description: string;
  CreateUserId: string;
  ModifyUserId: string;
  StatusId: number;
  Options?: VariationOption[];
  selectedOptionId?: number;
}

export interface VariationOption {
  _selected: boolean;
  VariationOptionId: number;
  VariationId: number;
  Name: string;
  Description: string;
  ImageUrl?: string;
  CreateUserId: string;
  ModifyUserId: string;
  StatusId: number;
}


export function initVariation(userId: string): Variation {
  return {
    _selected: false,
    VariationId: 0,
    Name: '',
    CompanyId: '',
    VariationType: 'Select',
    CompanyType: '',
    Description: '',
    CreateUserId: userId,
    ModifyUserId: userId,
    StatusId: 1,
  };
}


export function initVariationOption(
  variationId: number,
  userId: string
): VariationOption {
  return {
    _selected: false,
    VariationOptionId: 0,
    VariationId: variationId,
    Name: '',
    Description: '',
    ImageUrl: '',
    CreateUserId: userId,
    ModifyUserId: userId,
    StatusId: 1,
  };
}
