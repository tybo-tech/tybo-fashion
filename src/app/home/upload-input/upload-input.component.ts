import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UploadService } from 'src/services/upload.service';

@Component({
  selector: 'app-upload-input',
  templateUrl: './upload-input.component.html',
  styleUrls: ['./upload-input.component.scss'],
})
export class UploadInputComponent {
  closeModal($event: MouseEvent) {
    if ($event.target === document.querySelector('.image-view')) this.view = false;
  }
  @Input() imageKey = '';
  @Input() label = '';
  @Input() size = '5';
  @Input() parentItem: any = {};
  @Output() onFileChanged = new EventEmitter<string>();
  view = false;
  constructor(private uploadService: UploadService) {}
  onFileChange(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }
    // First file
    this.uploadService.uploadOriginal(files[0], this.parentItem, this.imageKey, this.onFileChanged);
  }

  get hasFile() {
    return this.parentItem[this.imageKey] && this.parentItem[this.imageKey] !== '';
  }
}
