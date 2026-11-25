import { Module } from "@nestjs/common";
import { AuthCompatModule } from "./auth/auth-compat.module.js";
import { MediaModule } from "./media/media.module.js";
import { AccountModule } from "./modules/account/account.module.js";
import { AdminModule } from "./modules/admin/admin.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { CartModule } from "./modules/cart/cart.module.js";
import { IdentityModule } from "./modules/identity/identity.module.js";
import { CouponModule } from "./modules/coupons/coupon.module.js";
import { OrdersModule } from "./modules/orders/orders.module.js";
import { PaymentModule } from "./modules/payment/payment.module.js";
import { ShippingModule } from "./modules/shipping/shipping.module.js";
import { NotificationsModule } from "./modules/notifications/notifications.module.js";
import { ProductsModule } from "./modules/products/products.module.js";
import { SearchModule } from "./modules/search/search.module.js";
import { DatabaseModule } from "./database/database.module.js";
import { HealthModule } from "./health/health.module.js";
import { MigrationModule } from "./migration/migration.module.js";

@Module({
  imports: [
    DatabaseModule,
    MigrationModule,
    AuthCompatModule,
    MediaModule,
    HealthModule,
    IdentityModule,
    SearchModule,
    AdminModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    CouponModule,
    ShippingModule,
    OrdersModule,
    PaymentModule,
    AccountModule,
    NotificationsModule,
  ],
})
export class AppModule {}
