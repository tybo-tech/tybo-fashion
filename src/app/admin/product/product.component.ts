import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from 'src/constants/Constants';
import { Product, ProductVariationPayload } from 'src/models/Product';
import { User } from 'src/models/user.model';
import {
  Category,
  CategoryService,
  initCategory,
} from 'src/services/category.service';
import { ChipService } from 'src/services/ChipService';
import { MeasurementsService } from 'src/services/measurements.service';
import { OtherInfoService } from 'src/services/other-info.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';
import {
  initVariation,
  initVariationOption,
  Variation,
  VariationService,
} from 'src/services/variation.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductComponent implements OnInit {
  productId = '';
  categoryId = '';
  pageType = '';
  prevLink = '/store/admin/products';
  product?: Product;
  user?: User;
  show_upload = false;
  categories?: Category[];
  Constants = Constants;
  variations: Variation[] = [];
  constructor(
    private productService: ProductService,
    private uxService: UxService,
    private router: Router,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private variationService: VariationService,
    private categoryService: CategoryService,
    private measurementService: MeasurementsService,
    public chipService: ChipService
  ) {
    this.activatedRoute.params.subscribe((r) => {
      this.productId = r['id'];
      this.categoryId = r['categoryId'];
      this.pageType = r['pageType'];
      if (this.categoryId && !this.pageType) {
        this.prevLink = `/store/admin/category/${this.categoryId}`;
      }
      if (this.categoryId && this.pageType) {
        this.prevLink = `/store/admin/${this.pageType}/${this.categoryId}/`;
      }
      this.user = this.userService.getUser;
      this.user = this.userService.getUser;
      if (this.productId === 'add' && this.user) {
        this.product = productService.initProduct();
        this.product.CreateUserId = this.user.UserId;
        this.product.CompanyId = this.user.CompanyId;
        console.log(this.product);
      } else {
        this.get();
      }
    });
  }
  ngOnInit(): void {
    this.getVariations();
    this.getCategories();
  }

  getVariations() {
    this.user &&
      this.variationService
        .listByCompanyId(this.user.CompanyId)
        .subscribe((data) => {
          if (data && data.length) {
            this.variations = data;
          }
        });
  }

  getCategories() {
    this.user &&
      this.categoryService
        .listByCompanyId(this.user.CompanyId, 'yes')
        .subscribe((data) => {
          if (data && data.Categories && data.Categories.length) {
            this.categories = data.Categories;
          }
        });
  }

  get() {
    if (this.user) {
      this.productService
        .getProduct(this.productId, 'yes')
        .subscribe((data) => {
          if (data && data.ProductId) {
            this.product = data;
            this.validateProduct();
            this.productService.next(this.product);
          }
        });
    }
  }
  validateProduct() {
    // if (!this.product) return;
    // if (!this.product.AllowMeasurements) this.product.AllowMeasurements = 'No';
  }
  onSubmit(): void {
    // Object assign
    if (!this.product) return;
    this.product.ProductVariationPayload = this.prepareVariationSavePayload();
    this.productService.save(this.product).subscribe((data) => {
      if (data && data.ProductId) {
        this.router.navigate([this.prevLink]);
      }
    });
  }

  updateProductCategories(newCategories: string[]) {
    if (this.product) {
      // this.product.Categories = newCategories;
    }
  }
  fileUploaded(files: string[]) {
    console.log(files);
    if (!this.product) return;
    if (!this.product.Images) this.product.Images = [];
    this.product.Images = this.product.Images.concat(files);
    this.show_upload = false;
    if (!this.product.FeaturedImageUrl && this.product.Images.length) {
      this.product.FeaturedImageUrl = this.product.Images[0];
    }
    // this.saveAndStay();
    this.uxService.show_toast('Image uploaded', 'Success');
  }

  onImageRemoved(images: string[]) {
    if (!this.product) return;
    this.product.Images = images;
    this.uxService.show_toast('Image removed', 'Success');
    // this.saveAndStay();
  }
  onImageSetAsMain(image: string) {
    console.log(image);

    if (!this.product) return;
    this.product.FeaturedImageUrl = image;
    // reorder images, make sure the main image is the first
    this.product.Images = this.product.Images.filter((i) => i !== image);
    this.product.Images.unshift(image);
    this.uxService.show_toast('Main image updated', 'Success');
    // this.saveAndStay();
  }
  // saveAndStay() {
  //   this.product &&
  //     this.product.CreateDate &&
  //     this.productService.save(this.product).subscribe();
  // }
  onDelete() {
    this.uxService.show_confirm(
      'Delete Product',
      'This action cannot be undone. Are you sure you want to delete this product?'
    );
    this.uxService.$confirm.subscribe((isConfirmed) => {
      isConfirmed &&
        this.product &&
        this.productService
          .deleteProduct(this.product.ProductId)
          .subscribe((data) => {
            this.uxService.show_toast('Product deleted', 'Success');
            this.router.navigate([this.prevLink]);
          });
    });
  }

  onCategorySelectionChange(selection: string[], parent: Category) {
    if (!this.product) return;
    // Remove existing categories under this parent
    this.product.Categories =
      this.product.Categories?.filter(
        (c) => c.ParentId !== parent.CategoryId
      ) || [];

    // Add new selected ones
    const selectedChildren = (parent.Children || []).filter((child) =>
      selection.includes(child.CategoryId)
    );

    this.product.Categories.push(...selectedChildren);
    // this.saveAndStay();
  }

  onVariationSelectionChange(selection: string[], variation: Variation) {
    if (!this.product) return;
    if (!this.product.Variations) this.product.Variations = [];

    const existing = this.product.Variations.find(
      (v) => v.VariationId === variation.VariationId
    );

    if (existing) {
      existing.Options = (variation.Options || []).filter((opt) =>
        selection.includes(opt.VariationOptionId.toString())
      );
    } else {
      const newVar: Variation = {
        ...variation,
        Options: (variation.Options || []).filter((opt) =>
          selection.includes(opt.VariationOptionId.toString())
        ),
      };
      this.product.Variations.push(newVar);
    }
    console.log(this.product.Variations);

    // this.saveAndStay();
  }

  prepareVariationSavePayload(): ProductVariationPayload[] {
    return this.variations
      .map((v): ProductVariationPayload | null => {
        const selected = this.chipService.selectedVariationIds(
          v.VariationId,
          this.product!
        );
        if (!selected.length) return null;
        return {
          VariationId: v.VariationId,
          OptionIds: selected.map((id) => +id),
        };
      })
      .filter((x): x is ProductVariationPayload => x !== null); // ✅ proper narrowing
  }

  onNewSubCategoryAdded(name: string, parentCategory: Category) {
    if (!this.user || !this.user.CompanyId) return;

    const cat = initCategory(
      this.user.CompanyId,
      this.user.UserId,
      name,
      parentCategory.CategoryId
    );

    this.categoryService.save(cat).subscribe((data) => {
      if (this.product && data && data.CategoryId) {
        if (!parentCategory.Children) parentCategory.Children = [];
        parentCategory.Children = [...parentCategory.Children, data];
        if (!this.product.Categories) this.product.Categories = [];
        this.product.Categories.push(data);
        this.uxService.show_toast('Category added', 'Success');
      }
    });
  }

  onNewVariationAdded(name: string, variation: Variation) {
    const newVariation = initVariationOption(
      variation.VariationId,
      this.user?.UserId || ''
    );
    newVariation.Name = name;
    this.variationService.saveOption(newVariation).subscribe((data) => {
      if (data && data.VariationOptionId) {
        if (!variation.Options) variation.Options = [];
        const check = variation.Options.find(
          (opt) => +opt.VariationOptionId === +data.VariationOptionId
        );
        if (!check) variation.Options = [...variation.Options, data];

        // Automatically select the new option
        if (!this.product) return;
        if (!this.product.Variations) this.product.Variations = [];
        const existing = this.product.Variations.find(
          (v) => v.VariationId === variation.VariationId
        );
        if (!existing) {
          this.product.Variations.push({
            ...variation,
            Options: [data],
          });
        }else{
          if(!existing.Options) existing.Options = [];
          existing.Options = [...existing.Options, data];
        }
        this.uxService.show_toast('Variation added', 'Success');
      }
    });
  }

  trackByCategory(index: number, category: Category) {
    return category.CategoryId;
  }
  trackByVariation(index: number, variation: Variation): number {
    return variation.VariationId;
  }
}
