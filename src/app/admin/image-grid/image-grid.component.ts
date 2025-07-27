import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss'],
})
export class ImageGridComponent {
  @Input() images: string[] = [];
  @Input() selected: string = '';
  @Output() imageRemoved = new EventEmitter<string[]>();
  @Output() imageSetAsMain = new EventEmitter<string>();
  showOptionsMenu = false;
  selectedImageIndex: number | null = null;

  toggleOptionsMenu(index: number) {
    if (this.selectedImageIndex === index) {
      this.showOptionsMenu = !this.showOptionsMenu;
    } else {
      this.showOptionsMenu = true;
    }
    this.selectedImageIndex = index;
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
    this.imageRemoved.emit(this.images);
    this.selectedImageIndex = null;
    this.showOptionsMenu = false;
  }

  setAsMainImage(image: string) {
    this.imageSetAsMain.emit(image);
    this.selected = image;
    this.selectedImageIndex = null;
    this.showOptionsMenu = false;
  }
}
