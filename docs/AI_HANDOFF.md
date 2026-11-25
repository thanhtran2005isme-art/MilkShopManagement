# AI Handoff — MilkShopManagement

Cập nhật 2026-11-25. Repository độc lập: `thanhtran2005isme-art/MilkShopManagement`, phạm vi QA hiện tại là Web Admin. Không sửa repository KaitoKidShopMobile.

## Hiện trạng

- `apps/web`: React, TypeScript, Vite; chỉ giữ route Admin; giao diện khách hàng đã gỡ.
- `apps/api`: NestJS 11, Prisma 7, MariaDB, REST/JWT/RBAC. Port mặc định 5300.
- `database/MilkShop_MariaDB.sql`: schema 55 bảng tương thích, tạo database milkshop độc lập, không DROP dữ liệu; seed danh mục/sản phẩm sữa. Runtime từ chối database khác. Seed Admin bằng npm run backend:db:seed-admin.
- `run.bat` và `scripts/run-all.bat`: khởi động API và Web Admin độc lập, sau đó kiểm tra health. Web mở /admin/login trên port cố định 5173; lỗi health không chặn FE.
- Không còn ứng dụng Mobile/Expo hoặc launcher tương ứng. CI Web, test API và final-cutover contract đã được điều chỉnh theo phạm vi mới.
- Gỡ giao diện bán hàng công khai, các trang Admin CMS, ví, chat, giao vận, đánh giá và bộ sưu tập; giữ khuyến mãi/mã giảm giá. Một số service backend và schema cũ vẫn giữ vì liên quan đơn hàng, test và dữ liệu. Hồ sơ Admin dùng phiên nhân viên; chỉnh sửa nhân viên qua module nhân sự. Các quy tắc nghiệp vụ đang có tiếp tục được giữ.

## Kiểm tra

Chạy `npm run web:lint`, `npm run web:build`, `npm run backend:build` và `npm run backend:test` sau khi cài dependency. Chạy UI Admin tại `/admin/login` sau khi cấu hình DB riêng. Chưa xác nhận runtime trên máy dev tại thời điểm chuẩn bị thay đổi.

## Bước tiếp theo

1. Xác nhận build và đăng nhập Admin.
2. Hoàn thiện UI sữa, nghiệp vụ bán tại quầy, lô và hạn sử dụng.
3. Thiết kế Test Case; Katalon Studio, JMeter, báo cáo PASS/FAIL.

Tài liệu lịch sử được lưu trong docs/history; không dùng các hướng dẫn runtime cũ làm cấu hình hiện tại.

## Tinh giản backend/UI (2026-11-25)
- Gỡ các module độc lập của cửa hàng trực tuyến và controller CMS Admin không còn sử dụng. Chat, ví và tìm kiếm ảnh/gợi ý không được đăng ký API trong runtime. Giữ service ví, cart, payment, shipping và review kế thừa khi còn liên quan hợp đồng đơn hàng hoặc regression test; không xóa bảng trước khi thiết kế bán hàng tại quầy.
- CI kiểm tra thêm contract Admin/RBAC và cấu trúc Web/API. Các harness realtime của dự án nguồn là di sản, không còn dùng để nghiệm thu phạm vi Web Admin hiện tại.

- API sản phẩm hỗ trợ ThuongHieu, DungTichMl, HuongVi, DonViTinh và validate dữ liệu; áp dụng RBAC cho CRUD. CI có job import MariaDB thật và gọi API đăng nhập/CRUD.

## Quy tắc Git (yêu cầu chủ repository)
Chỉ làm việc và commit trực tiếp trên nhánh `main`. Không tạo nhánh phụ hoặc PR mới. Kiểm tra build/test phù hợp và báo rõ trạng thái xác minh. Không force-push.
