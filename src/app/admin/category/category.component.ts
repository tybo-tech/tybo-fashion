import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';
import { HeroHeaderData } from 'src/models/HeroHeaderData';
import { Category, CategoryService, initCategory } from 'src/services/category.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit, OnDestroy {

  categoryId = '';
  prevPage: string = 'Categories';
  prevLink: string = '/store/admin/categories';
  category?: Category;
  heroHeaderData?: HeroHeaderData;
  loading = false;
  isDeleting = false;
  showEditModal = false;

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();
  showAddCategoryModal: boolean = false;
  newCatergory?: Category;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private userService: UserService,
    private uxService: UxService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (params) => {
          this.categoryId = params['categoryId'] || '';
          this.getCategoryAndChildren();
        },
        error: (error) => {
          console.error('Error loading route params:', error);
          this.handleError('Failed to load page parameters');
        }
      });
  }
  get userId() {
    return this.userService.getUser?.UserId;
  }

  get companyId() {
    return this.userService.getUser?.CompanyId;
  }

  get company() {
    return this.category?.Company;
  }

  get user(){
    return this.userService.getUser;
  }

  /**
   * Load category and its children with proper error handling
   */
  getCategoryAndChildren(): void {
    if (!this.companyId || !this.categoryId) {
      this.handleError('Required information not available');
      return;
    }

    this.loading = true;
    this.uxService.load(true);

    this.categoryService
      .getCategoryAndChildren(this.companyId, this.categoryId, 'yes')
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading category:', error);
          this.handleError('Failed to load category details');
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.uxService.load(false);
        })
      )
      .subscribe({
        next: (data) => {
          if (data?.CategoryId) {
            this.category = data;
            this.setHeroHeaderData();
          } else {
            this.handleError('Category not found');
          }
        }
      });
  }

  /**
   * Set hero header data for the category
   */
  private setHeroHeaderData(): void {
    if (!this.category) return;

    this.heroHeaderData = {
      title: this.category.Name,
      description: this.category.Description,
      image: this.category.ImageUrl ||
        'https://tybofashion.co.za/api/api/upload/uploads/-1738993039357.png',
      slug: '',
    };
  }

  /**
   * Delete the current category with confirmation
   */
  onDelete(): void {
    if (!this.category) return;

    const categoryName = this.category.Name;

    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    this.isDeleting = true;
    this.uxService.load(true);

    this.categoryService
      .delete(this.category.CategoryId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error deleting category:', error);
          this.handleError('Failed to delete category');
          return of(null);
        }),
        finalize(() => {
          this.isDeleting = false;
          this.uxService.load(false);
        })
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.showSuccess('Category deleted successfully');
            // Navigate back to categories list
            this.router.navigate(['/store/admin/categories']);
          }
        }
      });
  }

  /**
   * Handle category deletion from child components
   */
  onCategoryDeleted(categoryId: string): void {
    // Remove the deleted category from children
    if (this.category?.Children) {
      this.category.Children = this.category.Children.filter(
        child => child.CategoryId !== categoryId
      );
    }
    this.showSuccess('Category deleted successfully');
  }

  /**
   * Handle category updates from child components
   */
  onCategoryUpdated(updatedCategory: Category): void {
    // Update the child category in the current category's children
    if (this.category?.Children) {
      const index = this.category.Children.findIndex(
        child => child.CategoryId === updatedCategory.CategoryId
      );
      if (index !== -1) {
        this.category.Children[index] = updatedCategory;
      }
    }
    this.showSuccess('Category updated successfully');
  }

  /**
   * Refresh the category data
   */
  refreshCategory(): void {
    this.getCategoryAndChildren();
  }

  /**
   * Open edit modal for current category
   */
  openEditModal(): void {
    this.showEditModal = true;
  }

  /**
   * Handle category edit form save
   */
  onEditSave(updatedCategory: Category): void {
    // Update the current category
    this.category = { ...this.category, ...updatedCategory };
    this.setHeroHeaderData();
    this.showEditModal = false;
    this.showSuccess('Category updated successfully');
  }

  /**
   * Handle category edit form cancel
   */
  onEditCancel(): void {
    this.showEditModal = false;
  }

  /**
   * TrackBy function for category children list
   */
  trackByCategory(index: number, category: Category): string {
    return category.CategoryId;
  }

  // Helper methods
  private handleError(message: string): void {
    console.error('Category Error:', message);
    // You might want to implement a toast service here
    // alert(`Error: ${message}`);
  }

  private showSuccess(message: string): void {
    console.log('Success:', message);
    // You might want to implement a toast service here
  }


  initCategory() {
    if (!this.user?.CompanyId || !this.user?.UserId) {
      this.handleError('User information not available');
      return;
    }
    this.newCatergory = initCategory(
      this.user.CompanyId,
      this.user.UserId,
      '',
      this.categoryId
    );
    this.showAddCategoryModal = true;
  }

   /**
   * Handle add category form save (for shared component)
   */
  onAddCategorySave(newCategory: Category): void {
    this.showAddCategoryModal = false;
    this.showSuccess('Category added successfully');
  }

  /**
   * Handle add category form cancel (for shared component)
   */
  onAddCategoryCancel(): void {
    this.showAddCategoryModal = false;
    this.newCatergory = undefined

  }
}
