import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';
import { ICollection, initCategory } from 'src/models/Category';
import {
  initOtherInfo,
  OTHER_TYPES,
  OtherInfo,
} from 'src/models/other-info.model';
import {
  Category,
  CategoryService,
  initCategory as initCategoryService,
} from 'src/services/category.service';
import { OtherInfoService } from 'src/services/other-info.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

interface CategoryUIState {
  isLoading: boolean;
  error: string | null;
  isAddingCategory: boolean;
  searchQuery: string;
  showAddCategoryModal: boolean;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit, OnDestroy {
  // Properties
  user = this.userService.getUser;
  categoryId = '';
  categories: Category[] = [];
  category?: Category;
  filteredCategories: Category[] = [];
  newCategoryName = '';

  // UI State
  uiState: CategoryUIState = {
    isLoading: false,
    error: null,
    isAddingCategory: false,
    searchQuery: '',
    showAddCategoryModal: false,
  };

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private uxService: UxService,
    private productService: ProductService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe({
      next: (params) => {
        this.categoryId = params['categoryId'] || '';
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error loading route params:', error);
        this.handleError('Failed to load page parameters');
      },
    });
  }

  /**
   * Load categories with proper error handling and loading states
   */
  loadCategories(): void {
    if (!this.user?.CompanyId) {
      this.handleError('User company information not available');
      return;
    }

    this.setLoadingState(true);

    this.categoryService
      .listByCompanyId(this.user.CompanyId, 'yes', this.categoryId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading categories:', error);
          this.handleError('Failed to load categories');
          return of(null);
        }),
        finalize(() => this.setLoadingState(false))
      )
      .subscribe({
        next: (data) => {
          if (data?.Categories) {
            this.categories = data.Categories;
            this.filteredCategories = [...this.categories];
          } else {
            this.categories = [];
            this.filteredCategories = [];
          }
        },
      });
  }

  /**
   * Get category and its children with proper error handling
   */
  getCategoryAndChildren(): void {
    if (!this.user?.CompanyId) {
      this.handleError('User company information not available');
      return;
    }

    this.setLoadingState(true);

    this.categoryService
      .getCategoryAndChildren(this.user.CompanyId, this.categoryId, 'yes')
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading category and children:', error);
          this.handleError('Failed to load category details');
          return of(null);
        }),
        finalize(() => this.setLoadingState(false))
      )
      .subscribe({
        next: (data) => {
          if (data?.Children) {
            this.categories = data.Children;
            this.filteredCategories = [...this.categories];
            this.category = data;
          }
        },
      });
  }

  /**
   * Add a new category with proper validation and feedback
   */
  addCategory(name: string): void {
    // Validation
    if (!name?.trim()) {
      this.handleError('Category name is required');
      return;
    }

    if (!this.user?.CompanyId || !this.user?.UserId) {
      this.handleError('User information not available');
      return;
    }

    // Check for duplicate names
    if (
      this.categories.some(
        (cat) => cat.Name.toLowerCase() === name.toLowerCase()
      )
    ) {
      this.handleError('A category with this name already exists');
      return;
    }

    this.uiState.isAddingCategory = true;
    this.clearError();

    // Create new category using the service initializer
    const newCategory = initCategoryService(
      this.user.CompanyId,
      this.user.UserId,
      name.trim(),
      this.categoryId
    );

    this.categoryService
      .save(newCategory)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error adding category:', error);
          this.handleError('Failed to add category');
          return of(null);
        }),
        finalize(() => (this.uiState.isAddingCategory = false))
      )
      .subscribe({
        next: (data) => {
          if (data?.CategoryId) {
            this.showSuccess('Category added successfully');
            this.loadCategories(); // Refresh the list
            // Navigate to the new category's detail page
            this.router.navigate(['/store/admin/category', data.CategoryId]);
          }
        },
      });
  }

  /**
   * Delete a category with confirmation
   */
  deleteCategory(categoryId: string, categoryName: string): void {
    if (
      !confirm(
        `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    this.setLoadingState(true);

    this.categoryService
      .delete(categoryId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error deleting category:', error);
          this.handleError('Failed to delete category');
          return of(null);
        }),
        finalize(() => this.setLoadingState(false))
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.showSuccess('Category deleted successfully');
            this.loadCategories(); // Refresh the list
          }
        },
      });
  }

  /**
   * Navigate to category details
   */
  editCategory(categoryId: string): void {
    this.router.navigate(['/store/admin/category', categoryId]);
  }

  /**
   * Refresh categories list
   */
  refreshCategories(): void {
    this.loadCategories();
  }
  /**
   * Search/filter categories
   */
  searchCategories(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target?.value || '';
    this.uiState.searchQuery = query;

    if (!query.trim()) {
      this.filteredCategories = [...this.categories];
      return;
    }

    const searchTerm = query.toLowerCase();
    this.filteredCategories = this.categories.filter(
      (category) =>
        category.Name.toLowerCase().includes(searchTerm) ||
        category.Description?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Handle add category form submission
   */
  onAddCategory(form: any): void {
    if (form.valid && this.newCategoryName.trim()) {
      this.addCategory(this.newCategoryName.trim());
      this.newCategoryName = '';
      this.uiState.showAddCategoryModal = false;
    }
  }

  /**
   * Handle add category form save (for shared component)
   */
  onAddCategorySave(newCategory: Category): void {
    this.categories.push(newCategory);
    this.filteredCategories = [...this.categories];
    this.uiState.showAddCategoryModal = false;
    this.showSuccess('Category added successfully');
  }

  /**
   * Handle add category form cancel (for shared component)
   */
  onAddCategoryCancel(): void {
    this.uiState.showAddCategoryModal = false;
  }

  /**
   * Handle category deletion from child components
   */
  onCategoryDeleted(categoryId: string): void {
    // Remove the deleted category from the current list
    this.categories = this.categories.filter(
      (cat) => cat.CategoryId !== categoryId
    );
    this.filteredCategories = this.filteredCategories.filter(
      (cat) => cat.CategoryId !== categoryId
    );
    this.showSuccess('Category deleted successfully');
  }

  /**
   * Handle category updates from child components
   */
  onCategoryUpdated(updatedCategory: Category): void {
    // Update the category in the current list
    const index = this.categories.findIndex(
      (cat) => cat.CategoryId === updatedCategory.CategoryId
    );
    if (index !== -1) {
      this.categories[index] = updatedCategory;
    }

    const filteredIndex = this.filteredCategories.findIndex(
      (cat) => cat.CategoryId === updatedCategory.CategoryId
    );
    if (filteredIndex !== -1) {
      this.filteredCategories[filteredIndex] = updatedCategory;
    }

    this.showSuccess('Category updated successfully');
  }

  /**
   * TrackBy function for category list
   */
  trackByCategory(index: number, category: Category): string {
    return category.CategoryId;
  }

  // Helper methods
  private setLoadingState(isLoading: boolean): void {
    this.uiState.isLoading = isLoading;
    this.uxService.load(isLoading);
  }

  private handleError(message: string): void {
    this.uiState.error = message;
    this.uxService.load(false);
  }

  private clearError(): void {
    this.uiState.error = null;
  }

  private showSuccess(message: string): void {
    // You might want to implement a toast service here
    console.log('Success:', message);
    this.clearError();
  }

  initCategory() {
    if (!this.user?.CompanyId || !this.user?.UserId) {
      this.handleError('User information not available');
      return;
    }
    this.category = initCategoryService(
      this.user.CompanyId,
      this.user.UserId,
      '',
      this.categoryId
    );
    this.showAddCategoryModal = true; 
  }

  // Getters for template
  get isLoading(): boolean {
    return this.uiState.isLoading;
  }

  get hasError(): boolean {
    return !!this.uiState.error;
  }

  get errorMessage(): string | null {
    return this.uiState.error;
  }

  get isAddingCategory(): boolean {
    return this.uiState.isAddingCategory;
  }

  get hasCategories(): boolean {
    return this.filteredCategories.length > 0;
  }

  get searchQuery(): string {
    return this.uiState.searchQuery;
  }

  get showAddCategoryModal(): boolean {
    return this.uiState.showAddCategoryModal;
  }

  set showAddCategoryModal(value: boolean) {
    this.uiState.showAddCategoryModal = value;
  }
}
