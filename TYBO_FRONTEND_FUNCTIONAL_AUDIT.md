# Tybo Fashion Frontend Functional Audit

Investigation-only audit of `tybo-fashion-mat` (Angular). No UI work performed; no source files changed. Evidence is cited by `file_path:line` throughout.

Source of truth for this audit:
- App shell: `src/app/app-routing.module.ts`, `src/app/app.module.ts`
- Home module + routes: `src/app/home/home.module.ts`, `src/app/home/home-routing.module.ts`
- Admin module + routes: `src/app/admin/admin.module.ts`, `src/app/admin/admin-routing.module.ts`
- Services: `src/services/*.ts`, models `src/models/*.ts`, constants `src/constants/*.ts`
- API endpoint implementations (for cross-reference only, **not** relied on for "confirmed usage"): `multi-vendor-api/api/**/*.php`

---

# 1. Executive summary

**What this application is.** `tybo-fashion-mat` is a **multi-vendor fashion marketplace platform**, not a single storefront. It bundles four experiences in one Angular app:

1. **Public storefront** — the Tybo Fashion marketing/home site (`/`, `TuiHomeComponent`) plus public shop pages for each designer company (`/:slug` → `MyShopBettaComponent`), product pages (`/product/:id`), collection/category browsing, work-gallery showcase, and "Explore Shops" (`/home/shops`).
2. **Customer portal** — account registration/login (`/home/sign-up`, `/home/sign-in`), profile modals (contact, address, password, measurements, orders, favourites), a cart modelled as a **Job** (`current__job` in localStorage), a 3-step checkout (delivery → customer → payment), PayFast redirection, bank-transfer proof upload, and order confirmation.
3. **Store admin portal** — a designer/company admin workspace at `/store/admin/*` (dashboard, jobs, job cards, customers, users, products, categories, discounts, work gallery, settings).
4. **Platform ("super") admin area** — `/super/admin/*` with companies, users, and image clean-up utilities. Mostly scaffolding; several sub-pages are empty stubs.

**Major functional areas discovered.**
- Multi-tenant cataloguing: companies (`Company`), categories (`Category`/`OtherInfo`), collections (`OtherInfo<ICollection>`), products with variation/option support and admin-pinned/featured flags.
- Cart / draft order → **Job** (online-shop) → invoice-numbered order → payment → job production workflow. **The `Job` entity is simultaneously the cart, the order, the invoice, and the production project.**
- Customer identity (self-registered `User` with `UserType = 'Customer'`), favourites stored in `User.Metadata.Favorites`.
- Bespoke fashion production: job items (garments), measurements capture/reuse, staff assignment on job items, job status lifecycle, job card printing.
- Payments: PayFast hosted POST (external) and manual bank transfer with proof-of-payment upload, payment journal on `Job.Metadata.payments`, paid/due amount tracking.
- Content/company settings: branding, about, testimonials, statistics, banners/slides, social links, order settings (invoice notes/announcement), system measurements, system sizes.

**Identifiable roles (implied, not enforced).**
- `Admin` (designer/store owner) — `Constants.Roles` `['Admin','Customer','Staff']`.
- `Staff` — member of an admin company, assignable to job items; can hold day/night shifts with rates.
- `Customer` — registered site user; can place online-shop orders and manage profile.
- Platform owner / "super admin" — hard-coded `Constants.Email` `mrnnmthembu@gmail.com` / `Constants.ContactPerson`; routes under `/super-admin`.
- "Guest" — unauthenticated visitor (public browsing only).
- No `RouteGuards` exist anywhere (`grep CanActivate/Guard` → no matches). All access control is **frontend-only UI-conditioning** plus whatever the PHP API enforces server-side.

**Main business workflows.**
1. Admin: create/edit products → organise into categories/collections → run shop → take job orders (from online cart or ad-hoc) → produce garments (job items) → capture payments → invoice/job card → ship/collect.
2. Customer: discover product → add to cart (Job) → checkout (delivery, contact, account, payment method/amount) → pay (PayFast or bank transfer) → receive confirmation emails (3 recipients) → track via profile → repeat order.
3. Platform: manage tenant companies and users; clean orphaned product images.

**Biggest areas of frontend orchestration that must move into backend commands.** Cart math (totals, discounts, paid/due, deposit half), invoice-number generation (`INV${count+1}` from a race-prone `job/count.php`), customer auto-creation on order, email dispatch on order success, discount application, job status transitions, and job→invoice/job-card relationships. Detail in §9.

---

## 2. Application map

Routing split:
- `''` → `HomeModule` (lazy) — `src/app/app-routing.module.ts:6-10`
- `'store/admin'` → `AdminModule` (lazy) — `src/app/app-routing.module.ts:11-15`
- `'**'` → `NotFoundComponent` (404) — `src/app/app-routing.module.ts:16-20`
- **No guards anywhere.** Access level for admin paths is "Authenticated — role not enforced" unless stated otherwise; the only enforcement is the admin shell rendering nothing without `user.Company` (`admin.component.html:1`) and post-login redirect logic.

| Route | Component/page | Access level | Guard/condition | Purpose | Main actions | Backend services/endpoints used | Notes |
| ----- | -------------- | ------------ | --------------- | ------- | ------------ | ------------------------------- | ----- |
| `/` | `TuiHomeComponent` (home-routing.module.ts:47-50) | Public | none | Marketing homepage (Tybo platform) | "Explore Shops", "Join as a Designer" | `otherInfo.categories('80edddf9-...')`, subscribes to `productService.$products` (state) | `IndexComponent` (old home) is commented out in routes; `LandingComponent` only reachable via `IndexComponent`. Hardcoded tenant GUID used for categories. |
| `/home` | `TuiHomeComponent` | Public | none | Same as `/` | — | — | Duplicate route alias. |
| `/:id` | `MyShopBettaComponent` (home-routing.module.ts:57-82) | Public | none | Company storefront page | Share, WhatsApp consultation, browse products/categories/slides/work gallery | `shopService.getShop({ShopId,...})`; work gallery via `otherInfo.workGallery`; companyInfo | `MyShopComponent` + nested children are commented out. Uses route param `id` as `ShopId` (slug or id). |
| `/product/:productId` | `ProductBettaComponent` (home-routing.module.ts:84-86) | Public | none | Product detail | Like/favourite, share, size/quantity, add-to-cart (Job), WhatsApp custom order | `productService.getProduct`; `jobService.add_to_cart` (local); `collectionService.collections`; `userService.is_liked/on_like` (user/save.php) | Custom products (IsJustInTime==='Custom') show WhatsApp CTA instead of cart. `ProductDetailsComponent` (legacy) not routed. |
| `/home/checkout` | `CheckoutComponent` (home-routing.module.ts:87-90) | Authenticated (implied) | none | Checkout step: delivery method + contact + order summary | update delivery, apply promo, save user | `jobService.update_delivery`, `update_cart`, `fetchDiscountCode` (discounts/get-by-code.php), `userService.save` | Requires `job` from localStorage; no route guard — deep-linking with no cart shows blank page. |
| `/home/cart` | `CartPageComponent` (home-routing.module.ts:92-94) | Public | none | Cart page (Job items) | change qty, remove item, checkout modal | `jobService` local state only | |
| `/home/payments` `/home/payments/:id` | `PaymentsComponent` (home-routing.module.ts:96-102) | Authenticated (implied) | none | Payment step: amount, method, PayFast/bank, place order | payment amount (full/deposit), method (payfast/bank), upload proof, place_order | `jobService.count`; `jobService.place_order`; `userService.draft_order` (restore draft); uploads via `upload` | `:id` loads draft order from `user/draft-order.php`. |
| `/home/order-successful/:id` | `OrderSuccessfulComponent` (home-routing.module.ts:104-106) | Public | none | Order confirmation | view items, continue shopping | `jobService.getjob`; `OrderEmailHelper` → `emailService.send` (mail.tybofashion.co.za) | Emails fired from this page (not at place-order) — **candidate to move to a backend command**. |
| `/home/shops` | `ShopsComponent` (home-routing.module.ts:109-111) | Public | none | Explore shops directory | visit shop | `shopService.active` (company/active.php) | |
| `/home/sign-in`, `/home/sign-in/:returnTo` | `SignInComponent` (home-routing.module.ts:113-119) | Public | none | Login | login, redirect (checkout / admin / returnUrl / home) | `userService.login` | Role-based redirect here is the **de facto auth policy** (see §3). |
| `/home/sign-up`, `/home/sign-up/:returnTo` | `SignupComponent` (home-routing.module.ts:121-127) | Public | none | Register customer | save user, redirect to checkout or profile | `userService.save` | |
| `/home/forgot-password`, `/:returnTo` | `ForgotPasswordComponent` (home-routing.module.ts:129-135) | Public | none | Request password reset | send reset email | `userService.verifyEmail` (user/get-by-email.php); `UserEmailHelper` → emailService | |
| `/home/new-pass-8379543-in-7382/:token` | `ResetPasswordComponent` (home-routing.module.ts:137-139) | Public | none | Set new password via token | change password | `userService.changePassword` | Secret-ish URL token in route; token embedded in email link (email.service.user.helper.ts:25). |
| `/home/my-profile` | `MyProfileComponent` (home-routing.module.ts:141-143) | Authenticated | none | Profile dashboard modal page | navigate to contact/address/measurements/password/orders/favourites modals; logout | `userService.getUserById` | Rendered as overlay modal via `home.component.html:59`. |
| `/home/collections` | `CollectionsComponent` (home-routing.module.ts:145-147) | Public | none | All collections (categories) | category drill-down | `categoryService.getCategoryAndChildren` (no company → uses route params below) | Component expects `companyId` from route; at bare `/home/collections` companyId is empty → loads nothing meaningful. **Unconfirmed/likely half-broken.** |
| `/home/collections/:companyId` | `ExploreCollectionsComponent` (home-routing.module.ts:150-152) | Public | none | Shop collection explorer | browse featured/pinned products | `shopService.getShop` | |
| `/home/collections/:companyId/:categoryId` | `CollectionsComponent` (home-routing.module.ts:154-157) | Public | none | Category tree + products | browse | `categoryService.getCategoryAndChildren` | |
| `/home/collection/:collectionId[/:companyId[/:type]]` | `CollectionComponent` (home-routing.module.ts:159-169) | Public | none | Collection items listing | browse | `collectionService.collectionItems` | |
| `/home/products`, `/home/products/:companyId`, `/home/products/:companyId/:categoryId` | `ProductsBettaComponent` (home-routing.module.ts:171-182) | Public | none | Product grid by company and/or category | browse | `productService.products` (paginated) or `productService.getByCategory` | |
| `/home/shoping-successful/:id` | `PaymentCallBackComponent` (home-routing.module.ts:185-187) | Public | none | PayFast return landing: marks payment complete, places order | `place_order` | `userService.draft_order`; `jobService.place_order`; `userService.save` | **This is the PayFast success redirect.** Danger: anyone can hit this URL with an arbitrary id and force an order + "paid" flag (frontend-calculated payment). |
| `/home/shoping-callback/:id` | `ShopingCallbackComponent` (home-routing.module.ts:189-191) | Public | none | PayFast notify callback landing (intended server-to-server) | — | none | Empty shell. PayFast `notify_url` points here (`payfast.component.ts:29`). **Broken/unfinished — payment confirmation must be server-side.** |
| `/home/shoping-cancelled/:id` | `ShopingCancelledComponent` (home-routing.module.ts:193-195) | Public | none | PayFast cancel landing | — | none | Empty shell. Cancel is also handled by queryParam on `/home/payments`. |
| `/home/work-show-case/:companyId/:slug` | `GalleryShowCaseListComponent` (home-routing.module.ts:197-199) | Public | none | Work gallery list for a shop | view gallery items | `shopService.getCompany` | |
| `/home/work-show-details/:id` | `GalleryDetailsComponent` (home-routing.module.ts:201-203) | Public | none | Work gallery item detail | `otherInfo.get`; `shopService.getCompany` | |
| `/super-admin` | `SuperDashboardComponent` (home-routing.module.ts:206-230) | Unknown / unconfirmed (no guard; public) | none | Platform admin shell (nav + children) | — | — | Only route to `company/active.php`, clean-images. Children below. **No auth check at all; a guest can open it.** |
| `/super-admin/clean-up-images` | `CleanUpImagesComponent` (home-routing.module.ts:210-212) | Unknown | none | Delete orphan product images | remove image | `productService.cleanImages` (hard-coded `https://tybofashion.co.za/api/api/utils/clean-up-images.php`); `productService.updateImages` | **Cross-origin hard-coded URL; hits production regardless of environment.** |
| `/super-admin/companies` | `SuperCompaniesComponent` (home-routing.module.ts:215-217) | Unknown | none | List companies | `shopService.active` | |
| `/super-admin/company/:id` | `SuperCompanyComponent` (home-routing.module.ts:219-221) | Unknown | none | Edit company | `shopService.getCompany`, `shopService.save` | |
| `/super-admin/users` | `SuperUsersComponent` (home-routing.module.ts:224-226) | Unknown | none | (empty) | none | none | Stub. |
| `/super-admin/user/:id` | `SuperUserComponent` (home-routing.module.ts:227-229) | Unknown | none | (empty) | none | none | Stub. |
| `/store/admin` | `AdminComponent` + `DashboardComponent` (admin-routing.module.ts:29-35) | Admin (implied) | none | Admin dashboard | counts cards, job status filters | `shopService.counts` | **No guard** — any visitor can hit it; shell renders nothing unless logged-in user has `.Company`. |
| `/store/admin/discounts` | `DiscountsComponent` (admin-routing.module.ts:37-39) | Admin (implied) | none | Discount list | add discount | `discounts/list.php` | |
| `/store/admin/discount/:id/:action` | `DiscountComponent` (admin-routing.module.ts:41-43) | Admin (implied) | none | Discount editor (create/edit) | save/delete discount | `discounts/get.php`, `discounts/save.php`, `discounts/delete.php`, `categories/list-names-and-ids.php` | |
| `/store/admin/jobs`, `/store/admin/jobs/:status` | `JobsComponent` (admin-routing.module.ts:46-52) | Admin (implied) | none | Job list w/ search, status filter, stats (total, overdue, pending payments) | new job (modal), view/edit, record payment (stub), more actions (stub) | `jobService.getJobs` (job/get-jobs.php) | Status in URL is ignored by the component (it filters locally). `:status` param unused → **dead route parameter**. |
| `/store/admin/job/:id[/:backTo]` | `JobComponent` (admin-routing.module.ts:54-60) | Admin (implied) | none | Job detail: edit status, due date, items, payments, shipping, special instructions | change status (`Not started`…`Terminated`), due date, manage job items (add/update/delete/qty), add payment, change shipping, upload invoice proof link, print invoice | `jobService.getjob` (get-job.php), `updateJob` (update-job.php), `addJobItem/updateJobItem/deleteJobItem`, `job-payments`, `select-job-shipping`, uploads | **See §4 for deep dive. This is the core admin screen and orchestrates many HTTP calls.** |
| `/store/admin/job-cards` | `JobCardsComponent` (admin-routing.module.ts:62-64) | Admin (implied) | none | Production board: job cards (job items) grid | search; open job card modal | `jobService.getJobItemsByStatus(1)` (job-item/get-job-item-by-status.php?Id=1) | **Bug: passes hard-coded user id `1`** (`job-cards.component.ts:33`). Production assignment happens inside the job-card modal. |
| `/store/admin/products`, `/store/admin/products/:categoryId` | `AdminProductsComponent` (admin-routing.module.ts:66-74) | Admin (implied) | none | Product management grid | pagination, delete, duplicate (navigates to add), view/edit, category filter | `productService.getProductsPage` (products/products.php), `deleteProduct`, `getByCategory` | `ProductsComponent` (legacy) is imported but routed to `AdminProductsComponent`. |
| `/store/admin/product/:id[/:categoryId[/:pageType]]` | `ProductComponent` (admin-routing.module.ts:76-86) | Admin (implied) | none | Product editor | edit name/price/stock/show-online/type/stock/pinned/desc, categories (chip), variations (chip), images upload/main/remove, delete | `products/get.php`, `products/save.php`, `categories/list-by-company-id.php`, `variation/list-by-company-id.php`, `variation/save-option.php`, `categories/save.php`, upload (`upload.php`/`upload-betta.php`) | `pageType` used for back link. |
| `/store/admin/invoice/:id` | `InvoiceComponent` (admin-routing.module.ts:88-90) | Admin (implied) | none | (empty stub) | none | none | **Dead screen** — no template content. Invoices are actually printed via `https://docs.tybofashion.co.za/invoice.php?orderId=…`. |
| `/store/admin/customers` | `CustomersComponent` (admin-routing.module.ts:92-94) | Admin (implied) | none | Customer list | select customer, add | `customer/list.php` (via `CustomerListViewComponent`) | |
| `/store/admin/customer/:id` | `CustomerComponent` (admin-routing.module.ts:96-98) | Admin (implied) | none | Customer detail: financials, job stats, insights, verification, tabs | edit customer (measurements), create job (stub nav), call/email, view tabs | `customer/get.php`, `customer/save.php` | Analytics fields are backend-computed (CustomerLifetimeValue etc.) — query-shape candidates. |
| `/store/admin/users` | `UsersComponent` (admin-routing.module.ts:100-102) | Admin (implied) | none | Staff/user list | add user (Staff), call/email, edit | `user/users.php` | `CustomerService.getCustomersByUser` unused. |
| `/store/admin/user/:id` | `UserComponent` (admin-routing.module.ts:104-106) | Admin (implied) | none | User editor: role, contact, shift, password | save user; add shift (day/night, rate) | `user/get.php`, `user/save.php` | Roles from `Constants.Roles` (Admin/Customer/Staff). |
| `/store/admin/categories`, `/store/admin/categories/:categoryId` | `CategoriesComponent` (admin-routing.module.ts:108-114) | Admin (implied) | none | Category tree | add, edit, delete, search, drill | `categories/list-by-company-id.php`, `categories/get.php`, `categories/save.php`, `categories/delete.php`, `categories/category-and-children.php` | |
| `/store/admin/category/:categoryId` | `CategoryComponent` (admin-routing.module.ts:116-118) | Admin (implied) | none | Category detail + children | edit, delete, add subcategory | `categories/category-and-children.php`, `categories/save.php`, `categories/delete.php` | |
| `/store/admin/collections` | `AdminCollectionsComponent` (admin-routing.module.ts:120-122) | Admin (implied) | none | Collections list | add collection | `otherInfo.search` (Collections) | |
| `/store/admin/collection/:id` | `AdminCollectionComponent` (admin-routing.module.ts:124-126) | Admin (implied) | none | Collection editor | save, delete | `other_info/get.php`, `other_info/save.php`, `other_info/delete.php` | `add-products-to-collection` is a placeholder (throw-not-implemented `save()`). |
| `/store/admin/settings` | `SettingsMenuComponent` (admin-routing.module.ts:128-130) | Admin (implied) | none | Settings hub | edit company branding, address, contact, about, testimonials, stats, measurements, sizes, orders, banners, social | `shopService.getCompany`, `shopService.save` (company/save.php), `other_info/*` for sizes/measurements | |
| `/store/admin/work-gallery` | `WorkGalleryComponent` (admin-routing.module.ts:132-134) | Admin (implied) | none | Work gallery list | add gallery item | `otherInfo.workGallery`, `otherInfo.save` | |
| `/store/admin/edit-work-gallery/:id` | `EditWorkGalleryComponent` (admin-routing.module.ts:136-138) | Admin (implied) | none | Gallery item editor | upload/remove images, set cover, save, delete | `otherInfo/get.php`, `otherInfo/save.php`, `otherInfo/delete.php`, upload | |
| `**` | `NotFoundComponent` | Public | — | 404 | — | — | |

---

## 3. Roles and permissions

There are **no route guards** (`grep CanActivate/Guard` → none). All authorization is "soft": rendered-menu visibility, component-level `if (!user) redirect`, or the backend's own token handling. The only hard role logic in the frontend is post-login redirection (`sign-in.component.ts:69-83`), the admin shell requirement `user.Company` (`admin.component.html:1`), and UI helpers like `SmartModal.isAdmin` / `ProfileNavComponent.isAdmin`.

| Role or condition | Evidence / source | Can access | Can create/update/delete | Can approve/change status | Notes |
| --- | --- | --- | --- | --- | --- |
| `UserType === 'Admin'` | `Constants.Roles` (`Constants.ts:15-20`); `sign-in.component.ts:74-77`; `SmartModal.ts:19-21`; `login-modal.component.ts:61-63`; `admin.component.ts:16` | `/store/admin/**` (via redirect), plus `user.Company` gating; "My Shop" link; Profile-nav Dashboard link (`profile-nav.component.html:10`) | Everything in admin section (products, jobs, categories, users, discounts, collections, settings, gallery) | Job status changes (`job.component.ts:19-26`); no other explicit approve | **Frontend-only condition.** Admin is the *designer/company owner* account. |
| `UserType === 'Staff'` | `Constants.Roles`; `UsersComponent` creates `initUser('Staff')` (`users.component.ts:31`); `admin.component.ts:113` loads all users of company | Same `/store/admin` UI (no per-role restriction in frontend) | Same UI as Admin — job items, shifts (`user.component.ts`), job cards | Can change job item `AssignedTo`, statuses | No RBAC distinction between Admin and Staff in frontend; assume backend enforces. |
| `UserType === 'Customer'` | `Constants.Roles`; `signup.component.ts:33`; `initUser('Customer')` | Home portal + profile modals; checkout; favourites | Profile self-service (contact/address/password/measurements); favourites | — | |
| "Authenticated session" | `UserService.userBehaviorSubject` hydrated from `localStorage` `Constants.LocalUser` (`user.service.ts:32-42`) | Any route (no guards) | — | — | **Session is a plaintext JSON User in localStorage including Password and UserToken — a serious security gap.** |
| "Company ownership" | `JobService.getJobs(CompanyId)`, `ProductService.products(CompanyId)` etc. all filter by `user.CompanyId`; admin shell requires `user.Company` (`admin.component.html:1`); `admin.component.ts:113` | Company-scoped data | — | — | Company-scoping is enforced by query params, not middleware. |
| "Customer identity" | `initCustomerFromUser` (`customer.model.ts:113`) on place-order; `CustomerService.checkIfCustomerExist` exists | — | Order placement creates/links `Customer` records | — | `Customer` and `User` are separate tables but created from the same source on order placement — duplicate identity risk. |
| Platform / "super admin" | Routes `/super-admin/**`; nav in `super-nav.component.ts`; `Constants.Email` `mrnnmthembu@gmail.com` | `/super-admin` shell (companies, users, clean-up) | company save; image delete | — | **No auth check.** Any visitor can open; shell is minimal; some sub-screens empty. |
| Frontend-only route restrictions | `jobs.component.ts:28-31` (`if (!this.user) navigate /sign-in`), `admin.component.html` | — | — | — | Redirects are best-effort; the target route itself is unguarded. |
| Customer upload of payment proof | `payments.component.ts:124-133`, `upload-input` | — | — | — | Bank-transfer requires proof upload before `placeOrder`. |

### Recommended future access model (recommendation, distinct from current behaviour)

Based on observed needs, the future command API should model:

- **Roles**: `PlatformAdmin` (super), `CompanyAdmin` (current "Admin"), `Staff` (tailor/designer), `Customer` (buyer), `Guest` (public).
- **Access scopes**: `TenantCompanyId` required on all staff/admin read/writes; `Customer` scoped to own `UserId`; public read for catalogue/directory/work gallery.
- **Permission conditions the UI already implies**: company-scoped cataloguing (products/categories/variations/discounts/collections); job item `AssignedTo` (staff); job status transitions (admin/staff); payment recording (admin/staff); proof-of-payment review (admin); company settings (admin only); `create order/job` (customer checkout + admin manual).
- **Server-side enforcement**: all of the above must be validated by the command/query API (current frontend alone is insufficient).

---

## 4. Admin functional inventory

The `AdminModule` is the deepest area. Admin component flows were traced in TS + templates.

| Admin screen | What it manages | Actions available | Current API calls | Frontend business logic found | Future API requirement |
| --- | --- | --- | --- | --- | --- |
| **Dashboard** (`/store/admin`) | Counts, quick links, job-status cards | navigate to products/customers/users/jobs/cards; shortcuts | `company/counts.php?id=…` | — | Query (dashboard summary incl. job status counts currently hard-coded `[10,20,2,5]`). |
| **Jobs list** (`jobs`) | All jobs in company | search (name/phone/JobNo/InvoiceNo/title), status filter, total revenue, overdue count, pending payments, record-payment (stub), export (stub) | `job/get-jobs.php?CompanyId=` | Revenue sum, overdue filter, pending-payments sum from `Metadata.paidAmount/dueAmount`, status display | Query: job list with computed metrics (server-owned). |
| **Job detail** (`job/:id`) | The project + production + payments | edit status (Not started/In Progress/Completed/Stuck/Terminated/Paused), due date, customer (via customer form), manage payments (add/delete), change shipping, print invoice, view proof, add/edit/delete job items, edit measurements, print job card | `get-job`, `update-job`, `add-job-item`, `update-job-item`, `delete-job-item`, `job/get-job-work.php` (unused), uploads, `categories` etc. | Total/due/paid recalculation (`check_total`), status-derived `isOverdue`, `daysUntilDue`, auto-created Metadata (InvoiceNo from JobNo), **sequential HTTP calls** | Command set: `UpdateProject`, `AddGarment`, `RecordPayment`, `SetShipping`, `ChangeStatus` + Query `GetProject`. |
| **Job cards / production board** (`job-cards`) | production kanban of job items | search, open job-card modal (assign staff, size, measurements, price, qty, notes, colour, image, print card) | `job-item/get-job-item-by-status.php?Id=1` (hardcoded), `job-item/get-job-item.php` for modal, `update-job-item` | — | Query: production board per staff/status + Command `UpdateGarment`. |
| **Products list** (`products`) | catalog | pagination, delete, duplicate, category filter | `products/products.php` (paginated, `isAdmin=true`), `products/delete.php` | Pagination page-size checks, prev/next page logic | Query: paginated product list with totals. |
| **Product editor** (`product/:id`) | product + categories + variations + images | edit fields, attach/remove categories (multi-level), variations/options, images upload/remove/main, save, delete | `products/get-product`, `products/save.php`, `categories/list-by-company-id.php` + `save.php`, `variation/list-by-company-id.php` + `save-option.php`, upload, `products/update-array-value` (measurement rename) | Variation selection → `ProductVariationPayload`; category re-parenting on selection change; image reorder (feature first) | Query: product editor bundle (categories, variations, options) + Command `SaveProduct`, `AddVariationOption`, `AddCategory` (or server-side create-on-save). |
| **Categories** (`categories`) | category tree | add, edit, delete, search, drill-down | `categories/list-by-company-id.php` (admin yes), `get`, `save`, `delete`, `category-and-children.php` | duplicate-name guard, deletion confirmation | Query: category tree with children + Command: CRUD. |
| **Customers** (`customers`) | customer list | search, filter, select, add (via modal) | `customer/list.php` | UI analytics (active, outstanding, initials) from enhanced fields | Query: customer list with computed fields. |
| **Customer detail** (`customer/:id`) | customer profile | edit (incl measurements), call/email, tabs (overview/jobs/measurements/activity), create job (stub) | `customer/get.php`, `customer/save.php` | renders backend-computed metrics (LTV, outstanding, etc.) | Query: customer profile (metrics server-owned); Command: UpdateCustomer, CreateProject. |
| **Users** (`users`) | staff members | list, add staff, call, email, navigate | `user/users.php` | active/staff/admin counts | Query/Command: staff CRUD with role. |
| **User detail** (`user/:id`) | staff + shifts | edit profile, change password, add shift (day/night with RatePerDay/Night) | `user/get.php`, `user/save.php` | shift day/night rate & price, `Metadata.UserShifts` stored inside User | Command: staff update + shift entry; better as separate table. |
| **Discounts** (`discounts`) | discounts/promo codes | list, search, add via modal, edit, delete | `discounts/list.php`, `save.php`, `get.php`, `delete.php`, `categories/list-names-and-ids.php` | discount date validation (end after today), type labels mapping | Query: discount list; Command: create/update/delete (validate server-side). |
| **Collections** (`collections`) | collection content | list, add collection | `other_info/search.php` (type Collections) | — | Query/Command: collection CRUD. |
| **Collection editor** (`collection/:id`) | collection detail | save/delete | `other_info/get.php`, `save.php`, `delete.php` | — | Command: collection save/delete. |
| **Work gallery** (`work-gallery`) | portfolio items | add item | `other_info/search.php` (WorkGallery), `save.php` | — | Query/Command: gallery item. |
| **Work gallery editor** (`edit-work-gallery/:id`) | gallery item | images, cover, save, delete | `other_info/get.php`, `save.php`, `delete.php`, upload | cover-first reorder | Command: update gallery. |
| **Settings hub** (`settings`) | company branding/content | company details, address, contact, about, testimonials, statistics, banners/slides, social links, system measurements, system sizes, order settings | `shop/get-company.php`, `company/save.php`, `other_info/search/save.php` (measurements & sizes), upload | `InvoiceNotes`/`InvoiceAnnouncement` defaults; stat/testimonial add/remove | Query: full company content bundle; Command: save settings blocks. |
| **Invoice stub** (`invoice/:id`) | — | none | none | — | Print endpoint: `docs.tybofashion.co.za/invoice.php?orderId=` (outside app). |
| **Super clean-up images** (`/super-admin/clean-up-images`) | orphan images | delete orphan per image | `utils/clean-up-images.php` (hard-coded prod URL), `products/update-images.php` | — | Command: delete image / remove from product. |
| **Super company edit** (`super-admin/company/:id`) | company | save company (slugs, show online, bank details…) | `company/get.php`, `company/save.php` | — | Command: company profile update. |

---

## 5. Customer and public functionality

### Public catalogue browsing
- Home `/` = `TuiHomeComponent` (marketing landing) — hero, feature cards, testimonials, stats. Uses `otherInfo.categories('80edd9df-6fc0-11eb-9698-12911df8ace9')` and the `productService.$products` stream (never populated by this component — the `NewInComponent`/`ProductList` are not rendered here, so product cards only appear if some other component pushed into `$products`).
- Explore Shops `/home/shops` → `shopService.active()` (`company/active.php`) → list → shop page.
- Shop storefront `/:slug` (`MyShopBettaComponent`) — hero, new arrivals (`company.RecentProducts`), pinned (`company.PinnedProducts`), categories, slides, work gallery, testimonials. Loads via `shopService.getShop` (shop/get-shop.php POST).
- Products grid `/home/products*` (`ProductsBettaComponent`) — `productService.products()` or `getByCategory()`.
- Product detail `/product/:id` (`ProductBettaComponent`) — gallery, price, deposit 50% calculation (frontend: `product.RegularPrice*0.5`), size picker (variations where `Name==='Size'`), add-to-cart, favourite, share, WhatsApp CTA for custom items.
- Collections: `/home/collections`, `/home/collections/:companyId`, `/:companyId/:categoryId`, `/home/collection/:collectionId...` (browse items).
- Work showcase: `/home/work-show-case/:companyId/:slug` and `/home/work-show-details/:id` (public portfolios).
- Category drill-down is used on product cards: `product-card.component.ts` `homeUrl` = `/product/${slug}`.

**Catalogue search/filter/sort**: no global search component was found; only local list filtering on admin lists (jobs/customers/categories/products). Public filters: category route, `related products`, collection type. There is **no customer-facing search/filter/sort UI in this codebase** (search field exists only in the (commented) `product-betta` template).

### Registration, login, logout, password reset, session restoration
- Registration: `/home/sign-up` (`SignupComponent`) and `SignUpModalComponent` (unrouted modal). Saves `User` via `userService.save(user)`, with `UserType='Customer'`. If `returnTo==='checkout'` → `/home/checkout`; else home + profile modal.
- Login: `/home/sign-in` and `LoginModalComponent`. `userService.login({Email, Password})`; on success `updateUserState` + `after_sign_in`:
  - `Admin` → `/store/admin`
  - checkout-return → `/home/checkout`
  - else returnUrl or `/`, then open profile modal.
- Logout: `userService.logout(undefined)` clears `localStorage` and navigates `/home/sign-in`.
- Session restoration: on boot, `UserService` constructor reads `localStorage[LocalUser]` and restores `BehaviorSubject<User>`.
- Password reset: `/forgot-password` → `verifyEmail` (`user/get-by-email.php`) → `UserEmailHelper.sendPasswordResetEmail()` → link `.../home/{PassUrl}/{UserToken}`. `ResetPasswordComponent` validates token + password rules (min 8, number, special, upper, lower) and calls `userService.changePassword(UserToken, Password)`.
- **Security**: `UserToken` is the reset token delivered in the URL; no expiry check in the frontend. Password stored plaintext in the User model and in localStorage.

### Customer profile/account management (all modals rendered by `home.component.html`)
- Profile hub `MyProfileComponent` (fetches fresh user by id via `userService.getUserById`). Menu: contact, address, measurements, password, orders, favourites, logout.
- `ProfileContactComponent` / `ProfileAddressComponent`: forms bound to `user`; save via `userService.save`; `BaseProfileComponent.updatePassword` compares `oldPassword` to `user.Password` (plaintext comparison) then re-saves the whole user.
- `ProfileMeasurementsComponent`: maps `systemMeasurements` (hard-coded parent id) onto the user's measurement list; deletes measurements not in the system list then saves the user.
- `HomeMeasurementsComponent` (used by profile + checkout size capture): persistence in `localStorage` `UnitsStore` (guest) or `user.Measurements` (logged in).
- Favourites: `User.Metadata.Favorites` (array of product ids) toggled via `userService.on_like`, persists by saving the whole User. `FavouriteComponent` lists them.

### 7. Checkout, payment, discount and order lifecycle — deep trace (§7 below)

---

## 6. Checkout, payment, discount and order lifecycle

Cart = a **Job** in `localStorage` (`JobService.update_job_state`). `JobService` is the single source of cart/checkout logic.

### 1. Product discovery and selection
- Components: `ProductBettaComponent` (`/product/:id`), legacy `ProductDetailsComponent` (not routed), `ProductsBettaComponent`, `CollectionComponent`.
- `productService.getProduct` (`products/get.php?ProductId=`) loads `Product` incl. `Variations`, `RelatedProducts`, `Company`.

### 2. Variation/size/colour/measurement selection
- `ProductBettaComponent`: colour (product-color), size via `SizeComponent` (derives sizes from `product.Variations` with `Name==='Size'`; "Use Measurements" path triggers `HomeMeasurementsComponent`).
- Admin path: size selection via `AdminSelectSizeComponent`; measurements via `AdminMeasurementsComponent`.
- Measurements are `IMeasurement[]` persisted to `localStorage['UnitsStore']` and/or `user.Measurements` (and finally `user.save`).

### 3. Cart / draft-order storage
- `JobService.add_to_cart(company, product, size, quantity, measurements)`:
  - loads `current__job` (Job) from `localStorage`; if absent, `initJob(companyId, 'online-shop')`, `JobType='Online Shop'`.
  - merges into `job.JobItems` (dedupe by name+size+itemType) — **in memory only; the Job is NOT persisted to backend while in cart**.
  - computes `job.DueDate = today + company.Metadata.ProccessingDays`; computes `job.TotalCost = cart_total(job)` (incl. `ShippingPrice` + discount).
  - persists `current__job` to localStorage.
- `OrderService` (legacy `localOrder` + `Order` model) is **not used by any component** (confirmed: only referenced by itself). The active cart system is Job.

### 4. Customer identification/creation
- Checkout step: `CheckoutCustomerComponent`. If not logged in, fills a `User` (can opt `createAccount` with password); if logged in uses the session user.
- `checkEmail()` on input: `verifyEmail` (`user/get-by-email.php`) → if exists, shows "email already registered" warning (user must login).
- `continueToPayment()`:
  - validates shipping + contact; sets `job.JobNo = 'INV' + countOrder` (from `jobService.count` → `job/count.php`) — **invoice number is derived from a count of all jobs in the company** (race-prone).
  - sets `job.Metadata.paymentRef = job.JobNo`.
  - calls `userService.updateUserDraftOrder(user, job)` (stores the whole Job in `user.Metadata.DraftOrder`), then `userService.save(user)` → **persists full Job inside User record**.
  - navigates `/home/payments`.
- **Flag**: if the user record save succeeds but the Job is huge (JobItems, images), `user.Metadata.DraftOrder` will be stored as JSON in the user table. This is the "draft order" mechanism (`user/draft-order.php`).

### 5. Delivery/shipping selection
- `ChooseDeliveryMethodComponent` — options `Delivery` (R150 flat fee via `Constants.DeliveryFee`) or `Collection` (R0).
- `DeliveryMethodComponent` and `CheckoutComponent` call `jobService.update_delivery(job, shipping, fee)` → updates `job.Shipping`, `ShippingPrice`, `TotalCost`, `Metadata.dueToday`.
- There is a `Shipping` model + `systemShippings` array (Courier/Paxi/Free/Collection) defined in `shipping.model.ts` but **unused** by the UI; the live options are the 2-element `Constants.ShippingOptions`.

### 6. Discount/coupon/automatic discount handling
- `OrderSummaryComponent` (in checkout and payments) has a promo code input (min length 3); `jobService.fetchDiscountCode(code)` calls `discountService.getByCode(companyId, code)`.
- `applyDiscount` in `JobService` only handles `DiscountType==='amountOffOrder'` and `DiscountValueType==='Percentage'` → `discountAmount = total * %`, `amountBeforeDiscount`, `amountAfterDiscount`, `hasDiscount`. It does **not** handle `amountOffProducts`, `buyXGetYFree`, `shippingDiscount`, or fixed amounts.
- Automatic discounts (`Method:'Automatic'`) are not applied at all in the frontend.

### 7. Total, paid, due, shipping, item-total calculations (all in frontend)
- `JobService.cart_total` = `ShippingPrice + itemsSubTotal` where each item `SubTotal = UnitPrice*Quantity`, then discount subtracts.
- `JobService.dueAmount(job)` = `TotalCost / 2` if `PaymentAmount === 'deposit'` else `TotalCost`.
- `JobService.calculatePaidAmount` = sum of `Metadata.payments[].Amount`.
- `JobService.calculateDueAmount` = `TotalCost - paid`.
- These are recomputed many times and (in `check_total`) `UPDATE /job/update-job.php` if mismatch — the frontend is authoritative.

### 8. Order creation/update
- `PaymentsComponent` (payfast flow): `user.Metadata.DraftOrder` used to compute PayFast form params; on PayFast submit the browser POSTs directly to `payfast.payUrl` (form hidden fields with merchant keys in client — **hardcoded merchantId/merchantKey `15863973`/`xbamuwn3paoji` visible in bundle**).
- `place_order(job)`:
  - builds a `Customer` from the current User (`initCustomerFromUser`) — sets `job.Customer`, `job.CreateUserId`, `JobType='Online Shop'`, `job.JobItems` `CreateUserId`.
  - POSTs to `job/place-order.php` with the full Job object.
  - On success: clears job state; navigates `location.href = '/home/order-successful/${JobId}'` and shows a `profile_order` modal.
- The backend places the order/job; **PayFast completion is confirmed only by a redirect to `/home/shoping-successful/:id`** where the client manually marks `paidAmount`/`payments` and re-`place_order`s. There is **no server notification handling in the app** (`ShopingCallbackComponent` is empty).

### 9. Payment method/status handling
- Payment method options: `payfast` / `bank` (`Constants.PayMethods`).
- Payment amount options: `full` / `deposit` (`Constants.PayAmountTypes`); deposit = `TotalCost/2` computed client-side.
- After bank transfer: `placeOrder()` in `PaymentsComponent` refuses until `job.Metadata.paymentProof` exists (uploaded via `upload-input`).
- Order statuses (OrderStatus): Cart / Placed / Processing / On-transit / Delivered / Cancelled / Not-paid / WaitingForPaymentVerification / WaitingForProofOfPayment (Constants).
- PaymentStatus: Paid / Paying / Pending / Partial; PaymentTypes: Full / Half; PaymentMethods: PayFast / Transfer.

### 10. Post-order job/project creation or linking
- A successful `placeOrder` creates the Job (which is the order + project). No separate Order record is created by the customer flow. `order/save.php`/`order/update.php` are unused by the app.
- Confirmation page `OrderSuccessfulComponent` also sends **3 emails** (customer, designer company, platform owner) using `EmailService.send` to `mail.tybofashion.co.za` — a post-order side effect in the UI (should be a backend command).

### 11. Confirmation and later admin/staff actions
- Admin sees the new job in `JobsComponent`; can edit status, payments, shipping, add job items, assign staff, print invoice/job card.
- Customer sees order via `MyOrders` (profile → `JobService.getJobs(user.UserId,'CreateUserId')` — i.e., jobs filtered by the CreateUserId; **job orders created by the user are listed; delivery date hardcoded `CreateDate + 7 days`**).

### Recommended backend command set for this flow

| Future command | Triggering UI action | Inputs | Tables/legacy concepts | Expected result |
| --- | --- | --- | --- | --- |
| `StartCheckout` | add-to-cart (finalize cart) | cart Job, user | `job`, `job-item` | persisted draft with stable id + status `Cart` |
| `ApplyDiscount` | promo code apply | code, companyId | `discounts` | server validates & returns discount, computing new total |
| `CheckoutContact` | checkout contact submit | user/contact fields | `user` | persist contact; validate email/phone; return address |
| `PlaceOrder` | `placeOrder()` in checkout/payment | full job (items, shipping, discount, payment) | `job`, `job-item`, `customer`, `order` (optional) | create job order + invoice number + customer link + emails |
| `RecordPayment` | payfast success / bank proof submit | jobId, method, amount, proof ref | `job.Metadata.payments`, `user` | register payment, recalc paid/due, set status |
| `ChangeOrderStatus` | admin status select | orderId, status | `job` | transition + audit |
| `UpdateJobItem` | admin item edit | jobItem fields | `job-item` | update garment |
| `SendOrderConfirmation` | after PlaceOrder (async) | jobId | `job`, `company`, `customer` | emails to 3 recipients |
| `RequestPasswordReset` | forgot password | email | `user` | generate token + email link |

---

## 7. Project, garment, measurement and production lifecycle

### Job creation and editing
- **Create**: admin `AddJobComponent` (customer selected from `CustomerListView` → `jobService.add(job)` → navigate to `/store/admin/job/:id`). Note: creates the Job immediately with an empty `Customer` (`CustomerId` set from selected, then `add`). No title/status flow before creation.
- **Edit**: `JobComponent` — edit title, due date, status (`JobComponent.statuses` = `['Not started','In Progress','Completed','Stuck','Terminated','Paused']`), customer (via `CustomerFormComponent`), shipping (Collection/Delivery with `ShippingFee`), items (add/edit/delete), special instructions (comments), payments, invoice view.
- Customer creation in admin: `CustomerFormComponent` + `CustomerListView` (create with measurements default of 17 measurement fields, then `customerService.save`).

### Job item/garment creation and editing
- `JobItemsComponent` → `JobItemFormComponent` (fields: name, size/colour, image, quantity, unit price, notes, assignee, measurements, job card print).
- `JobItemComponent` (per-item) handles update/delete/qty changes; emits back to `JobService`.
- `JobItem` model has `Metadata.AssignedTo`/`AssignedToName`/`ProductId`, `Measurements`.
- New `JobItem` created via `initJobItem`.

### Customer selection and creation
- Admin: `CustomerListComponent` + `CustomerForm`.
- Public: `placeOrder` auto-creates a `Customer` from the session user (`initCustomerFromCustomer`), `checkIfCustomerExists` unused. Potential duplicate Customer/User records — each order will create a new `Customer` (no dedupe logic).

### Measurement handling
- System measurements defined via `MeasurementService.data()` (44 fields) + admin `SystemMeasurementsComponent` (add/edit/delete measurement names, help image/description, `update-array-value` on rename).
- System sizes via `SystemSizesComponent` (list from `OtherInfoService` with `OTHER_TYPES.Sizes`, defaults `SIZES` array).
- `AdminMeasurementsComponent` used in job items; `HomeMeasurementsComponent` used in customer add-to-cart (guest → localStorage `UnitsStore`; user → `user.Measurements`).
- Measurements are plain `{Name,Value,Units,Image}` objects.

### Job status and class/status-display logic
- `Job.Status` (`StatusDisplay`): `Not Started`, `In Progress`, `Stuck`, `Complete(d)`, `Terminated`, `Paused`.
- `Job.Class` (legacy `'not-started'`): the initJob sets `Class='not-started'`; dashboard uses statuses `not-started/in-progress/stuck/complete` for job filter links (`/store/admin/jobs/:status`).
- Frontend state-machines:
  - `isCompleted()` = status in `['Completed','Complete']` (`job.component.ts:156-158`).
  - `isOverdue()` = `DueDate < today && !isCompleted` (frontend-date comparison).
  - Jobs list `StatusDisplay` fallback.
- These display-only decisions are candidates for server-owned `Status`/`IsOverdue`/`DaysRemaining` fields (already partially backend-computed per `Job` "Enhanced fields" comments).

### Due dates, totals, delivery/shipping details
- `Job.DueDate` set on add-to-cart (processing days), or manually admin.
- `Job.TotalCost`, `TotalDays`, `ShippingPrice`, `Shipping`.
- `Job.TotalCost` = `shipping + items − discount` (client calc).
- `Metadata.paidAmount`, `Metadata.dueAmount`, `Metadata.dueToday`, `Metadata.payments`.

### Production work (`jobwork`) and staff assignment (`jobworkuser`)
- **No evidence** the frontend uses a separate `jobwork`/`jobworkuser` table. The only staff concept:
  - `JobItem.Metadata.AssignedTo` / `AssignedToName` (select user list in `job-item-form`/`job-card`).
  - `UserShift` (day/night shifts with `RatePerDay`/`RatePerNight`, stored in `User.Metadata.UserShifts`) — an HR/timekeeping concept on users.
- `JobService.getJobWorksSync` and `job/get-job-work.php` exist in the service layer but are **never called** from any component (dead client-side).

### Links between job and order
- `Job.OrderId` optional; `Order.JobId` exists but the Order entity isn't used. The `Job` IS the order. `OrderMetadata`/`initOrder` legacy unused.

### Any activity/log/history feature
- `Metadata.Special_instructions` (comments with date/attachment/user) on a job; no general activity log.
- `AdminCommentComponent` edits these comments (deletes all comments on "delete"). No audit trail.

### Dashboard metrics based on jobs
- `DashboardComponent` shows product/style/collection/customer/user/job/job-card counts from `company/counts.php` (backend) and hard-coded status counts.
- `JobsComponent` computes totals/revenue/overdue/pending from the fetched list — frontend aggregation.

### Terminology mapping (current → recommended)

| Current | Recommended | Reason |
| --- | --- | --- |
| `Job` (orders/cart/production) | `Project` (or `Order` + `ProductionJob` split) | Job is overloaded (cart, order, invoice, production); command/query clarity requires separation |
| `JobItem` | `ProjectGarment` / `OrderLine` | it is a garment/order line with measurements |
| `Job.JobType` (`Internal`/`Online Shop`) | `ProjectSource` (manual vs storefront) | |
| `Customer` | `Client` (per company) | |
| `User` (Customer) | `AccountHolder` / `CustomerUser` | separate `User` from per-company `Customer/Client` record |
| `Company` | `Tenant` / `Brand` | multi-tenant scoping |
| `OrderStatus` / `PaymentStatus` enums in Constants | Backend-managed status catalogs | |
| `Collection` (`OtherInfo`) | `Collection` (owned by category/tree) | |
| `workGallery` (`OtherInfo`) | `Portfolio` | |
| `SystemSizes`/`SystemMeasurements` (`OtherInfo`) | `SizeCatalog` / `MeasurementCatalog` | |

---

## 8. Backend API usage inventory

Only confirmed call sites from the Angular app are listed.

| Current service method / endpoint | HTTP method | Triggering screen/action | Request payload / query | Response fields used | Classification |
| --- | --- | --- | --- | --- | --- |
| `user/login.php` | POST | SignIn, LoginModal | `{Email, Password}` | `User` (whole) | Replace with `Login` command + auth token |
| `user/save.php` | POST | Signup, Profile (contact/address/password), measurement save, favourite toggle, checkout contact, placeOrder draft store, staff add, admin user edit, password reset token | full `User` | `User` | Replace with per-context commands (RegisterUser, UpdateProfile, UpdatePassword, SetFavorites, SaveDraftOrder, UpdateStaff) |
| `user/get.php?UserId` | GET | Profile, admin user, my-shop user | UserId | `User` | Replace with `GetUser` query |
| `user/get-by-email.php?Email` | GET | ForgotPassword, CheckoutCustomer (email check), signup | Email | `User` | Replace with `ResolveUserByEmail` / `RequestPasswordReset` |
| `user/users.php?CompanyId&UserType` | GET | Admin nav (init users), admin users list, admin shell loads user list | CompanyId | `User[]` | Replace with `ListStaff` query |
| `user/change-password.php` | POST | ResetPassword | `{UserToken, Password}` | `{isSuccess}` | Replace with `ChangePassword` command |
| `user/draft-order.php?Id` | GET | Payments (`:id`), payFast callback | Id (DraftOrderId) | `User` (with Metadata.DraftOrder) | Replace with `GetDraftOrder` query / `CheckoutState` |
| `user/get-shop.php?UserId` | GET | **Unused in components** | — | — | Likely unused/dead |
| `user/get-admin-stat.php` | GET | **Unused in components** | — | — | Likely unused/dead |
| `company/get.php?id` | GET | Settings, gallery details, gallery list, show-banking, super-company | id | `Company` | Replace with `GetCompanySettings` query |
| `company/save.php` | POST | Admin settings save, super-company | Company | Company | Replace with `UpdateCompanySettings` command |
| `company/active.php` | GET | Shops (explore shops), super companies | — | `Company[]` | Replace with `ListActiveCompanies` query (public) |
| `company/counts.php?id` | GET | Dashboard | id | `ICounts` | Replace with `GetDashboardCounts` query |
| `shop/get.php` (POST) | POST | not consumed (legacy `ShopService.getFeatured`) — only `get-shop` used | — | — | Likely unused/dead |
| `shop/get-shop.php` (POST) | POST | Shop storefront, explore-collections, collection-items | `IShopRequest` (ShopId, flags, CategoriesId) | `Company` (products, categories, styles, pinned/recent, metadata) | Replace with `GetStorefrontBundle` query |
| `other_info/company-info.php` | GET | gallery showcase | ItemId/CompanyId/ItemType | `Company` (InfoList) | Replace with `GetCompanySection` query |
| `products/save.php` | POST | Product editor, quick add, duplicate | `Product` | `Product` | Replace with `SaveProduct` command |
| `products/add.php` | POST | (legacy) | — | — | Likely unused/dead (routed to save) |
| `products/products.php?CompanyId&isAdmin&limit&offset` | GET | Products grid (admin+public pagination) | CompanyId, isAdmin, limit, offset | `Product[]` | Replace with `ListProducts` query |
| `products/list.php` (POST) | POST | legacy ProductsComponent (`getProducts()`) | filter | `Product[]` | Legacy; replace |
| `products/get.php?ProductId&IsAdmin` | GET | Product detail, admin product editor | ProductId, IsAdmin | `Product` | Replace with `GetProduct` query |
| `products/fetured.php` | GET | LandingComponent (only) | — | `Product[]` | Keep for home until replaced by `GetFeaturedProducts` |
| `products/new-in.php` | GET | NewInComponent (used on home/new-in) | count, companyId | `Product[]` | Replace with `GetNewArrivals` query |
| `products/update-feature.php` | POST | ProductCard pin | `Product` | `{featured}` | Replace with `SetProductPinned` command |
| `products/update-range.php` | POST | Legacy ProductsComponent bulk edit | `Product[]` | `Product[]` | Replace with `BulkUpdateProducts` command |
| `products/update-images.php` | POST | CleanUpImages | `{ProductId, Images}` | `Product` | Replace with `RemoveProductImage` command |
| `products/update-array-value.php` | GET | SystemMeasurements (rename) | prop, companyId, old, new | `Product` | Replace with command |
| `products/query.php` | GET | unused | — | — | Likely unused/dead |
| `products/products-by-category.php` | GET | ProductsBetta (category page) | categoryId | `Category` (w/ Products) | Replace with `GetCategoryProducts` query |
| `products/new-in.php` | GET | Home new-in | count, companyId | `Product[]` | Replace with `GetNewArrivals` query |
| `categories/save.php` | POST | Category editor, product (subcategory), categories | `Category` | `Category` | Replace with `SaveCategory` command |
| `categories/get.php` | GET | category page | id | `Category` | Replace with `GetCategory` query |
| `categories/list-by-company-id.php` | GET | admin categories, product editor (isAdmin yes) | companyId, parentId, isAdmin | `{Categories}` | Replace with `ListCategories` query |
| `categories/list-names-and-ids.php` | GET | discount editor | companyId | `Category[]` | Replace with `GetCategoryOptions` query |
| `categories/by-parent.php` | GET | not consumed | — | — | Likely unused/dead |
| `categories/category-and-children.php` | GET | collections, category detail | companyId, categoryId, isAdmin | `Category` | Replace with `GetCategoryTree` query |
| `categories/delete.php` | GET | categories, category page | id | any | Replace with `DeleteCategory` command |
| `collections/collections.php` | GET | product detail (getCollections), home | CompanyId | `OtherInfo[]` | Replace with `GetCollections` query |
| `collections/collection-items.php` | GET | collection page | Id, CompanyId, Type | `Product[]` | Replace with `GetCollectionItems` query |
| `variation/save.php` | POST | (admin variation create) | `Variation` | `Variation` | Command: `SaveVariation` |
| `variation/list-by-company-id.php` | GET | product editor | companyId | `Variation[]` | Query |
| `variation/save-option.php` | POST | product editor (new option) | `VariationOption` | `VariationOption` | Command |
| `variation-option/save.php` | POST | VariationOptionService (unused) | — | — | Likely unused/dead |
| `variation/list.php` | GET | unused in components | — | — | Likely unused/dead |
| `variation/delete.php`, `variation-options/list.php`, etc. | — | not consumed by components | — | — | Unused (likely dead) |
| `product-variation/*` (add/remove/list), `product-variation-option/*` | DELETE/POST/GET | service only; **no component consumer** | — | — | Likely dead / unused |
| `job/add-job.php` | POST | AddJob | `Job` | `Job` | Replace with `CreateProject` command |
| `job/get-jobs.php?CompanyId` | GET | Jobs list (getJobs with key CompanyId), profile orders (key CreateUserId) | CompanyId / CreateUserId | `Job[]` | Replace with `ListProjects` query |
| `job/get-job.php?JobId` | GET | job detail, profile order, order success | JobId | `Job` | Replace with `GetProject` query |
| `job/update-job.php` | POST | job detail (status, due, total, customer, items, payments, special-instr), checkout re-sync | `Job` | `Job` | Replace with `UpdateProject` command |
| `job/place-order.php` | POST | Payments / payfast-callback | `Job` (w/ Customer embedded) | `{data:{JobNo}}` | Replace with `PlaceOrder` command |
| `job-item/add-job-item.php` | POST | admin job items | `JobItem` | `JobItem` | `AddProjectGarment` command |
| `job-item/update-job-item.php` | POST | job item / job card | `JobItem` | `JobItem` | `UpdateProjectGarment` command |
| `job-item/delete-job-item.php` | GET | admin delete | JobItemId | `JobItem` | `RemoveProjectGarment` command |
| `job-item/get-job-items.php?JobId` | GET | (not used by components? — check) | JobId | `JobItem[]` | Query (kept) |
| `job-item/get-job-item.php?JobItemId` | GET | job-card | JobItemId | `JobItem` | `GetProjectGarment` query |
| `job-item/get-job-items-by-user.php?Id` | GET | **unused in components** | — | — | Likely unused/dead |
| `job-item/get-job-items-by-status.php?Id` | GET | job-cards (hardcoded Id=1) | Id | `JobCard[]` | Replace with `ProductionBoard` query (per staff) |
| `job/count.php?CompanyId` | GET | CheckoutCustomer, Payments (invoice no) | CompanyId | count | Replace with `GetProjectNumber` (or server-issued) |
| `job/get-job-work.php?JobId` | GET | **unused in components** | — | — | Likely unused/dead |
| `discounts/list.php?parentId` | GET | discounts | parentId | `Discount[]` | Query |
| `discounts/get.php?id` | GET | discount editor | id | `Discount` | Query |
| `discounts/save.php` | POST | discount editor/modal | `Discount` | `Discount` | Command (validate server-side) |
| `discounts/delete.php?id` | GET | discount delete | id | — | Command |
| `discounts/get-by-code.php` | GET | checkout promo | parentId, code | `Discount` | Command: `ValidateDiscountCode` |
| `customer/save.php` | POST | customer form, admin | `Customer` | `Customer` | Command: `UpsertCustomer` |
| `customer/list.php` | GET | customers | CustomerType, CompanyId | `Customer[]` | Query |
| `customer/list-for-user.php?UserId` | GET | **unused in components** | — | — | Likely unused/dead |
| `customer/get.php?CustomerId` | GET | customer page | CustomerId | `Customer` | Query |
| `customer/get-by-email.php?Email&CompanyId` | GET | checkout-email check | Email, CompanyId | `Customer` | Command: `ResolveCustomerByEmail` |
| `order/save.php`, `order/update.php`, `order/get.php`, `order/list.php`, `order/list-for-user.php` | POST/GET | **no component consumer** (`OrderService` unused) | — | — | Legacy/dead — retire |
| `other_info/save.php` | POST | sizes/measurements/collections/workGallery/system measurements | `OtherInfo` | `OtherInfo` | Command: `SaveConfigItem` |
| `other_info/search.php` | GET | sizes/measurements/categories/collections/workGallery/companyInfo | ParentId, ItemType, ProductCount, Key | `OtherInfo[]` | Query: `SearchConfigItems` |
| `other_info/get.php?Id` | GET | collection detail, work-gallery detail | Id, Join, Key | `OtherInfo` | Query |
| `other_info/list.php` | GET | **unused** (only in service) | — | — | Likely unused/dead |
| `other_info/delete.php?Id` | GET | collection/work-gallery delete | Id | `OtherInfo` | Command |
| `other_info/company-info.php` | GET | gallery company info | — | — | Query (via other_info) |
| `upload/upload.php` (multipart) | POST | images (product, category, work gallery, proof, branding, testimonials) | FormData | `Image` / url string | Keep for compatibility (media asset service) |
| `upload/upload-betta.php` (multipart) | POST | admin product upload (hard-coded URL) | files[] | array of `{success}` | Replace with `UploadAsset` command (unify with upload.php) |
| `upload/upload-base-64.php` | POST | image widget (base64) | data | `Image` | Replace with asset service |
| `upload/delete.php?file` | GET | image widget remove | file | — | Replace with `DeleteAsset` command |
| `images/save.php` | POST | ImageWidget (mark StatusId=99 → delete) | `Image` | `Image` | Replace with asset lifecycle |
| `images/add.php` | POST | **unused** | — | — | Likely unused/dead |
| `utils/clean-up-images.php` | GET | clean-up-images (super) | — | items | Replace with `FindOrphanedAssets` query + command |
| `email` (mail.tybofashion.co.za) | POST | order success, forgot-password, contact | `{sender,recipient,subject,message}` | `{message}` | Replace with `SendEmail` via server (not frontend) |

---

## 9. Frontend orchestration to move into commands

| Current flow | Source files | Current client-side steps | Risk | Proposed backend command |
| --- | --- | --- | --- | --- |
| Cart → invoice → order | `job.service.ts` (add_to_cart, place_order), `checkout-customer.ts`, `payments.ts` | builds Job locally, counts jobs to derive `INV{n}` number, stores DraftOrder inside user record, sends to `place-order.php` | **invoice-number race condition**, cart data authored client-side | `PlaceOrder` (server: number, persist job+items+customer, link) |
| PayFast success → mark paid → place order | `payfast-callback.component.ts` | reads draft order, sets `paidAmount=dueToday`, adds manual Online payment, `place_order` | payment marked paid solely by frontend URL hit; no server verification; replayable | `RecordPayment` (server-verified) + `PlaceOrder` |
| Payment calculation | `job.service.ts` (cart_total, applyDiscount, dueAmount) | computes item subtotals, shipping, discount (percent only), deposit half | authoritative monetary state in UI; inconsistencies when discounts not supported | `CalculateOrderTotals` (server-authoritative) |
| Company invoice number/counter | `payments.ts`, `checkout-customer.ts` | `jobService.count(companyId)` → `INV${count+1}` | counter increments on any job; concurrent orders collide | `IssueInvoiceNumber` (server) |
| Customer auto-creation | `job.service.ts` (initCustomerFromUser) | builds Customer from User at order time | duplicated Customers | `EnsureCustomer` command |
| Email confirmation side effects | `order-successful.component.ts` → `OrderEmailHelper` | 3 HTML emails generated + sent from client | SPAM/Fragile, rate limits, HTML injection | `NotifyOrderPlaced` (server) |
| Discount application | `job.service.ts` (applyDiscount) | only `amountOffOrder` + `Percentage` handled; automatic codes ignored | Promo codes computed client-side (cheatable), ignores discount method types | `ValidateDiscount` / `CalculateOrder` |
| Status transition decisions | `job.component.ts` (isCompleted/isOverdue), `jobs.component.ts` (statuses), dashboard status counts | `Not started/In Progress/Stuck/Complete` mapped to UI classes client-side; deadline overdue computed in browser | status semantics drift from backend | `TransitionProjectStatus` command + server-owned status labels |
| Company dashboard metrics | `dashboard.component.ts`, `jobs.component.ts` | counts + total revenue + pending payments summed from list API | Heavy, inconsistent | `DashboardSummary` query |
| Company `counts.php` per dashboard | dashboard | company/counts | | |
| Measurement persistence | `home-measurements.component.ts`, `profile-measurements.component.ts` | merge/sync system measurements into user.Measurements (and save whole user), store local units | whole-user writes on each measurement | `SaveMeasurements` command (per owner) |
| Favourites | `user.service.ts` (like/liked) | toggles array in `User.Metadata.Favorites`, saves whole user | huge user JSON each like; race | `ToggleFavorite` command |
| Profile updates | `BaseProfileComponent.save/updatePassword` | writes whole `User` record, incl. password & token | whole-record write; password change not separate | `UpdateProfile` / `ChangePassword` commands |
| User draft order | `payments.ts` | stores entire Job into `user.Metadata.DraftOrder` | drafts bloated into user record | `SaveDraftOrder` command (server side storage) |

---

## 10. Required future queries by screen

| Future query | Screens served | Required response shape | Current calls replaced |
| --- | --- | --- | --- |
| `DashboardSummary` | `/store/admin` dashboard | counts (products, styles, collections, customers, users, jobs, job items) + status breakdown + revenue | `company/counts.php`, list-summing in jobs/dashboard |
| `ListJobs` (project list) | jobs list | paginated with customer + status + paid/due + overdue | `job/get-jobs.php` + client aggregation |
| `GetProject` (workspace) | job detail | job + items + payments + customer + shipping + company invoice settings + print links | `job/get-job.php`, `update-job.php` (syncs), `check_total` |
| `ProductionBoard` (garment kanban) | job-cards | per staff: jobcard rows w/ assignment, status, measurements, print | `job-item/get-job-items-by-status.php` |
| `CustomerList` (with metrics) | customers list | customer profile summaries incl. outstanding/LTV/completion | `customer/list.php` + enhanced fields |
| `GetCustomerProfile` | customer detail | full customer + metrics + contact + jobs | `customer/get.php` |
| `ProductEditorBundle` | admin product | product + its categories + all company categories + all variations | `products/get.php`, `categories/list-by-company-id.php`, `variation/list.php` |
| `ProductList` | admin products | paginated product cards + filters (category, stock, featured) | `products/products.php` + client filtering |
| `CategoryTree` | admin categories/category | nested tree with counts | `categories/category-and-children.php` |
| `StorefrontBundle` | shop home, explore collections, | company + categories + featured + pinned + slides + work | `shop/get-shop.php` + `otherInfo.search` (work gallery) |
| `ProductDetail` | product page | product + company + images + variations (options) | `products/get.php` |
| `CheckoutSummary` | checkout / payments | items, shipping, discount, totals (authoritative) | cart_total + discount + shipping client calc |
| `OrderConfirmation` | order-successful | order + items + payment + invoice URL + emails sent flag | `job/get-job.php` |
| `CompanySettings` | settings hub | all company metadata + size/measurement catalogs | `company/get.php`, `otherInfo.search` |
| `PublicCompany` | shops, gallery | public company profile + gallery | `shop/get-shop.php`, `otherInfo.company-info.php` |
| `UserProfile` | my-profile | user + measurements + favourites + addresses | `user/get.php` |

---

## 11. Statuses, constants, and business rules discovered

All definitions from `src/constants/Constants.ts`, `src/models/*`, and component code.

### Job / project statuses (`Constants.OrderStatus`, `job.component.ts.statuses`, `jobs.component.ts`, `initJob`)
- `Not started` / `In Progress` / `Completed` / `Stuck` / `Terminated` / `Paused` (job.component.ts:19-26)
- `Class` value `'not-started'` (initJob)
- `StatusId` (int) used in many models — unknown semantic mapping — **Unconfirmed**; backend needed.
- `StatusDisplay` (backend-computed label), `IsOverdue`, `DaysRemaining`, `FormattedCost` (backend-computed on Job — evidence that backend already computes these, matching future-query direction).

### Order statuses (legacy `Constants.OrderStatus`)
- `Cart`, `Placed`, `Processing`, `OnWay`, `Delivered`, `Cancelled`, `Not paid`, `WaitingForPaymentVerification`, `WaitingForProofOfPayment`.

### Payment statuses (`Constants.PaymentStatus`)
- `Paid`, `Paying`, `Pending`, `Partial`.

### Payment types
- `Full`, `Half` (Constants.PaymentTypes).

### Payment methods
- `Payfast` (Constants.PaymentMethods) / `Transfer` (`PayMethods.Payfast`/`Transfer`).

### Fulfilment
- `Order.FulfillmentStatus` (string) — unused in UI.

### Product statuses
- `ProductStatus` (string) field exists; UI toggles `ShowOnline` (`0/1`), `IsFeatured` (`Yes`/`No`), `StockType` (`Stock product`/`Made To Order`), `ProductType` (`Ready to wear`/`Custom`), `IsJustInTime`.

### Discount methods / types
- `Method`: `Automatic` | `Discount Code`.
- `DiscountType`: `amountOffOrder`, `amountOffProducts`, `buyXGetYFree`, `shippingDiscount` (IDiscount.ts).
- `DiscountValueType`: `Percentage` | `Fixed` (labeled "Amount" in the discount editor UI).

### User / customer types
- `Constants.Roles` = `Admin`, `Customer`, `Staff`.
- `Customer.CustomerType` = `'Customer'` (also seen in `Customer` model).
- `CustomerStatus` (computed, e.g. "New", "Active", etc.), `CustomerPriority` (e.g. "Low"/"High").

### Visibility and feature flags
- `Company.ShowOnline` (0/1); product `ShowOnline`.
- `IsFeatured` (Yes/No) = pinned.
- `ShowRemainingItems` (int).

### Frontend validation / state-transition rules
- Password rules: reset (`reset-password.ts`): length ≥8, number, special, upper, lower; all required.
- Checkout contact validation: name, email, phone, address (if delivery), city, postal code (checkout-customer.ts).
- Payment: `placeOrder` requires `Metadata.paymentProof` for bank; order only if user draft set.
- Delivery: `DeliveryFee = 150` flat; ShippingOptions = Delivery R150 / Collection R0.
- Deposit = `TotalCost / 2`.
- Add-to-cart requires a size (or 'Measurements' all filled).
- Invoice number: `INV{count+1}`.

**Distinguish:**
- `confirmed current rule` — e.g. delivery fee 150 (Constants), status list, discount logic, reset rules.
- `frontend-only rule` — invoice number `INV{count+1}`, deposit/amount calc, favourites, payment proof gating, profile measurement deletion, job `IsOverdue`/`DaysUntilDue`, home measurements (localStorage UnitsStore) → could be UI comfort only.
- `inferred rule needing backend confirmation` — `StatusId` semantics, `Job.Class`, `FulfillmentStatus`, discount limit (MaxUses/MaxUsesPerUser), backend computed fields, system sizes/measurement `OTHER_TYPES` strings (`SystemSizes`/`SystemMeasurement` vs legacy `Sizes`/`Measurements` mismatch risk).

---

## 12. Data ownership and privacy classification

| Area | Classification | Notes |
| --- | --- | --- |
| Company/tenant profile & content | Public read (storefront), Staff/admin write | Storefront shows `company.get-shop` data incl. WhatsApp number & banking details in checkout |
| Product catalogue | Public read; Staff/admin write | categories/collections/variations admin-only |
| Work gallery | Public read; Staff/admin write | displayed on public shop pages |
| Orders/Projects (Jobs) | Staff/admin read/write; Customer read (own, via `getJobs(CreateUserId)`) | `place-order` returns full Job incl. payments + proof |
| Measurements (customer) | Authenticated self-service + Staff/admin read/write | stored on User & JobItem; also `localStorage` (guest) |
| Customer address | Sensitive/private | profile address + checkout shipping |
| User passwords / tokens | Sensitive/private — **stored in `localStorage` plaintext and posted in full user payloads** | needs explicit redesign (hashed server-side, token-based auth) |
| Bank account details (Company) | Staff/admin read/write; displayed to customers on bank-transfer checkout | `ShowBankingDetailsComponent` renders account number/holder/branch — **must be kept private behind order context** |
| Payment proofs | Private; admin review | uploaded proof stored as URL in job Metadata |
| Payment journal | Private; admin | stored inside Job metadata |
| Uploaded images (media) | Public read (URLs); upload/write protected | orphan cleanup exists |
| `User` record | Authenticated self-service; admin (company) | **full User object is sent back to every client** |
| Analytics/computed customer metrics | Staff/admin read | in customer.get response |

Areas needing explicit authorization design:
1. Bank transfer details exposure.
2. Payment-proof visibility.
3. Draft order persistence (whole job inside user metadata).
4. `super-admin` shell without auth.
5. Favourites / saved measurements cross-account.

---

## 13. Gaps, broken flows, dead code, and decisions needed

| Finding | Evidence / source | Impact | Recommended decision |
| --- | --- | --- | --- |
| No route guards | `app-routing.module.ts`, `home-routing.module.ts`, `admin-routing.module.ts` (no guards) | any route open | Add auth + role guards on `/store/admin` and `/super-admin` |
| PayFast payment marked "paid" client-side on redirect page | `payfast-callback.component.ts` | financial integrity | Move payment verification server-side; payFast notify callback stub |
| PayFast merchant id/key hard-coded in client bundle | `payfast.component.ts:18-19` | secret leakage | Move to server config; use server-side payment confirmation |
| `ShopingCallbackComponent` (notify_url) is empty | `shoping-callback.component.ts` | payment confirm not handled | Server endpoint must handle notify |
| Invoice number from `job/count.php` | `checkout-customer.ts:62`, `payments.ts:46` | number collisions/race | Server-issued invoice numbers |
| Draft order stored inside User record (`Metadata.DraftOrder`) | `payments.ts:83-90` | bloat, privacy, whole-user writes | Separate draft-order storage |
| `Job.Customer`/`User` duplicate identity | `job.service.ts: 64-97`, `customer.service.ts` | duplicate customers | `CreateCustomer` dedupe command |
| **Dead**: `OrderService` unused | `order.service.ts` (only self-references) | confusing | Retire order endpoints once migrated |
| **Dead**: legacy `ProductsComponent` (`/store/admin/products` now `AdminProductsComponent`) | `products.component.ts` (only route commented-out path to `Products`) — Actually **route currently points to `AdminProductsComponent`**; `ProductsComponent` still declared in admin module but unreachable | Dead code | Remove after migration |
| **Dead**: `InvoiceComponent` stub | `invoice.component.ts` (empty), route still exists | nothing | remove route or implement |
| **Dead**: `job-work.php`/`getJobWorksSync` never called | `job.service.ts:161-165` | — | confirm/remove |
| **Dead**: `getJobItemsByUser`, `order/list-for-user.php`, `customer/list-for-user.php`, `product-variation*`, `variation-option/save.php`, `image/add.php`, `user/get-shop.php`, `user/get-admin-stat.php` | not consumed by components | — | retire |
| **Dead**: `LandingComponent`, `IndexComponent`, `RegisterComponent`, `MyShopComponent`, `ProductDetailsComponent`, `ProductMeasurementsComponent` legacy screens commented out in routes | home-routing.module.ts commented blocks; `index.component.html` uses `LandingComponent` but route pointed at TuiHome | dead/unreachable | remove or keep as legacy |
| **Broken**: `/store/admin/jobs/:status` param unused | `jobs.component.ts` filters by `selectedStatus` not route param | filter shows everything | use status or drop param |
| **Bug**: `JobCardsComponent` calls `getJobItemsByStatus(1)` hardcoded | `job-cards.component.ts:33` | shows wrong staff board | pass current user id |
| **Bug**: `MyShopBettaComponent` `product cards` link to `/product/{{product.Slug}}` but route is `/product/:productId` loading via `ProductBettaComponent` | `my-shop-betta.component.ts:63` | slug/id mismatch may 404 on public | align to `productId` route or add slug route |
| **Broken**: `home/collections` (no companyId) shows nothing | `collections.component.ts` expects companyId | empty | gate or redirect |
| **Half-built**: super-admin users/products/orders/payments/reports | `super-nav.component.ts` menu vs routes only companies/users | — | define super-admin scope or remove |
| **Incomplete**: production assignment is per-job-item `Metadata.AssignedTo`, no `jobwork` tables in UI | `job-card.component.html`, `job-item-form.component.ts` | ok for MVP, no schedule | Decide if jobwork needed |
| Admin "Record payment" button is stub | `jobs.component.ts:193-197` | missing feature | implement or remove |
| Customer "Create Job" on customer page navigates to `/store/admin/jobs/new` (no route) | `customer.component.ts:48-55` | broken | point to `/store/admin/jobs/new` handled or `add-job` modal |
| Duplicate login vs /register | `SignupComponent` routed + `SignUpModalComponent` unrouted; `LoginModal` unrouted (commented in home.component.html) | dead entry | clean up |
| Email on order-successful duplicate logic | `OrderEmailHelper` instantiated in `payments.ts` and `order-successful` | double emails if both pages loaded | single server trigger |
| Payment proof gating only when bank | `payments.component.ts:124-133` | fine | keep |
| `CustomerFormComponent` auto-fills 15 default measurements on every customer edit | `customer-form.component.ts:18-38` | pre-populated empty measurements may be saved | skip defaults when editing |
| Image resize uses client-side canvas (`IMAGE_CROP_SIZE`) | `upload.service.ts`, `upload.component.ts` | inconsistent resizing / duplicates | server media processing |

---

## 14. Recommended command/query roadmap

### Phase 1 — Foundation: auth, tenant context, envelope, repository adapters
- Commands: `RegisterCustomer`, `Login`, `RequestPasswordReset`, `ChangePassword`, `CreateCompany`, `ActivateCompany` (admin), `Authenticate`.
- Queries: `Me` (current session/context).
- Screens covered: sign-in/sign-up/forgot/reset, profile.
- Replaces: `user/login.php`, `user/save.php`, `user/get-by-email.php`, `user/change-password.php`.
- Dependency/risk: requires token-based sessions + per-tenant context; remove full-User local-store.
- Tests: sign-up/login/email verify/password reset flows; tenant creation; token expiry.

### Phase 2 — Dashboard and read queries
- Queries: `DashboardSummary`, `ListProjects`, `ProductionBoard`, `CustomerList`, `UserList`.
- Screens: dashboard, jobs list, job cards, customers, users.
- Replaces: `company/counts.php`, `job/get-jobs.php`, `job/get-job-items-by-status.php`, `customer/list.php`, `user/users.php`.
- **Dependency**: Phase-1 auth; risk is metric definition (statuses per tenant).
- Tests: dashboard returns expected counts; boards honor role/company scope.

### Phase 3 — Customers and project workspace
- Queries: `GetCustomerProfile`, `GetProject`, `GetCustomerOptions`.
- Commands: `UpsertCustomer`, `CreateProject`, `CreateCustomer`, `SaveMeasurements`.
- Screens: customers, customer detail, add-job, job detail (project shell).
- Replaces: `customer/save.php`, `customer/get.php`, `job/add-job.php`, `job/get-job.php`, `job/update-job.php` (partial), `job/count.php` (invoice number).
- Risk: customer/user de-duplication; job numbering.
- Tests: create customer+project; duplicate email handling; measurement save.

### Phase 4 — Project/garment/measurement commands
- Commands: `AddProjectGarment`, `UpdateProjectGarment`, `RemoveProjectGarment`, `TransitionProjectStatus`, `RecordProjectPayment`, `UpdateProjectShipping`, `SaveSpecialInstructions`.
- Queries: `GetProjectGarment`, `ProductionBoard` (existing).
- Replaces: job-item endpoints, job/update-job (status/items/payment), uploads on job.
- **Dependency**: Phase-3 workspace; risk: status/transition model + payment ledger invariants.
- Tests: item CRUD, status transitions (incl. Guard invalid moves), payment due/paid recalc.

### Phase 5 — Production and assignment
- Commands: `AssignGarment`, `UpsertUserShift` (shift/rates), `CreateStaff`, `UpdateStaff`.
- Queries: `StaffBoard`, `StaffShifts`.
- Replaces: `job-item/get-job-items-by-status.php`, `user-shifts` (metadata), user save.
- Tests: assignment authorization (only tenant staff), shift price calculation.

### Phase 6 — Commercial flow: quotations, checkout, orders, payments
- Commands: `SaveDraftOrder`, `PlaceOrder`, `ValidateDiscount`, `ApplyDiscount`, `RecordPayment`, `VerifyPayfastNotification`, `SendOrderConfirmation`.
- Queries: `CheckoutSummary`, `OrderConfirmation`.
- Replaces: `job/place-order.php`, `discounts/get-by-code.php`, `order/*` (legacy), email service from client, payfast notify.
- **Dependency**: phases 3–4 (project + customer exist). Risk: financial correctness; proof-of-payment.
- Tests: full checkout end-to-end (cart → draft → discount → payment → confirm), PayFast notify verification, refund/void.

### Phase 7 — Catalogue, products, categories, variations, discounts, media
- Commands: `SaveProduct`, `SetProductPinned`, `RemoveProductImage`, `BulkUpdateProducts`, `SaveCategory`, `DeleteCategory`, `SaveVariation`, `SaveVariationOption`, `SaveDiscount`, `DeleteDiscount`, `UploadAsset`.
- Queries: `ProductEditor`, `ProductList`, `CategoryTree`, `GetDiscount`, `ListDiscounts`, `GetCategoryProducts`.
- Replaces: most products/categories/variations/discounts/uploads endpoints.
- **Dependency**: independent after foundation; risk: category/variation tree integrity + image storage.
- Tests: product CRUD + category membership, variation options, upload/delete asset, discount validity windows.

### Phase 8 — Legacy API retirement
- Deprecate: `order/*`, unused endpoints, `user/get-shop.php`, `user/get-admin-stat.php`, `products/query.php`, `other_info/list.php`, `product-variation-option`/`product-variation` (verify before removing).
- Shut down frontend localStorage cart/draft mechanisms; ensure migration (any existing drafts in `user.Metadata.DraftOrder` migrated to `SaveDraftOrder`).
- **Acceptance**: none of the audit's "unused/dead" endpoints called by new frontend; all business rules server-owned.

---

## Final quality note

Every conclusion above is traceable to `src/app/**`, `src/services/**`, `src/models/**`, or `src/constants/**`. Wherever behaviour could not be fully confirmed from the frontend, it is explicitly marked **Unconfirmed** (most notably: `StatusId` semantics, `Job.Class` mapping, `FulfillmentStatus`, backend-computed fields contract, discount `buyXGetYFree`/`shippingDiscount` semantics, super-admin access control, `IsOverdue`/`DaysRemaining` sources). No source changes were made during this audit.
