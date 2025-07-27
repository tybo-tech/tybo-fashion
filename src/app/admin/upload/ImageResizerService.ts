import { Injectable } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';

@Injectable({
  providedIn: 'root'
})
export class ImageResizerService {

  constructor(private imageCompress: NgxImageCompressService) { }

  resizeImage(file: File, maxSize: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = async () => {
          const resizedDataUrl = await this.imageCompress.compressFile(img.src, -1, 50, 50); // Adjust quality as needed
          const resizedBlob = this.dataURLtoBlob(resizedDataUrl);
          const resizedFile = new File([resizedBlob], file.name, { type: file.type });
          resolve(resizedFile);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private dataURLtoBlob(dataUrl: string): Blob {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }
}
