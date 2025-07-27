import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { JobsComponent } from './jobs/jobs.component';
import { JobComponent } from './job/job.component';
import { ProductComponent } from './product/product.component';
import { ProductsComponent } from './products/products.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerComponent } from './customer/customer.component';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryComponent } from './category/category.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsMenuComponent } from './settings-menu/settings-menu.component';
import { JobCardsComponent } from './job-cards/job-cards.component';
import { DiscountsComponent } from './discounts/discounts/discounts.component';
import { DiscountComponent } from './discounts/discount/discount.component';
import { CollectionsComponent } from './collections/collections.component';
import { CollectionComponent } from './collection/collection.component';
import { WorkGalleryComponent } from './work-gallery/work-gallery.component';
import { EditWorkGalleryComponent } from './edit-work-gallery/edit-work-gallery.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'discounts',
        component: DiscountsComponent,
      },
      {
        path: 'discount/:id/:action',
        component: DiscountComponent,
      },

      {
        path: 'jobs',
        component: JobsComponent,
      },
      {
        path: 'jobs/:status',
        component: JobsComponent,
      },
      {
        path: 'job/:id',
        component: JobComponent,
      },
      {
        path: 'job/:id/:backTo',
        component: JobComponent,
      },
      {
        path: 'job-cards',
        component: JobCardsComponent,
      },
      {
        path: 'products',
        // component: ProductsComponent,
        component: AdminProductsComponent,
      },
      {
        path: 'products/:categoryId',
        // component: ProductsComponent,
        component: AdminProductsComponent,
      },
      {
        path: 'product/:id',
        component: ProductComponent,
      },
      {
        path: 'product/:id/:categoryId',
        component: ProductComponent,
      },
      {
        path: 'product/:id/:categoryId/:pageType',
        component: ProductComponent,
      },
      {
        path: 'invoice/:id',
        component: InvoiceComponent,
      },
      {
        path: 'customers',
        component: CustomersComponent,
      },
      {
        path: 'customer/:id',
        component: CustomerComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'user/:id',
        component: UserComponent,
      },
      {
        path: 'categories',
        component: CategoriesComponent,
      },
      {
        path: 'categories/:categoryId',
        component: CategoriesComponent,
      },
      {
        path: 'category/:categoryId',
        component: CategoryComponent,
      },
      {
        path: 'collections',
        component: CollectionsComponent,
      },
      {
        path: 'collection/:id',
        component: CollectionComponent,
      },
      {
        path: 'settings',
        component: SettingsMenuComponent,
      },
      {
        path: 'work-gallery',
        component: WorkGalleryComponent,
      },
      {
        path: 'edit-work-gallery/:id',
        component: EditWorkGalleryComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
