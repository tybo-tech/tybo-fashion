import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { ImageResizerService } from './ImageResizerService';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @Output() files = new EventEmitter<any[]>();
  @Output() closed = new EventEmitter<any>();
  selectedFiles: File[] = [];
  maxFileSize = 2 * 1024 * 1024; // 2MB
  uploadProgress = 0;
  isUploading = false;

  constructor(private http: HttpClient, private imageResizer: ImageResizerService, private uxService: UxService) { }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files);
    this.selectedFiles = [];

    files.forEach((file: any) => {
      if (file.size > this.maxFileSize) {
        this.imageResizer.resizeImage(file, this.maxFileSize).then(resizedFile => {
          this.selectedFiles.push(resizedFile);
        }).catch(error => {
          console.error('Error resizing file:', error);
        });
      } else {
        this.selectedFiles.push(file);
      }
    });

    if (files.length !== this.selectedFiles.length) {
      // alert('Some files were resized to fit the size limit.');
    }
  }

  onUpload() {
    if (this.selectedFiles.length === 0 || this.isUploading) {
      return;
    }

    this.isUploading = true;
    const originalButtonText = 'Upload';
    const pleaseWaitButtonText = 'Please Wait';
    const uploadButton = document.getElementById('uploadButton') as HTMLButtonElement;
    uploadButton.disabled = true;
    uploadButton.textContent = pleaseWaitButtonText;

    const formData = new FormData();
    this.selectedFiles.forEach(file => {
      formData.append('files[]', file, file.name);
    });

    this.http.post('https://tybofashion.co.za/api/api/upload/upload-betta.php', formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round(100 * event.loaded / event.total);
      } else if (event.type === HttpEventType.Response) {
        console.log('Files successfully uploaded!', event.body);
        // this.uxService.show_toast('Files successfully uploaded!', 'success');
        const items:any =  event.body;
        const urls: string[] = [];
        items.forEach((response:any) => {
          if (response.success) {
            urls.push(`https://tybofashion.co.za/api/api/upload/${response.success}`);
          }
        });
        this.files.emit(urls);

        setTimeout(() => {
          this.isUploading = false;
          uploadButton.disabled = false;
          uploadButton.textContent = originalButtonText;
          this.closed.emit();
        }, 3000); // Emit close event after 4 seconds
      }
    }, error => {
      console.error('Upload failed!', error);
      this.isUploading = false;
      uploadButton.disabled = false;
      uploadButton.textContent = originalButtonText;
    });
  }
}
