import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Company } from 'src/models/Company';
import { HeroHeaderData } from 'src/models/HeroHeaderData';
import { Product } from 'src/models/Product';
import { Category } from 'src/services/category.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
})
export class AdminProductsComponent {
  categoryId = '';
  company?: Company;
  products: Product[] = [];
  category?: Category;
  heroHeaderData?: HeroHeaderData;

  // Pagination properties
  currentPage = 1;
  pageSize = 20;
  totalProducts = 0;
  isLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private userService: UserService
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.categoryId = r['categoryId'];
      if (this.categoryId) {
        this.getByCategory();
      } else {
        this.getProducts(1); // Start with page 1
      }
    });
  }
  get companyId() {
    return this.userService.getUser?.CompanyId;
  }

  getProducts(page: number = 1) {
    if (!this.companyId) {
      alert('Please select Login to a company');
      return;
    }

    this.isLoading = true;
    this.currentPage = page;

    this.productService.getProductsPage(this.companyId, page, this.pageSize, true).subscribe((data) => {
      this.isLoading = false;
      if (data && data.length) {
        this.products = data;
        this.setHeroHeaderData();
      }
    }, (error) => {
      this.isLoading = false;
      console.error('Error loading products:', error);
    });
  }

  // Load next page
  loadNextPage() {
    if (this.products.length === this.pageSize) {
      this.getProducts(this.currentPage + 1);
    }
  }

  // Load previous page
  loadPreviousPage() {
    if (this.currentPage > 1) {
      this.getProducts(this.currentPage - 1);
    }
  }

  // Go to specific page
  goToPage(page: number) {
    if (page > 0) {
      this.getProducts(page);
    }
  }

  // Get array of page numbers for pagination controls
  getPageNumbers(): number[] {
    const maxPages = Math.ceil(this.totalProducts / this.pageSize);
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(maxPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Check if there are more products to load
  get hasNextPage(): boolean {
    return this.products.length === this.pageSize;
  }

  // Check if we can go to previous page
  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  // Delete product
  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.Name}"? This action cannot be undone.`)) {
      this.productService.deleteProduct(product.ProductId).subscribe(() => {
        // Reload current page
        this.getProducts(this.currentPage);
      }, (error) => {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      });
    }
  }

  // Handle image loading errors
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.svg';
  }
  getByCategory() {
    this.productService.getByCategory(this.categoryId).subscribe((data) => {
      if (data && data.CategoryId) {
        this.category = data;
        this.products = data.Products || [];
        this.company = data.Company;
        this.setHeroHeaderData();
      }
    });
  }

  setHeroHeaderData() {
    this.heroHeaderData = {
      title: this.category?.Name || this.company?.Name || 'Products',
      description:
        this.category?.Description ||
        this.company?.Description ||
        'Explore our products',
      image:
        this.category?.ImageUrl || this.company?.Metadata?.AboutImage || '',
      slug: '',
    };
  }
}
