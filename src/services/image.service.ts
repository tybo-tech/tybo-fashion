import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Image } from 'src/models/Image';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
 
  url: string;
  constructor(private http: HttpClient) {
    this.url = environment.api;
  }
  add(data: any): Observable<Image> {
    return this.http.post<Image>(`${this.url}/images/add.php`, data);
  }

  save(product: Image) {
    return this.http.post<Image>(`${this.url}/images/save.php`, product);
  }
}
