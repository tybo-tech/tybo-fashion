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
import { NewCustomerComponent } from './new-customer/new-customer.component';
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
import { JobItemPageComponent } from './job-item-page/job-item-page.component';
import { JobsStatusRedirectComponent } from './jobs/jobs-status-redirect.component';
import { JobEditorComponent } from './job-editor/job-editor.component';
import { unsavedChangesGuard } from './job-editor/unsaved-changes.guard';
import { garmentUnsavedChangesGuard } from './job-item-page/garment-unsaved-changes.guard';
import {
  jobIdRouteMatcher,
  jobStatusSlugMatcher,
} from './jobs/job-route-matching';

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

      // ── Jobs (Sprint 5 §1 route map — locked) ──────────────────────────
      {
        path: 'jobs',
        component: JobsComponent,
      },
      {
        // UUID-only: /jobs/:jobId can never collide with a status slug.
        matcher: jobIdRouteMatcher,
        component: JobComponent,
      },
      {
        path: 'jobs/:jobId/edit',
        component: JobEditorComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'jobs/:jobId/garments/new',
        component: JobItemPageComponent,
        canDeactivate: [garmentUnsavedChangesGuard],
      },
      {
        path: 'jobs/:jobId/garments/:garmentId',
        component: JobItemPageComponent,
        canDeactivate: [garmentUnsavedChangesGuard],
      },
      {
        // Known status slugs only — everything else falls to jobs/**.
        matcher: jobStatusSlugMatcher,
        component: JobsStatusRedirectComponent,
      },
      {
        // Unknown /jobs/* segments (e.g. an unknown status slug or a
        // mistyped job id) land back on the plain jobs list.
        path: 'jobs/**',
        redirectTo: 'jobs',
      },

      // ── Legacy job routes → Sprint 5 hierarchy ─────────────────────────
      {
        path: 'job/:id',
        redirectTo: 'jobs/:id',
        pathMatch: 'full',
      },
      {
        // :backTo carries no garment id — the overview is canonical.
        path: 'job/:id/:backTo',
        redirectTo: 'jobs/:id',
        pathMatch: 'full',
      },
      {
        path: 'job/:jobId/items/new',
        redirectTo: 'jobs/:jobId/garments/new',
        pathMatch: 'full',
      },
      {
        path: 'job/:jobId/items/:jobItemId/edit',
        redirectTo: 'jobs/:jobId/garments/:jobItemId',
        pathMatch: 'full',
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
        path: 'customers/new',
        redirectTo: 'customers/new/basic',
        pathMatch: 'full',
      },
      {
        path: 'customers/new/:step',
        component: NewCustomerComponent,
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
