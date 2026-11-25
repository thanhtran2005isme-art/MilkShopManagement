# AI Handoff — MilkShopManagement

Cập nhật 2026-11-25. Repository độc lập: `thanhtran2005isme-art/MilkShopManagement`, phạm vi QA hiện tại là Web Admin. Không sửa repository KaitoKidShopMobile.

## Hiện trạng

- `apps/web`: React, TypeScript, Vite; giữ cả route khách hàng kế thừa vì chia sẻ API nhưng chỉ kiểm thử Admin.
- `apps/api`: NestJS 11, Prisma 7, MariaDB, REST/JWT/RBAC và Socket.IO /chatHub. Port mặc định 5300.
- `database/`: giữ schema và migration gốc; chưa đổi mô hình ngành hàng. Phải dùng database thử nghiệm riêng; không trỏ đến database dự án gốc.
- `run.bat` và `scripts/run-all.bat`: khởi động API, chờ health, sau đó khởi động Web. Vite thường ở 5173.
- Không còn ứng dụng Mobile/Expo hoặc launcher tương ứng. CI Web, test API và final-cutover contract đã được điều chỉnh theo phạm vi mới.
- Không thay đổi giao diện, nghiệp vụ, dữ liệu hoặc migration trong bước tách này. Các quy tắc nghiệp vụ đang có tiếp tục được giữ.

## Kiểm tra

Chạy `npm run web:lint`, `npm run web:build`, `npm run backend:build` và `npm run backend:test` sau khi cài dependency. Chạy UI Admin tại `/admin/login` sau khi cấu hình DB riêng. Chưa xác nhận runtime trên máy dev tại thời điểm chuẩn bị thay đổi.

## Bước tiếp theo

1. Xác nhận build và đăng nhập Admin.
2. Tách dữ liệu, thương hiệu, nghiệp vụ sữa (sản phẩm, lô, hạn sử dụng).
3. Thiết kế Test Case; Katalon Studio, JMeter, báo cáo PASS/FAIL.

Tài liệu lịch sử được lưu trong docs/history; không dùng các hướng dẫn runtime cũ làm cấu hình hiện tại.
