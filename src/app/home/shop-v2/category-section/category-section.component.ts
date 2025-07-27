import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Category, CategoryService } from 'src/services/category.service';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize, catchError, of } from 'rxjs';

@Component({
  selector: 'app-category-section',
  templateUrl: './category-section.component.html',
  styleUrls: ['./category-section.component.scss'],
  standalone: true,
  imports: [CommonModule, CategoryCardComponent, RouterModule,FormsModule],
})
export class CategorySectionComponent {
  @Input() category!: Category;
  @Input() slug = '';
  @Input() isAdmin = false;
  @Output() onCategoryDeleted = new EventEmitter<string>();
  @Output() onCategoryUpdated = new EventEmitter<Category>();

  isDeleting = false;

  constructor(private categoryService: CategoryService) {}

  get children() {
    return this.category.Children?.slice(0, 4) || [];
  }

  get link() {
    return this.isAdmin
     ? this.adminUrl : this.homeUrl;
  }

  ///store/admin/categories/${this.category.CategoryId}
  get adminUrl() {
    return `/store/admin/category/${this.category.CategoryId}`;
  }

  get homeUrl() {
    return `/home/collections/${this.slug}/${this.category.CategoryId}`;
  }

  deleteCategory(): void {
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

  onChildCategoryDeleted(categoryId: string): void {
    // Remove the deleted child from the current category's children
    if (this.category.Children) {
      this.category.Children = this.category.Children.filter(
        child => child.CategoryId !== categoryId
      );
    }
    // Emit the deletion event up to parent
    this.onCategoryDeleted.emit(categoryId);
  }

  onChildCategoryUpdated(updatedCategory: Category): void {
    // Update the child category in the current category's children
    if (this.category.Children) {
      const index = this.category.Children.findIndex(
        child => child.CategoryId === updatedCategory.CategoryId
      );
      if (index !== -1) {
        this.category.Children[index] = updatedCategory;
      }
    }
    // Emit the update event up to parent
    this.onCategoryUpdated.emit(updatedCategory);
  }
}
