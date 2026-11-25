# MilkShopManagement

Web Admin React/Vite + NestJS/Prisma + MariaDB. Không còn Mobile và website khách hàng.

## Khởi tạo database trên Windows / XAMPP

1. Bật MySQL trong XAMPP.
2. Import **database/MilkShop_MariaDB.sql** qua phpMyAdmin hoặc CMD:
   `"C:\xampp\mysql\bin\mysql.exe" -u root < database\MilkShop_MariaDB.sql`
   Nếu root có mật khẩu, thêm `-p`. Schema chỉ tạo database `milkshop`, không DROP dữ liệu; seed danh mục/sản phẩm sữa mẫu.
3. Tạo tài khoản DB riêng bằng database/mysql-bootstrap.sql (thay CHANGE_ME bằng mật khẩu riêng trước khi chạy).
4. Sao chép `apps/api/.env.example` thành `apps/api/.env`. Điền DATABASE_URL (database phải là `milkshop`), JWT_KEY riêng tối thiểu 32 ký tự ngẫu nhiên, MILKSHOP_ADMIN_EMAIL và MILKSHOP_ADMIN_PASSWORD (tối thiểu 12 ký tự). Không commit .env.
5. Từ thư mục gốc chạy:
   ```cmd
   npm --prefix apps/api install
   npm --prefix apps/web install
   npm run backend:db:seed-admin
   run.bat
   ```
   Seed tạo RBAC và tài khoản Admin bằng BCrypt; chạy lại không thay mật khẩu tài khoản đã tồn tại. Sau khi seed, có thể xóa MILKSHOP_ADMIN_PASSWORD khỏi .env.
6. `run.bat` mở hai cửa sổ BE/FE độc lập, Vite tự mở trang đăng nhập Admin. Nếu API chưa sẵn sàng, launcher hiển thị cảnh báo nhưng không chặn FE. Kiểm tra http://localhost:5300/health (status ok, 57 bảng), http://localhost:5300/docs và http://localhost:5173/admin/login.

## Phạm vi hiện tại

Schema giữ 57 bảng tương thích backend cũ (đã bỏ dữ liệu thời trang mẫu). Sản phẩm có thêm ThuongHieu, DungTichMl, HuongVi và DonViTinh; API Admin đã hỗ trợ. Có quản lý lô, hạn sử dụng, phiếu nhập theo lô, POS và hóa đơn. Form sản phẩm còn một số trường thời trang kế thừa. Không chạy SQL legacy trên database dự án gốc. Không dùng Prisma migrate reset/dev hay db push trên dữ liệu hiện có; khi cần introspect chạy `npm run backend:db:introspect`.

## Kiểm tra

`npm run backend:test`, `npm run web:lint`, `npm run web:build`. Đọc AGENTS.md và docs/AI_HANDOFF.md trước khi thay đổi.

## Nâng cấp database hiện có (không xóa dữ liệu)
Dừng BE/FE, sao lưu database milkshop rồi import duy nhất `database/migrations/20261125_milkshop_lots_pos.sql` qua phpMyAdmin. Hoặc từ CMD tại thư mục gốc:
```cmd
"C:\xampp\mysql\bin\mysql.exe" -u root < database\migrations\20261125_milkshop_lots_pos.sql
```
Nếu MySQL có mật khẩu thêm -p. Fresh install dùng schema chính đã tích hợp migration. Chạy lại run.bat. Không cần tạo lại admin. Tồn kho cũ chưa có lô không thể bán tại POS; không tự gán ngày giả. Nhập phiếu có mã lô, NSX, HSD để bán.

### Nâng cấp catalog và báo cáo sữa
Sau migration lots_pos, import `database/migrations/20261125_milkshop_catalog_reports.sql` trong phpMyAdmin (hoặc mysql CLI). Schema chính đã chứa cả hai migration dành cho cài mới. Số bảng vẫn 57. Không sửa .env.
