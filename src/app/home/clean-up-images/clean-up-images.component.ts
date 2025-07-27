import { Component } from '@angular/core';
import { ProductService } from 'src/services/product.service';

@Component({
  selector: 'app-clean-up-images',
  templateUrl: './clean-up-images.component.html',
  styleUrls: ['./clean-up-images.component.scss'],
})
export class CleanUpImagesComponent {
  items: { ProductId: string; Images: string[] }[] = [];
  constructor(private pr: ProductService) {
    pr.cleanImages().subscribe((data) => {
      this.items = data;
    });
  }
  deleteImage(item: { ProductId: string; Images: string[] }, img: string) {
    item.Images = item.Images.filter((i) => i !== img);
    this.pr.updateImages(item).subscribe();
  }
}
