import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Image, initImage } from 'src/models/Image';
import { ImageService } from 'src/services/image.service';
import { UploadService } from 'src/services/upload.service';
export const IMAGE_CROP_SIZE = 1450;
@Component({
  selector: 'app-image-widget',
  templateUrl: './image-widget.component.html',
  styleUrls: ['./image-widget.component.scss'],
})
export class ImageWidgetComponent implements OnInit {
  @Input() image?: Image;
  @Input() name = '';
  @Input() image_url = '';
  @Input() otherId = 'OtherId';
  @Input() userId = 'UserId';
  @Output() imageChangedEvent = new EventEmitter<string>();
  @Output() makeMainEvent = new EventEmitter<string>();
  @Input() maxSize?: number;
  loading: boolean = false;
  showMenu: boolean = false;
  showUrl: boolean = false;
  showUnsplash: boolean = false;
  url = '';
  imageEvent: any;
  croppedImage: any;
  scale = 1;

  constructor(
    private uploadService: UploadService,
    private imageService: ImageService
  ) {}

  ngOnInit() {
    if(!this.image && this.image_url){
      this.image = initImage();
      this.image.Url = this.image_url;
    }
    if(!this.image && !this.image_url){
      this.image = initImage();
    }
  }
  saveImage(img: Image) {
    this.imageService.save(img).subscribe((data) => {
      if (data && data.StatusId && Number(data.StatusId) === 99) {
        this.uploadService.deleteFile(data.Url).subscribe();
      }
    });
  }
  uploadOriginal(file: any, files: any[], index: number) {
    const formData = new FormData();
    const name = `${this.name}-${new Date().getTime()}.${
      file.name.split('.')[file.name.split('.').length - 1]
    }`;
    formData.append('file', file);
    this.loading = true;
    formData.append('name', name); // file extention
    this.uploadService
      .uploadFile(
        formData,
        this.otherId,
        this.userId,
        `${environment.api}/upload/`
      )
      .subscribe((response) => {
        this.loading = false;
        if (response && response.Url && this.image) {
          this.imageChangedEvent.emit(response.Url);
          this.image.Url = response.Url;
        } else {
          // alert('File too big');
        }
        setTimeout(() => {
          this.uploadFile(files, index);
        }, 20);
      });
  }
  onFileChange(event: any) {
    this.imageEvent = event;
  }

  onImageLoaded(e: any) {}
  initCroper(e: any) {}


  public uploadFile = (files: any, index: number) => {
    if (!files || files.length === 0 || files.length <= index) return;

    this.loading = true;
    const file = files[index];
    if (!file) return;
    if (file.size < 1200000) this.uploadOriginal(file, files, index + 1);
    else this.resizeImage(file, files, index + 1);
  };
  remove() {
    if (this.image && this.image.Url) {
      this.image.StatusId = 99;
      this.saveImage(this.image);
      this.imageChangedEvent.emit(``);
      this.showMenu = false;
    }
  }
  makeMain() {
    this.makeMainEvent.emit(``);
    this.showMenu = false;
  }
  resizeImage(file: any, files: any[], index: number) {
    if (file.type.match(/image.*/) && file.type !== 'image/gif') {
      const reader = new FileReader();
      reader.onload = (readerEvent: any) => {
        const image = new Image();
        image.onload = (imageEvent) => {
          // Resize the image
          const canvas = document.createElement('canvas');
          const maxSize = this.maxSize || IMAGE_CROP_SIZE;
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
          const name = `${this.name}-${new Date().getTime()}.${
            file.name.split('.')[file.name.split('.').length - 1]
          }`;

          let formData = new FormData();
          formData.append('file', fileOfBlob);
          formData.append('name', name);
          this.uploadService
            .uploadFile(
              formData,
              this.otherId,
              this.userId,
              `${environment.api}/upload/`
            )
            .subscribe((response) => {
              this.loading = false;

              if (response && response.Url && this.image) {
                this.imageChangedEvent.emit(response.Url);
                this.image.Url = response.Url;
              }
              setTimeout(() => {
                this.uploadFile(files, index);
              }, 20);
            });
        };
        image.src = readerEvent.target.result.toString();
      };
      reader.readAsDataURL(file);
    }
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

  doneUpsplash(e: string) {
    this.imageChangedEvent.emit(e);
    this.showUnsplash = false;
    this.showUrl = false;
  }
}
