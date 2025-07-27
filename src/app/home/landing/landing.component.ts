import { Component } from '@angular/core';
import { Product } from 'src/models/Product';
import { ProductService } from 'src/services/product.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  products: Product[] = [];
  constructor(private productService: ProductService) {
    productService.featured().subscribe((data) => {
      if(data){
        this.products = data;
      }
    });
   }
   benefits = [
    {
      title: "Support Local Designers",
      description: "Choosing Tybo Fashion means supporting passionate local fashion designers. Your purchase directly contributes to the growth and sustainability of your local fashion community.",
      icon: ['bi', 'bi-heart']
    },
    {
      title: "High-Quality Clothing",
      description: "We are committed to offering only the highest quality clothing. Each piece is meticulously crafted with premium materials to ensure you look good and feel comfortable.",
      icon: ['bi', 'bi-stars']
    },
    {
      title: "Unique Designs",
      description: "Discover one-of-a-kind designs that reflect unique perspectives and cultural influences. Our pieces stand out, helping you express your individual style.",
      icon: ['bi', 'bi-gem']
    }
  ];
  
  get images(){
    return this.products.map(p => p.FeaturedImageUrl);
  }
}
