import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './home-shared/nav/nav.component';
import { LogoComponent } from './home-shared/nav/logo/logo.component';
import { HomeComponent } from './home/home.component';
import { IndexComponent } from './index/index.component';
import { HomeRoutingModule } from './home-routing.module';
import { LandingComponent } from './landing/landing.component';
import { AboutComponent } from './about/about.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { RegisterComponent } from './register/register.component';
import { FooterComponent } from './footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductDescriptionComponent } from './product-description/product-description.component';
import { ProductImagesComponent } from './product-images/product-images.component';
import { ProductRelatedComponent } from './product-related/product-related.component';
import { MyShopComponent } from './my-shop/my-shop.component';
import { ImageSliderComponent } from './image-slider/image-slider.component';
import { ShopNavComponent } from './shop-nav/shop-nav.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { AboutShopComponent } from './about-shop/about-shop.component';
import { ShopStatComponent } from './shop-stat/shop-stat.component';
import { ShopContactComponent } from './shop-contact/shop-contact.component';
import { ShopCtaComponent } from './shop-cta/shop-cta.component';
import { CollectionsComponent } from './collections/collections.component';
import { CollectionItemsComponent } from './collection-items/collection-items.component';
import { ProductSliderComponent } from './product-slider/product-slider.component';
import { MyShopContentComponent } from './my-shop-content/my-shop-content.component';
import { CartComponent } from './cart/cart.component';
import { QtyComponent } from './qty/qty.component';
import { DeliveryMethodComponent } from './delivery-method/delivery-method.component';
import { CheckoutCustomerComponent } from './checkout-customer/checkout-customer.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { ShippingInfoComponent } from './shipping-info/shipping-info.component';
import { SignUpModalComponent } from './sign-up-modal/sign-up-modal.component';
import { ForgotPasswordModalComponent } from './forgot-password-modal/forgot-password-modal.component';
import { OrderTotalComponent } from './order-total/order-total.component';
import { ChooseDeliveryMethodComponent } from './choose-delivery-method/choose-delivery-method.component';
import { ListJobItemsComponent } from './list-job-items/list-job-items.component';
import { CustomerJobDetailsComponent } from './customer-job-details/customer-job-details.component';
import { ViewUserContactComponent } from './view-user-contact/view-user-contact.component';
import { PaymentsComponent } from './payments/payments.component';
import { ChoosePaymentMethodComponent } from './choose-payment-method/choose-payment-method.component';
import { ChoosePaymentAmountComponent } from './choose-payment-amount/choose-payment-amount.component';
import { ShowBankingDetailsComponent } from './show-banking-details/show-banking-details.component';
import { PayfastComponent } from './payfast/payfast.component';
import { FavouriteComponent } from './favourite/favourite.component';
import { MainQtyComponent } from './main-qty/main-qty.component';
import { InputErrorComponent } from './input-error/input-error.component';
import { CustomProductNoteComponent } from './custom-product-note/custom-product-note.component';
import { SelectSizeComponent } from './select-size/select-size.component';
import { ProductBreadComponent } from './product-bread/product-bread.component';
import { ModalHeaderHomeComponent } from './modal-header-home/modal-header-home.component';
import { ProductMeasurementsComponent } from './product-measurements/product-measurements.component';
import { UploadInputComponent } from './upload-input/upload-input.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { InputComponent } from './shared/input/input.component';
import { ProfileContactComponent } from './profile-contact/profile-contact.component';
import { ProfileAddressComponent } from './profile-address/profile-address.component';
import { ProfileOrdersComponent } from './profile-orders/profile-orders.component';
import { ProfilePasswordComponent } from './profile-password/profile-password.component';
import { HomeMeasurementsComponent } from './home-measurements/home-measurements.component';
import { ProfileMeasurementsComponent } from './profile-measurements/profile-measurements.component';
import { OrderListImagesComponent } from './order-list-images/order-list-images.component';
import { ProfileOrderComponent } from './profile-order/profile-order.component';
import { ProfileJobItemsComponent } from './profile-job-items/profile-job-items.component';
import { ProfileJobItemComponent } from './profile-job-item/profile-job-item.component';
import { PaymentCallBackComponent } from './shoping-successful/payfast-callback.component';
import { ShopingCancelledComponent } from './shoping-cancelled/shoping-cancelled.component';
import { ShopingCallbackComponent } from './shoping-callback/shoping-callback.component';
import { ShopsComponent } from './shops/shops.component';
import { PhoneNavComponent } from './phone-nav/phone-nav.component';
import { PhoneTopBarComponent } from './phone-top-bar/phone-top-bar.component';
import { ShopFeaturedComponent } from './shop-featured/shop-featured.component';
import { ProductCardComponent } from './product-card/product-card.component';
import { TuiHomeComponent } from './t-ui/tui-home/tui-home.component';
import { TuiNavComponent } from './t-ui/tui-nav/tui-nav.component';
import { TuiNewInComponent } from './t-ui/tui-new-in/tui-new-in.component';
import { TuiProductCardComponent } from './tui-product-card/tui-product-card.component';
import { NewInComponent } from './new-in/new-in.component';
import { IntroComponent } from './intro/intro.component';
import { CollectionBannerComponent } from './collection-banner/collection-banner.component';
import { SeeMoreComponent } from './see-more/see-more.component';
import { TopCollectionsComponent } from './top-collections/top-collections.component';
import { CollectionCardComponent } from './collection-card/collection-card.component';
import { JoinUsCtaComponent } from './join-us-cta/join-us-cta.component';
import { MyShopBettaComponent } from './my-shop-betta/my-shop-betta.component';
import { SlidesComponent } from './slides/slides.component';
import { ShopFeedbackComponent } from './shop-feedback/shop-feedback.component';
import { ProductBettaComponent } from './product-betta/product-betta.component';
import { SizeComponent } from './size/size.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { OrderSuccessfulComponent } from './order-successful/order-successful.component';
import { CheckoutNavComponent } from './checkout-nav/checkout-nav.component';
import { CartPageComponent } from './cart-page/cart-page.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileNavComponent } from './profile-nav/profile-nav.component';
import { ShopPlaceholderComponent } from './shop-placeholder/shop-placeholder.component';
import { CollectionComponent } from './collection/collection.component';
import { ProductsBettaComponent } from './products-betta/products-betta.component';
import { CleanUpImagesComponent } from './clean-up-images/clean-up-images.component';
import { SuperDashboardComponent } from './super-dashboard/super-dashboard.component';
import { SuperNavComponent } from './super-nav/super-nav.component';
import { SuperCompaniesComponent } from './super-companies/super-companies.component';
import { SuperCompanyComponent } from './super-company/super-company.component';
import { SuperUsersComponent } from './super-users/super-users.component';
import { SuperUserComponent } from './super-user/super-user.component';
import { ContactUsModalComponent } from './contact-us-modal/contact-us-modal.component';
import { BookConsultationComponent } from './book-consultation/book-consultation.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { BreadComponent } from './bread/bread.component';
import { CardsCarouselComponent } from './cards-carousel/cards-carousel.component';
import { LoadingComponent } from '../loading/loading.component';
import { MobileBackComponent } from './mobile-back/mobile-back.component';
import { ProductColorComponent } from './product-color/product-color.component';
import { RadioComponent } from './radio/radio.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ListIconHomeComponent } from './list-icon-home/list-icon-home.component';
import { CartIconComponent } from './cart-icon/cart-icon.component';
import { GalleryShowCaseComponent } from './gallery-show-case/gallery-show-case.component';
import { GalleryShowCaseListComponent } from './gallery-show-case-list/gallery-show-case-list.component';
import { GalleryDetailsComponent } from './gallery-details/gallery-details.component';
import { HeroHeaderComponent } from './shop-v2/hero-header/hero-header.component';
import { CategorySectionComponent } from './shop-v2/category-section/category-section.component';
import { CategoryCardComponent } from './shop-v2/category-card/category-card.component';
import { FeaturedProductsSectionComponent } from './shop-v2/featured-products-section/featured-products-section.component';
import { StoreFooterComponent } from './shop-v2/store-footer/store-footer.component';
import { ExploreCollectionsComponent } from './shop-v2/explore-collections/explore-collections.component';
import { ProductVariationOptionsComponent } from './shop-v2/product-variation-options/product-variation-options.component';
import { TypeFashionNavComponent } from "src/app/type-fashion-nav/type-fashion-nav.component";
import { NavigationComponent } from './v.2025/navigation/navigation.component';

@NgModule({
  declarations: [
    NavComponent,
    LogoComponent,
    HomeComponent,
    IndexComponent,
    LandingComponent,
    AboutComponent,
    RegisterComponent,
    FooterComponent,
    ProductDetailsComponent,
    ProductDescriptionComponent,
    ProductImagesComponent,
    ProductRelatedComponent,
    MyShopComponent,
    ImageSliderComponent,
    ShopNavComponent,
    TestimonialsComponent,
    AboutShopComponent,
    ShopStatComponent,
    ShopContactComponent,
    ShopCtaComponent,
    CollectionsComponent,
    CollectionItemsComponent,
    ProductSliderComponent,
    MyShopContentComponent,
    CartComponent,
    QtyComponent,
    DeliveryMethodComponent,
    CheckoutCustomerComponent,
    VerifyEmailComponent,
    LoginModalComponent,
    ShippingInfoComponent,
    SignUpModalComponent,
    ForgotPasswordModalComponent,
    OrderTotalComponent,
    ChooseDeliveryMethodComponent,
    ListJobItemsComponent,
    CustomerJobDetailsComponent,
    ViewUserContactComponent,
    PaymentsComponent,
    ChoosePaymentMethodComponent,
    ChoosePaymentAmountComponent,
    ShowBankingDetailsComponent,
    PayfastComponent,
    FavouriteComponent,
    MainQtyComponent,
    InputErrorComponent,
    CustomProductNoteComponent,
    SelectSizeComponent,
    ProductBreadComponent,
    ModalHeaderHomeComponent,
    ProductMeasurementsComponent,
    UploadInputComponent,
    MyProfileComponent,
    InputComponent,
    ProfileContactComponent,
    ProfileAddressComponent,
    ProfileOrdersComponent,
    ProfilePasswordComponent,
    HomeMeasurementsComponent,
    ProfileMeasurementsComponent,
    OrderListImagesComponent,
    ProfileOrderComponent,
    ProfileJobItemsComponent,
    ProfileJobItemComponent,
    PaymentCallBackComponent,
    ShopingCancelledComponent,
    ShopingCallbackComponent,
    ShopsComponent,
    PhoneNavComponent,
    PhoneTopBarComponent,
    ShopFeaturedComponent,
    TuiHomeComponent,
    TuiNavComponent,
    TuiNewInComponent,
    TuiProductCardComponent,
    NewInComponent,
    IntroComponent,
    CollectionBannerComponent,
    SeeMoreComponent,
    TopCollectionsComponent,
    CollectionCardComponent,
    JoinUsCtaComponent,
    MyShopBettaComponent,
    SlidesComponent,
    ShopFeedbackComponent,
    ProductBettaComponent,
    SizeComponent,
    CheckoutComponent,
    OrderSummaryComponent,
    OrderSuccessfulComponent,
    CheckoutNavComponent,
    CartPageComponent,
    SignInComponent,
    SignupComponent,
    ProfileNavComponent,
    ShopPlaceholderComponent,
    CollectionComponent,
    ProductsBettaComponent,
    CleanUpImagesComponent,
    SuperDashboardComponent,
    SuperNavComponent,
    SuperCompaniesComponent,
    SuperCompanyComponent,
    SuperUsersComponent,
    SuperUserComponent,
    ContactUsModalComponent,
    BookConsultationComponent,
    ToggleButtonComponent,
    BreadComponent,
    CardsCarouselComponent,
    LoadingComponent,
    MobileBackComponent,
    ProductColorComponent,
    RadioComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ListIconHomeComponent,
    CartIconComponent,
    GalleryShowCaseComponent,
    GalleryShowCaseListComponent,
    GalleryDetailsComponent,
    FeaturedProductsSectionComponent,
    StoreFooterComponent,
    ExploreCollectionsComponent,
    ProductVariationOptionsComponent,
    TypeFashionNavComponent,
    NavigationComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CategoryCardComponent,
    CategorySectionComponent,
    ProductCardComponent,
    HeroHeaderComponent,

],
})
export class HomeModule {}
