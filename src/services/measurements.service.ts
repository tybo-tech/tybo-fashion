import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MEASUREMENTS } from 'src/constants/Measurements';
import { environment } from 'src/environments/environment';
import { IMeasurement } from 'src/models/measurement.model';
import {
  initOtherInfo,
  OTHER_TYPES,
  OtherInfo,
  OtherInfoSearchModel,
} from 'src/models/other-info.model';

@Injectable({
  providedIn: 'root',
})
export class MeasurementsService {
  url: string;
  searchUrl: string;
  constructor(private http: HttpClient) {
    this.url = environment.api;
    this.searchUrl = `${this.url}/other_info/search.php`;
  }

  save(data: OtherInfo<IMeasurement[]>): Observable<OtherInfo<IMeasurement[]>> {
    return this.http.post<OtherInfo<IMeasurement[]>>(
      `${this.url}/other_info/save.php`,
      data
    );
  }

  measurements(companyId: string) {
    const type = OTHER_TYPES.Measurements;
    const params = `ParentId=${companyId}&ItemType=${type}`;
    const api = `${this.searchUrl}?${params}`;
    return this.http.get<OtherInfo<IMeasurement[]>[]>(api);
  }

  create_measurements(companyId: string) {
    const item = initOtherInfo<IMeasurement[]>(
      OTHER_TYPES.Measurements,
      companyId,
      []
    );
    return this.save(item);
  }

  data() {
    return [
      'waist',
      'bust',
      'shoulder',
      'hip',
      'thigh',
      'inseam',
      'outseam',
      'Arm length',
      'neck',
      'chest',
      'wrist',
      'ankle',
      'calf',
      'forearm',
      'bicep',
      'torso length',
      'back width',
      'upper back',
      'lower back',
      'knee circumference',
      'seat',
      'crotch depth',
      'waist to knee',
      'waist to ankle',
      'hip to knee',
      'hip to ankle',
      'foot length',
      'foot width',
      'head circumference',
      'hand length',
      'hand width',
      'shoulder to elbow',
      'elbow to wrist',
      'shoulder to wrist',
      'shoulder to waist',
      'shoulder to hip',
      'neck to shoulder',
      'neck to bust',
      'neck to waist',
      'neck to hip',
      'Length from shoulder',
      'Waist to desired skirt length',
      'Upper arm',
      'Waist to desired pants length',
    ];
  }
}
