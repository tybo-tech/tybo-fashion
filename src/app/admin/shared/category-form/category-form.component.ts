import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';
import { Category, CategoryService } from 'src/services/category.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

export interface CategoryFormData {
  Name: string;
  Description: string;
  ImageUrl?: string;
  ParentId?: string;
}

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
})
export class CategoryFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) category!: Category; // If provided, we're editing; if not, we're adding
  @Input() parentId?: string; // For adding subcategories
  @Input() showModal = false;
  @Input() modalTitle = 'Category';
  @Input() submitButtonText = 'Save';

  @Output() onSave = new EventEmitter<Category>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() showModalChange = new EventEmitter<boolean>();

  // UI State
  isSubmitting = false;
  imagePreview?: string;
  showUpload = false;

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
    private uxService: UxService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEditMode(): boolean {
    return !!this.category;
  }

  get user() {
    return this.userService.getUser;
  }

  onFileSelected(event: any): void {
    // This method is replaced by the upload component
    // Open the upload component instead
    this.showUpload = true;
  }

  onUploadComplete(uploadedUrls: string[]): void {
    if (uploadedUrls.length > 0) {
      this.imagePreview = uploadedUrls[0]; // Use the first uploaded image
      this.category.ImageUrl = uploadedUrls[0];
    }
    this.showUpload = false;
  }

  onUploadClosed(): void {
    this.showUpload = false;
  }

  removeImage(): void {
    this.imagePreview = undefined;
    this.category.ImageUrl = '';
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isSubmitting = true;

    this.categoryService
      .save(this.category)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error saving category:', error);
          this.handleError('Failed to save category');
          return of(null);
        }),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (savedCategory) => {
          if (savedCategory) {
            this.handleSuccess();
            this.onSave.emit(savedCategory);
          }
        },
      });
  }

  onClose(): void {
    this.showModalChange.emit(false);
    this.onCancel.emit();
  }

  private isFormValid(): boolean {
    return this.category.Name.trim().length > 0;
  }

  private handleSuccess(): void {
    const message = this.isEditMode
      ? 'Category updated successfully'
      : 'Category created successfully';
    this.uxService.show_toast(message, 'Success');
    this.resetForm();
  }

  private handleError(message: string): void {
    console.error('Category Form Error:', message);
    this.uxService.show_toast(message, 'Error');
  }

  private resetForm(): void {
    this.category.Name = '';
    this.category.Description = '';
    this.category.ImageUrl = '';
    this.category.ParentId = this.parentId || '';
    this.imagePreview = undefined;
  }
}
