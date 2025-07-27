import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddModalService } from 'src/services/add.modal.service';
import { Category, CategoryService } from 'src/services/category.service';
import { QuickFromComponent } from "../quick-from/quick-from.component";
import { FormsModule } from '@angular/forms';
import { finalize, catchError, of } from 'rxjs';

@Component({
  selector: 'app-category-card',
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  providers: [AddModalService],
})
export class CategoryCardComponent {
  @Input() category!: Category;
  @Input({ required: true }) slug!: string;
  @Input() isAdmin = false;
  @Output() onCategoryDeleted = new EventEmitter<string>();
  @Output() onCategoryUpdated = new EventEmitter<Category>();

  showModal = false;
  isDeleting = false;
  selected?: Category;

  constructor(
    public addModalService: AddModalService, 
    private categoryService: CategoryService
  ) {}

  /// /home/products/slug/categoryId
  get homeUrl() {
    return ['/home/products', this.slug, this.category.CategoryId];
  }

  ///store/admin/category/${categoryId}
  get adminUrl() {
    return ['/store/admin/category', this.category.CategoryId];
  }

  openEditCategory() {
    this.showModal = true;
  }

  save() {
    // Implementation for saving category changes
    console.log('Save category:', this.category);
    this.showModal = false;
    this.onCategoryUpdated.emit(this.category);
  }

  deleteCategory(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    const categoryName = this.category.Name;
    
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    this.isDeleting = true;
    
    this.categoryService
      .delete(this.category.CategoryId)
      .pipe(
        catchError((error) => {
          console.error('Error deleting category:', error);
          alert('Failed to delete category. Please try again.');
          return of(null);
        }),
        finalize(() => this.isDeleting = false)
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.onCategoryDeleted.emit(this.category.CategoryId);
          }
        }
      });
  }
}
