import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  initOtherInfo,
  OTHER_TYPES,
  OtherInfo,
  OtherInfoSearchModel,
} from 'src/models/other-info.model';
import { ICollection, initCategory } from 'src/models/Category';

@Injectable({
  providedIn: 'root',
})
export class OtherInfoService<T> {
  url: string;

  private categoriesBS = new BehaviorSubject<OtherInfo<T>[]>([]);
  $categories = this.categoriesBS.asObservable();

  constructor(private http: HttpClient) {
    this.url = environment.api;
  }

  save(data: OtherInfo<T>): Observable<OtherInfo<T>> {
    return this.http.post<OtherInfo<T>>(
      `${this.url}/other_info/save.php`,
      data
    );
  }

  list(otherId: number): Observable<OtherInfo<T>[]> {
    return this.http.get<OtherInfo<T>[]>(
      `${this.url}/other_info/list.php?OtherId=${otherId}`
    );
  }
  listByType(itemCode: string): Observable<OtherInfo<T>[]> {
    return this.http.get<OtherInfo<T>[]>(
      `${this.url}/other_info/list.php?ItemCode=${itemCode}`
    );
  }

  get(id: string, join = '', key = ''): Observable<OtherInfo<T>> {
    return this.http.get<OtherInfo<T>>(
      `${this.url}/other_info/get.php?Id=${id}&Join=${join}&Key=${key}`
    );
  }
  delete(id: number) {
    return this.http.get<OtherInfo<T>>(
      `${this.url}/other_info/delete.php?Id=${id}`
    );
  }
  search(search: OtherInfoSearchModel) {
    return this.http.get<OtherInfo<T>[]>(
      `${this.url}/other_info/search.php?ParentId=${
        search.ParentId || '1'
      }&ItemType=${search.ItemType}&ProductCount=${search.ProductCount}&Key=${
        search.Key || ''
      }`
    );
  }

  loadCategories(companyId: string) {
    this.search({
      ItemType: OTHER_TYPES.Category,
      ParentId: companyId,
    }).subscribe((data) => {
      if (data && data.length) {
        this.categoriesBS.next(data);
      }
    });
  }
  sizes(companyId: string) {
    return this.search({
      ItemType: OTHER_TYPES.Sizes,
      ParentId: companyId,
    });
  }
  measurements(companyId: string) {
    return this.search({
      ItemType: OTHER_TYPES.Measurements,
      ParentId: companyId,
    });
  }
  categories(companyId: string): Observable<OtherInfo<ICollection>[]> {
    return this.search({
      ItemType: OTHER_TYPES.Category,
      ParentId: companyId,
      ProductCount: 'Yes',
      Key: 'Categories',
    }) as Observable<OtherInfo<ICollection>[]>;
  }
  collections(companyId: string) {
    return this.search({
      ItemType: OTHER_TYPES.Collections,
      ParentId: companyId,
      ProductCount: 'Yes',
      Key: 'Collections',
    });
  }
  workGallery(companyId: string) {
    return this.search({
      ItemType: OTHER_TYPES.WorkGallery,
      ParentId: companyId,
    });
  }

  /**
   * Append a size label to the company's size library (server dedupes and
   * trims). Returns the saved library row so callers can react to the
   * actual persisted value, or null when the label already exists.
   * Audit fix §7.11: the size picker previously had its own inline copy of
   * this logic — all add-size paths now share this single implementation.
   */
  addNewSize(
    companyId: string,
    name: string
  ): Observable<OtherInfo<string[]> | null> {
    return new Observable<OtherInfo<string[]> | null>((observer) => {
      this.sizes(companyId).subscribe((data) => {
        if (data && data.length && Array.isArray(data[0].ItemValue)) {
          const item = data[0] as OtherInfo<string[]>;
          const label = name.trim();
          const values = item.ItemValue as string[];
          const exists = values.some(
            (existing) => existing.toLowerCase() === label.toLowerCase()
          );
          if (!label || exists) {
            observer.next(null);
            observer.complete();
            return;
          }
          values.push(label);
          this.save(item as unknown as OtherInfo<T>).subscribe((saved) => {
            observer.next(saved && saved.Id ? (saved as OtherInfo<string[]>) : null);
            observer.complete();
          });
        } else {
          observer.next(null);
          observer.complete();
        }
      });
    });
  }
  addNewMeasurement(companyId: string, name: string) {
    this.measurements(companyId).subscribe((data) => {
      if (data && data.length) {
        const item = data[0];
        if (Array.isArray(item.ItemValue)) {
          item.ItemValue.push(name);
          this.save(item).subscribe((data) => {
            if (data && data.Id) {
              this.measurements(companyId);
            }
          });
        }
      }
    });
  }

  addNewCategory(companyId: string, name: string) {
    const cat: OtherInfo<ICollection> = initOtherInfo(
      OTHER_TYPES.Category,
      companyId,
      initCategory()
    );
    cat.Name = name;
    cat.ItemValue.Name = name;
    cat.Status = 'Active';
    this.save(cat as OtherInfo<T>).subscribe((data) => {
      if (data && data.Id) {
        console.log(data);
      }
    });
  }

  addNewCollection(companyId: string, name: string) {
    const cat: OtherInfo<ICollection> = initOtherInfo(
      OTHER_TYPES.Collections,
      companyId,
      initCategory()
    );
    cat.Name = name;
    cat.ItemValue.Name = name;
    cat.Status = 'Active';
    this.save(cat as OtherInfo<T>).subscribe((data) => {
      if (data && data.Id) {
        console.log(data);
      }
    });
  }
}
