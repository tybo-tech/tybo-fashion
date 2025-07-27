import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VariationOptionService {
  url: string;
  constructor(private http: HttpClient) {
    this.url = environment.api;
  }

  save(product: any) {
    return this.http.post<any>(`${this.url}/variation-option/save.php`, product);
  }
}
