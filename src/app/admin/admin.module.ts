import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { JobsComponent } from './jobs/jobs.component';
import { JobComponent } from './job/job.component';
import { ProductComponent } from './product/product.component';
import { ProductsComponent } from './products/products.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerComponent } from './customer/customer.component';
import { AdminComponent } from './admin/admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { TagsComponent } from './tags/tags.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryComponent } from './category/category.component';
import { JobItemsComponent } from './job-items/job-items.component';
import { JobItemComponent } from './job-item/job-item.component';
import { JobItemFormComponent } from './job-item-form/job-item-form.component';
import { SettingsComponent } from './settings/settings.component';
import { UploadInputComponent } from './upload-input/upload-input.component';
import { ImageWidgetComponent } from './image-widget/image-widget.component';
import { SettingsMenuComponent } from './settings-menu/settings-menu.component';
import { CompanyContactInfoComponent } from './company-contact-info/company-contact-info.component';
import { BannersSettingsComponent } from './banners-settings/banners-settings.component';
import { TestimaonailsSettingsComponent } from './testimaonails-settings/testimaonails-settings.component';
import { AboutUsSettingsComponent } from './about-us-settings/about-us-settings.component';
import { CompanyAddressSettingsComponent } from './company-address-settings/company-address-settings.component';
import { SocailSettingsComponent } from './socail-settings/socail-settings.component';
import { StatSettingsComponent } from './stat-settings/stat-settings.component';
import { AdminQtyComponent } from './admin-qty/admin-qty.component';
import { AdminJobTotalComponent } from './admin-job-total/admin-job-total.component';
import { SelectJobShippingComponent } from './select-job-shipping/select-job-shipping.component';
import { AdminCommentComponent } from './admin-comment/admin-comment.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { AdminModalHeaderComponent } from './admin-modal-header/admin-modal-header.component';
import { StringOptionPickerComponent } from './string-option-picker/string-option-picker.component';
import { SystemSizesComponent } from './system-sizes/system-sizes.component';
import { SystemMeasurementsComponent } from './system-measurements/system-measurements.component';
import { AdminMeasurementsComponent } from './admin-measurements/admin-measurements.component';
import { JobPaymentsComponent } from './job-payments/job-payments.component';
import { OrderSettingsComponent } from './order-settings/order-settings.component';
import { AdminInputComponent } from './admin-input/admin-input.component';
import { ListBreadComponent } from './list-bread/list-bread.component';
import { AddUserComponent } from './add-user/add-user.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import { UploadComponent } from './upload/upload.component';
import { ImageGridComponent } from './image-grid/image-grid.component';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';
import { AddJobComponent } from './add-job/add-job.component';
import { CustomerListViewComponent } from './customer-list-view/customer-list-view.component';
import { BackComponent } from './back/back.component';
import { UserShiftsComponent } from './user-shifts/user-shifts.component';
import { AddShiftComponent } from './add-shift/add-shift.component';
import { MeasurementPipePipe, UserPipePipe } from './user-pipe.pipe';
import { JobCardsComponent } from './job-cards/job-cards.component';
import { JobCardComponent } from './job-card/job-card.component';
import { AdminSelectSizeComponent } from './admin-select-size/admin-select-size.component';
import { AutofocusDirective } from './autofocus.directive';
import { BrandingComponent } from './settings/branding/branding.component';
import { DiscountsComponent } from './discounts/discounts/discounts.component';
import { DiscountComponent } from './discounts/discount/discount.component';
import { DiscountAddModalComponent } from './discounts/discount-add-modal/discount-add-modal.component';
import { CollectionsComponent } from './collections/collections.component';
import { CollectionComponent } from './collection/collection.component';
import { AddWidgetComponent } from './add-widget/add-widget.component';
import { AddProductsToCollectionComponent } from './add-products-to-collection/add-products-to-collection.component';
import { ProductFiltersAdminComponent } from './product-filters-admin/product-filters-admin.component';
import { FormModalComponent } from './form-modal/form-modal.component';
import { FloatAddComponent } from './float-add/float-add.component';
import { TrashComponent } from './trash/trash.component';
import { ListIconComponent } from './list-icon/list-icon.component';
import { WorkGalleryComponent } from './work-gallery/work-gallery.component';
import { EditWorkGalleryComponent } from './edit-work-gallery/edit-work-gallery.component';
import { CategoryCardComponent } from '../home/shop-v2/category-card/category-card.component';
import { CategorySectionComponent } from '../home/shop-v2/category-section/category-section.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { ProductCardComponent } from '../home/product-card/product-card.component';
import { HeroHeaderComponent } from '../home/shop-v2/hero-header/hero-header.component';
import { ProductVariationSelectorComponent } from './product-variation-selector/product-variation-selector.component';
import { ProductCategorySelectorComponent } from './product-category-selector/product-category-selector.component';
import { ChipPickerComponent } from './chip-picker/chip-picker.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { CategoryFormComponent } from './shared/category-form/category-form.component';

@NgModule({
  declarations: [
    DashboardComponent,
    JobsComponent,
    JobComponent,
    ProductComponent,
    ProductsComponent,
    InvoiceComponent,
    CustomersComponent,
    CustomerComponent,
    AdminComponent,
    TagsComponent,
    ProductFormComponent,
    UsersComponent,
    UserComponent,
    CategoriesComponent,
    CategoryComponent,
    JobItemsComponent,
    JobItemComponent,
    JobItemFormComponent,
    SettingsComponent,
    UploadInputComponent,
    ImageWidgetComponent,
    SettingsMenuComponent,
    CompanyContactInfoComponent,
    BannersSettingsComponent,
    TestimaonailsSettingsComponent,
    AboutUsSettingsComponent,
    CompanyAddressSettingsComponent,
    SocailSettingsComponent,
    StatSettingsComponent,
    AdminQtyComponent,
    AdminJobTotalComponent,
    SelectJobShippingComponent,
    AdminCommentComponent,
    CustomerFormComponent,
    AdminModalHeaderComponent,
    StringOptionPickerComponent,
    SystemSizesComponent,
    SystemMeasurementsComponent,
    AdminMeasurementsComponent,
    JobPaymentsComponent,
    OrderSettingsComponent,
    AdminInputComponent,
    ListBreadComponent,
    AddUserComponent,
    UploadComponent,
    ImageGridComponent,
    FilterPanelComponent,
    AddJobComponent,
    CustomerListViewComponent,
    BackComponent,
    UserShiftsComponent,
    AddShiftComponent,
    UserPipePipe,
    JobCardsComponent,
    JobCardComponent,
    AdminSelectSizeComponent,
    AutofocusDirective,
    BrandingComponent,
    DiscountsComponent,
    DiscountComponent,
    DiscountAddModalComponent,
    CollectionsComponent,
    CollectionComponent,
    AddWidgetComponent,
    AddProductsToCollectionComponent,
    ProductFiltersAdminComponent,
    FormModalComponent,
    FloatAddComponent,
    TrashComponent,
    MeasurementPipePipe,
    ListIconComponent,
    WorkGalleryComponent,
    EditWorkGalleryComponent,
    AdminProductsComponent,
    ProductVariationSelectorComponent,
    ProductCategorySelectorComponent,
    ChipPickerComponent,
    CheckboxComponent,
    CategoryFormComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CategoryCardComponent,
    CategorySectionComponent,
    ProductCardComponent,
    HeroHeaderComponent,
  ],
  providers: [
    NgxImageCompressService, // Add the service to providers
  ],
})
export class AdminModule {}
