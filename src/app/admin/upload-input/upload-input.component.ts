import { Component, Input } from '@angular/core';
import { UploadService } from 'src/services/upload.service';

@Component({
  selector: 'app-upload-input',
  templateUrl: './upload-input.component.html',
  styleUrls: ['./upload-input.component.scss'],
})
export class UploadInputComponent {
  closeModal($event: MouseEvent) {
    if ($event.target === document.querySelector('.image-view'))
      this.view = false;
  }
  @Input() imageKey = '';
  @Input() size = '5';
  @Input() parentItem: any = {};
  view = false;
  constructor(private uploadService: UploadService) {}
  onFileChange(files: FileList | null) {
    this.uploadService.onUplaod(files, {...this.parentItem}, this.imageKey);
  }
}
