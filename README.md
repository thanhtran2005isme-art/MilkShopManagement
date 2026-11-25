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
6. Kiểm tra http://localhost:5300/health (status ok, 55 bảng), http://localhost:5300/docs và http://localhost:5173/admin/login.

## Phạm vi hiện tại

Schema giữ 55 bảng tương thích backend cũ (đã bỏ dữ liệu thời trang mẫu). Sản phẩm có thêm ThuongHieu, DungTichMl, HuongVi và DonViTinh; API Admin đã hỗ trợ. Chưa chuyển đổi UI sản phẩm, bán tại quầy hoặc tồn kho theo lô/hạn sử dụng. Không chạy SQL legacy trên database dự án gốc. Không dùng Prisma migrate reset/dev hay db push trên dữ liệu hiện có; khi cần introspect chạy `npm run backend:db:introspect`.

## Kiểm tra

`npm run backend:test`, `npm run web:lint`, `npm run web:build`. Đọc AGENTS.md và docs/AI_HANDOFF.md trước khi thay đổi.
