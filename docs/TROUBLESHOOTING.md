# Troubleshooting — MilkShop

- MySQL XAMPP phải chạy. Import duy nhất `database/MilkShop_MariaDB.sql` theo README. Không import SQL legacy hoặc chạy DROP.
- Lỗi DATABASE_URL: bắt buộc database milkshop, kiểm tra user/password/port; mã hóa ký tự đặc biệt của mật khẩu trong URL.
- /health degraded: kiểm tra missingTables và missingPermissions; chạy lại schema và npm run backend:db:seed-admin sau khi cấu hình .env.
- Không đăng nhập được: kiểm tra email/mật khẩu đã seed; seed không ghi đè tài khoản tồn tại. Không dùng mật khẩu mặc định KaitoKid.
- Không chạy prisma migrate reset/dev/db push trên dữ liệu hiện hữu.
- Port 5300/5173 bị chiếm: dừng đúng tiến trình của dự án đang dùng, không dừng toàn bộ Node trên máy.

- Chỉ thấy BE chạy: cập nhật run.bat và scripts/run-all.bat từ main. Launcher mở hai cửa sổ độc lập trước khi kiểm tra health. FE dùng port 5173 cố định và mở /admin/login. Nếu BE degraded, xem missingTables/missingPermissions trong thông báo; nếu FE lỗi, xem cửa sổ Web Admin.

- Health thiếu LoHang/PhanBoLoBan: sao lưu DB milkshop, import migration 20261125_milkshop_lots_pos.sql rồi khởi động lại. Nếu POS không bán được, kiểm tra lô còn hạn và tồn khả dụng, không chỉnh trực tiếp tồn sản phẩm theo lô.

- Nếu báo lỗi Unknown column MaVach/KhoiLuongG/SoLuongHuy: sao lưu DB và import migration 20261125_milkshop_catalog_reports.sql sau migration lots_pos. Không DROP database.
