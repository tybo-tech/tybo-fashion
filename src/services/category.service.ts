import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Company } from 'src/models/Company';
import { Product } from 'src/models/Product';
import { Discount } from './discounts.service';
import { getId } from 'src/constants/Constants';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  url: string;

  constructor(private http: HttpClient) {
    this.url = environment.api;
  }

  save(data: Category): Observable<Category> {
    return this.http.post<Category>(`${this.url}/categories/save.php`, data);
  }

  get(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.url}/categories/get.php?id=${id}`);
  }

  listByCompanyId(
    companyId: string,
    isAdmin: 'yes' | '' = '',
    categoryId: string = ''
  ): Observable<Company> {
    return this.http.get<Company>(
      `${this.url}/categories/list-by-company-id.php?companyId=${companyId}&parentId=${categoryId}&isAdmin=${isAdmin}`
    );
  }

  listNamesAndIds(companyId: string) {
    return this.http.get<Category[]>(
      `${this.url}/categories/list-names-and-ids.php?companyId=${companyId}`
    );
  }

  getByParentId(companyId: string, parentId: string): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.url}/categories/by-parent.php?companyId=${companyId}&parentId=${parentId}`
    );
  }
  getCategoryAndChildren(
    companyId: string,
    categoryId: string,
    isAdmin: 'yes' | '' = ''
  ): Observable<Category> {
    return this.http.get<Category>(
      `${this.url}/categories/category-and-children.php?companyId=${companyId}&categoryId=${categoryId}&isAdmin=${isAdmin}`
    );
  }
  delete(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/categories/delete.php?id=${id}`);
  }
}

// ----------------------------------
// Category Interface & Initializer
// ----------------------------------

export interface Category {
  CountProducts?: number;
  Children?: Category[];
  CategoryId: string;
  CompanyId: string;
  ParentCompanyId?: string;
  Name: string;
  ParentId?: string;
  CategoryType: string; // e.g., 'style', 'collection'
  CompanyType: string;
  Description: string;
  DisplayOrder: number;
  ImageUrl?: string;
  PhoneBanner?: string;
  IsDeleted?: boolean;
  CreateDate?: string;
  CreateUserId: string;
  ModifyDate?: string;
  ModifyUserId: string;
  StatusId: number;

  // Ux
  Company?: Company;
  Products?: Product[];
  Discount?: Discount;
}

export function initCategory(
  companyId: string,
  userId: string,
  name = '',
  parentId = ''
): Category {
  return {
    CompanyId: companyId,
    Name: name,
    CategoryType: '',
    CompanyType: '',
    Description: '',
    CategoryId: getId('category'),
    ImageUrl: '',
    ParentCompanyId: '',
    ParentId: parentId,
    PhoneBanner: '',
    DisplayOrder: 0,
    CreateUserId: userId,
    ModifyUserId: userId,
    StatusId: 1,
  };
}
