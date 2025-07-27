import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from 'src/models/Product';
import { ICollection } from 'src/models/Category';
import { OtherInfo } from 'src/models/other-info.model';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  url: string;
  constructor(private http: HttpClient) {
    this.url = environment.api;
  }

  collectionItems(id: string, companyId = '', type = ''): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.url}/collections/collection-items.php?Id=${id}&CompanyId=${companyId}&Type=${type}`
    );
  }
  collections(companyId = '', type =''): Observable<OtherInfo<ICollection>[]> {
    return this.http.get<OtherInfo<ICollection>[]>(
      `${this.url}/collections/collections.php?CompanyId=${companyId}&Type=${type}`
    );
  }
}
