import { Module } from "@nestjs/common";
import { WalletService } from "./wallet.service.js";

// Service nội bộ cho tính nhất quán của đơn hàng và hoàn tiền kế thừa.
// Không đăng ký API ví điện tử trong hệ thống chỉ quản trị nội bộ.
@Module({ providers: [WalletService], exports: [WalletService] })
export class WalletModule {}
