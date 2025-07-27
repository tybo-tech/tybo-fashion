import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-order-list-images',
  templateUrl: './order-list-images.component.html',
  styleUrls: ['./order-list-images.component.scss']
})
export class OrderListImagesComponent {
  @Input() imageUrls: string[] = [];

  constructor() {}

  ngOnInit(): void {}
}
