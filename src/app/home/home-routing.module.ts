import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { IndexComponent } from './index/index.component';
import { AboutComponent } from './about/about.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { RegisterComponent } from './register/register.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { MyShopComponent } from './my-shop/my-shop.component';
import { CollectionsComponent } from './collections/collections.component';
import { CollectionItemsComponent } from './collection-items/collection-items.component';
import { MyShopContentComponent } from './my-shop-content/my-shop-content.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { PaymentCallBackComponent } from './shoping-successful/payfast-callback.component';
import { ShopingCancelledComponent } from './shoping-cancelled/shoping-cancelled.component';
import { ShopingCallbackComponent } from './shoping-callback/shoping-callback.component';
import { ShopsComponent } from './shops/shops.component';
import { TuiHomeComponent } from './t-ui/tui-home/tui-home.component';
import { MyShopBettaComponent } from './my-shop-betta/my-shop-betta.component';
import { ProductBettaComponent } from './product-betta/product-betta.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { PaymentsComponent } from './payments/payments.component';
import { OrderSuccessfulComponent } from './order-successful/order-successful.component';
import { CartPageComponent } from './cart-page/cart-page.component';
import { SignupComponent } from './signup/signup.component';
import { CollectionComponent } from './collection/collection.component';
import { ProductsBettaComponent } from './products-betta/products-betta.component';
import { CleanUpImagesComponent } from './clean-up-images/clean-up-images.component';
import { SuperDashboardComponent } from './super-dashboard/super-dashboard.component';
import { SuperCompaniesComponent } from './super-companies/super-companies.component';
import { SuperCompanyComponent } from './super-company/super-company.component';
import { SuperUsersComponent } from './super-users/super-users.component';
import { SuperUserComponent } from './super-user/super-user.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { Constants } from 'src/constants/Constants';
import { GalleryShowCaseListComponent } from './gallery-show-case-list/gallery-show-case-list.component';
import { GalleryDetailsComponent } from './gallery-details/gallery-details.component';
import { ExploreCollectionsComponent } from './shop-v2/explore-collections/explore-collections.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        // component: IndexComponent,
        component: TuiHomeComponent,
      },
      {
        path: 'home',
        // component: IndexComponent,
        component: TuiHomeComponent,
      },
      {
        path: ':id',
        // component: MyShopComponent,
        component: MyShopBettaComponent,
        // children: [
        //   {
        //     path: '',
        //     component: MyShopContentComponent,
        //   },
        //   {
        //     path: 'collections',
        //     component: CollectionsComponent,
        //   },
        //   {
        //     path: 'collections/:category',
        //     component: CollectionItemsComponent,
        //   },
        //   {
        //     path: 'collections',
        //     component: CollectionsComponent,
        //   },
        //   {
        //     path: 'product/:product',
        //     component: ProductDetailsComponent,
        //   },
        // ],
      },
      {
        path: 'product/:productId',
        component: ProductBettaComponent,
      },
      {
        path: 'home/checkout',
        component: CheckoutComponent,
      },
      {
        path: 'home/cart',
        component: CartPageComponent,
      },
      {
        path: 'home/payments',
        component: PaymentsComponent,
      },
      {
        path: 'home/payments/:id',
        component: PaymentsComponent,
      },
      {
        path: 'home/order-successful/:id',
        component: OrderSuccessfulComponent,
      },

      {
        path: 'home/shops',
        component: ShopsComponent,
      },
      {
        path: 'home/sign-in',
        component: SignInComponent,
      },
      {
        path: 'home/sign-in/:returnTo',
        component: SignInComponent,
      },
      {
        path: 'home/sign-up',
        component: SignupComponent,
      },
      {
        path: 'home/sign-up/:returnTo',
        component: SignupComponent,
      },
      {
        path: 'home/forgot-password',
        component: ForgotPasswordComponent,
      },
      {
        path: 'home/forgot-password/:returnTo',
        component: ForgotPasswordComponent,
      },
      {
        path: `home/${Constants.PassUrl}/:token`,
        component: ResetPasswordComponent,
      },
      {
        path: 'home/my-profile',
        component: MyProfileComponent,
      },
      {
        path: 'home/collections',
        component: CollectionsComponent,
      },
      // Shop collections
      {
        path: 'home/collections/:companyId',
        component: ExploreCollectionsComponent,
      },
      // Collections by category
      {
        path: 'home/collections/:companyId/:categoryId',
        component: CollectionsComponent,
      },
      {
        path: 'home/collection/:collectionId',
        component: CollectionComponent,
      },
      {
        path: 'home/collection/:collectionId/:companyId',
        component: CollectionComponent,
      },
      {
        path: 'home/collection/:collectionId/:companyId/:type',
        component: CollectionComponent,
      },
      {
        path: 'home/products',
        component: ProductsBettaComponent,
      },

      {
        path: 'home/products/:companyId',
        component: ProductsBettaComponent,
      },
      {
        path: 'home/products/:companyId/:categoryId',
        component: ProductsBettaComponent,
      },

      {
        path: 'home/shoping-successful/:id',
        component: PaymentCallBackComponent,
      },
      {
        path: 'home/shoping-callback/:id',
        component: ShopingCallbackComponent,
      },
      {
        path: 'home/shoping-cancelled/:id',
        component: ShopingCancelledComponent,
      },
      {
        path: 'home/work-show-case/:companyId/:slug',
        component: GalleryShowCaseListComponent,
      },
      {
        path: 'home/work-show-details/:id',
        component: GalleryDetailsComponent,
      },
      // super admin
      {
        path: 'super/admin',
        component: SuperDashboardComponent,
        children: [
          {
            path: 'clean-up-images',
            component: CleanUpImagesComponent,
          },
          {
            path: 'companies',
            component: SuperCompaniesComponent,
          },
          {
            path: 'company/:id',
            component: SuperCompanyComponent,
          },
          {
            path: 'users',
            component: SuperUsersComponent,
          },
          {
            path: 'user/:id',
            component: SuperUserComponent,
          },
        ],
      },

      // {
      //   path: 'home/sign-up',
      //   component: RegisterComponent,
      // },
      // {
      //   path: 'shop/product/:shop/:product',
      //   component: ProductDetailsComponent,
      // },
      // {
      //   path: 'shop/collections/:id',
      //   component: CollectionsComponent,
      // },
      // {
      //   path: 'shop/collections/:id/:category',
      //   component: CollectionItemsComponent,
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
