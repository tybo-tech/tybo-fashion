import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Image } from 'src/models/Image';
export const IMAGE_CROP_SIZE = 800;

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  url: string;
  constructor(private http: HttpClient) {
    this.url = environment.api;
  }

  uploadFile(
    formData: FormData,
    otherId: string,
    userId = '',
    url = ''
  ): Observable<Image> {
    formData.append('OtherId', otherId);
    formData.append('UserId', userId);
    formData.append('Url', url);
    return this.http.post<Image>(`${this.url}/upload/upload.php`, formData);
  }
  uploadFile2(formData: any): Observable<any> {
    return this.http.post<any>(`${this.url}/upload/upload.php`, formData);
  }
  uploadBase64(
    formData: FormData,
    otherId: string,
    userId = '',
    url = ''
  ): Observable<Image> {
    formData.append('OtherId', otherId);
    formData.append('UserId', userId);
    formData.append('Url', url);
    return this.http.post<Image>(
      `${this.url}/upload/upload-base-64.php`,
      formData
    );
  }
  uploadBase64v2(data: string): Observable<Image> {
    return this.http.post<Image>(`${this.url}/upload/upload-base-64.php`, {
      data,
    });
  }

  deleteFile(fileName: string): Observable<any> {
    return this.http.get<any>(`${this.url}/upload/delete.php?file=${fileName}`);
  }

  public onUplaod = (files: FileList | null, item: any, key: string) => {
    if (!files || files.length === 0) {
      return;
    }
    Array.from(files).forEach((file: any) => {
      if (file.size < 2000000) this.uploadOriginal(file, item, key);
      else this.resizeImage(file, item, key);
    });
  };
  uploadOriginal(file: File, item: any, key: string,onFileChanged = new EventEmitter<string>()) {
    if (!file || !file) return;
    const split = file.name.split('.');
    const extention = split[split.length - 1];
    const rand4digits = Math.floor(1000 + Math.random() * 9000);
    const name = 'tybo' + rand4digits + split[0] + '.' + extention;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name); // file extention
    this.uploadFilev2(formData).subscribe((response) => {
      if (response && response.length > 15 && item) {
        const uri = `${this.url}/upload/${response}`;
        item[key] = uri;
        onFileChanged.emit(uri);
      } else {
        alert('File too big');
      }
    });
  }
  resizeImage(file: any, item: any, key: string) {
    if (file.type.match(/image.*/) && file.type !== 'image/gif') {
      const reader = new FileReader();
      reader.onload = (readerEvent: any) => {
        const image = new Image();
        image.onload = (imageEvent) => {
          // Resize the image
          const canvas = document.createElement('canvas');
          const maxSize = IMAGE_CROP_SIZE;
          let width = image.width;
          let height = image.height;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')?.drawImage(image, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          const resizedImage = this.dataURLToBlob(dataUrl);
          let extention = 'iio.jpg';
          if (file.type === 'image/gif') {
            extention = 'iio.gif';
          }
          let fileOfBlob = new File([resizedImage], extention);
          // upload
          let formData = new FormData();
          formData.append('file', fileOfBlob);
          formData.append('name', 'iio');
          this.uploadFilev2(formData).subscribe((response) => {
            if (response && response.length > 15) {
              const uri = `${this.url}/upload/${response}`;
              item[key] = uri;
              console.log(item);
            }
          });
        };
        image.src = readerEvent.target.result.toString();
      };
      reader.readAsDataURL(file);
    }
  }

  uploadFilev2(formData: any): Observable<any> {
    return this.http.post<any>(`${this.url}/upload/upload.php`, formData);
  }

  dataURLToBlob(dataURL: any) {
    const BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) === -1) {
      // tslint:disable-next-line: no-shadowed-variable
      const parts = dataURL.split(',');
      // tslint:disable-next-line: no-shadowed-variable
      const contentType = parts[0].split(':')[1];
      // tslint:disable-next-line: no-shadowed-variable
      const raw = parts[1];

      return new Blob([raw], { type: contentType });
    }

    const parts = dataURL.split(BASE64_MARKER);
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;

    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }
}
