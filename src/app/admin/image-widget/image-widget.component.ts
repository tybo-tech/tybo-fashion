import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Image, initImage } from 'src/models/Image';
import { ImageService } from 'src/services/image.service';
import { UploadService } from 'src/services/upload.service';

export const IMAGE_CROP_SIZE = 1450;

/** Files above this are refused outright — decoding them would risk an
 *  out-of-memory crash on a phone before any resize could run. */
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

/** Below this a file is uploaded untouched; above it is downscaled first. */
const DIRECT_UPLOAD_BYTES = 1200000;

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

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
  loading = false;
  showMenu = false;
  showUrl = false;
  showUnsplash = false;
  url = '';
  imageEvent: any;
  croppedImage: any;
  scale = 1;

  /** User-facing failure message. Never leave the widget silently stuck. */
  error = '';

  constructor(
    private uploadService: UploadService,
    private imageService: ImageService
  ) {}

  ngOnInit() {
    if (!this.image && this.image_url) {
      this.image = initImage();
      this.image.Url = this.image_url;
    }
    if (!this.image && !this.image_url) {
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

  uploadOriginal(file: File, files: File[], index: number) {
    const formData = new FormData();
    const name = `${this.name}-${new Date().getTime()}.${this.extensionOf(file)}`;
    formData.append('file', file, name);
    this.loading = true;
    formData.append('name', name); // file extension
    this.uploadService
      .uploadFile(
        formData,
        this.otherId,
        this.userId,
        `${environment.api}/upload/`
      )
      .subscribe({
        next: (response) => {
          this.loading = false;
          const url = this.extractUrl(response);
          if (url && this.image) {
            this.error = '';
            this.imageChangedEvent.emit(url);
            this.image.Url = url;
          } else {
            this.fail(this.uploadFailureMessage(response));
          }
          this.next(files, index);
        },
        error: (err) => {
          this.loading = false;
          this.fail(this.httpErrorMessage(err));
          this.next(files, index);
        },
      });
  }

  onFileChange(event: any) {
    this.imageEvent = event;
  }

  onImageLoaded(e: any) {}
  initCroper(e: any) {}

  public uploadFile = (files: FileList | File[] | null, index: number) => {
    if (!files || files.length === 0 || files.length <= index) {
      this.loading = false;
      return;
    }

    const file = files[index];
    if (!file) {
      this.next(files, index + 1);
      return;
    }

    // Validate before touching the file. Mobile pickers can hand back a
    // camera/HEIC file with an empty MIME type, or a non-image entirely;
    // both previously left the spinner running forever.
    const validationError = this.validate(file);
    if (validationError) {
      this.fail(validationError);
      this.next(files, index + 1);
      return;
    }

    this.error = '';
    this.loading = true;
    if (file.size < DIRECT_UPLOAD_BYTES) {
      this.uploadOriginal(file, files as File[], index + 1);
    } else {
      this.resizeImage(file, files as File[], index + 1);
    }
  };

  /** Advance the queue without an unhandled rejection breaking the chain. */
  private next(files: FileList | File[] | null, index: number) {
    if (!files || files.length <= index) {
      this.loading = false;
      return;
    }
    setTimeout(() => this.uploadFile(files, index), 20);
  }

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

  resizeImage(file: File, files: File[], index: number) {
    const reader = new FileReader();

    reader.onload = (readerEvent: any) => {
      const image = new window.Image();

      image.onerror = () => {
        // The browser could not decode the file (commonly HEIC/HEIF from an
        // iPhone, or a corrupt upload). Explain instead of hanging.
        this.loading = false;
        this.fail(
          'This image could not be read. If it came from an iPhone, set Camera ' +
            'format to "Most Compatible" (JPEG) and try again.'
        );
        this.next(files, index);
      };

      image.onload = () => {
        try {
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
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Canvas is unavailable.');
          }
          context.drawImage(image, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          const resizedImage = this.dataURLToBlob(dataUrl);

          const formData = new FormData();
          formData.append('file', new File([resizedImage], 'iio.jpg'));
          formData.append('name', 'iio');

          this.uploadService
            .uploadFile(
              formData,
              this.otherId,
              this.userId,
              `${environment.api}/upload/`
            )
            .subscribe({
              next: (response) => {
                this.loading = false;
                const url = this.extractUrl(response);
                if (url && this.image) {
                  this.error = '';
                  this.imageChangedEvent.emit(url);
                  this.image.Url = url;
                } else {
                  this.fail(this.uploadFailureMessage(response));
                }
                this.next(files, index);
              },
              error: (err) => {
                this.loading = false;
                this.fail(this.httpErrorMessage(err));
                this.next(files, index);
              },
            });
        } catch (e) {
          this.loading = false;
          this.fail('This image could not be processed. Please try a different photo.');
          this.next(files, index);
        }
      };

      image.src = readerEvent.target.result.toString();
    };

    reader.onerror = () => {
      this.loading = false;
      this.fail('This file could not be read. Please try again.');
      this.next(files, index);
    };

    reader.readAsDataURL(file);
  }

  dataURLToBlob(dataURL: any) {
    const BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) === -1) {
      const parts = dataURL.split(',');
      const contentType = parts[0].split(':')[1];
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

  dismissError() {
    this.error = '';
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private validate(file: File): string | null {
    if (!file.size) {
      return 'That file is empty. Please choose a different photo.';
    }
    if (file.size > MAX_SOURCE_BYTES) {
      return 'That image is too large (over 25MB). Please choose a smaller photo.';
    }
    // Trust the extension when the browser gives no MIME type (common for
    // camera captures on Android/iOS).
    const extension = this.extensionOf(file);
    const type = (file.type || '').toLowerCase();
    if (type.startsWith('image/')) {
      return null;
    }
    if (ALLOWED_EXTENSIONS.includes(extension)) {
      return null;
    }
    return 'Please choose a JPG, PNG, WEBP or GIF image.';
  }

  private extensionOf(file: File): string {
    const parts = (file.name || '').split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * The upload endpoint returns the saved Image object on success, but a raw
   * string or ["ERROR", ...] on failure. Only a real object with a Url counts.
   */
  private extractUrl(response: any): string | null {
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      return response.Url || null;
    }
    return null;
  }

  private uploadFailureMessage(response: any): string {
    if (typeof response === 'string') {
      return 'The upload failed on the server. Please try again.';
    }
    if (Array.isArray(response) && response.length) {
      return 'The upload failed on the server. Please try again.';
    }
    return 'The upload did not return a file. Please try again.';
  }

  private httpErrorMessage(err: HttpErrorResponse): string {
    if (err?.status === 0) {
      return 'Network error. Check your connection and try again.';
    }
    if (err?.status === 413) {
      return 'That image is too large for the server. Please choose a smaller photo.';
    }
    return 'Upload failed. Please check your connection and try again.';
  }

  private fail(message: string) {
    this.loading = false;
    this.error = message;
  }
}
