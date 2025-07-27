import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Category, initCategory } from './category.service';
import { User } from 'src/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ChipAddService {
  url: string;

  constructor(private http: HttpClient) {
    this.url = environment.api;
  }

  onNewCategoryAdded(name: string, categoryParentId: string, user: User) {
    const {UserId, CompanyId} = user;
    const cat = initCategory(CompanyId, UserId, name, categoryParentId);
    return this.saveCategory(cat);
  }

  saveCategory(data: Category): Observable<Category> {
    return this.http.post<Category>(`${this.url}/categories/save.php`, data);
  }
}
