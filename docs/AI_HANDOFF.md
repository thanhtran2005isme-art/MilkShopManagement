# AI Handoff — MilkShopManagement

Cập nhật 2026-11-25. Repository độc lập: `thanhtran2005isme-art/MilkShopManagement`, phạm vi QA hiện tại là Web Admin. Không sửa repository KaitoKidShopMobile.

## Hiện trạng

- `apps/web`: React, TypeScript, Vite; chỉ giữ route Admin; giao diện khách hàng đã gỡ.
- `apps/api`: NestJS 11, Prisma 7, MariaDB, REST/JWT/RBAC. Port mặc định 5300.
- `database/MilkShop_MariaDB.sql`: schema 57 bảng tương thích, tạo database milkshop độc lập, không DROP dữ liệu; seed danh mục/sản phẩm sữa. Runtime từ chối database khác. Seed Admin bằng npm run backend:db:seed-admin.
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

## Giao diện MilkShop
Trang danh sách sản phẩm và khung Admin chuyển sang nền trung tính, màu xanh, bảng dữ liệu ưu tiên; bỏ hero và thống kê lặp, bỏ bộ lọc giới tính khỏi danh sách, logo MilkShop mới. API lỗi hiển thị lỗi thay vì dữ liệu local. Các trang chức năng khác và form sản phẩm vẫn cần chuyển đổi sâu theo nghiệp vụ sữa.

## Đồng bộ giao diện toàn Admin
Tất cả route Admin dùng hệ màu MilkShop và quy tắc chung cho header, bảng, form, modal, bộ lọc và KPI trong milkshop-admin.css. Dashboard, đơn hàng, danh mục, thuộc tính, khách hàng, kho, báo cáo, cài đặt, editor sản phẩm, coupon và khuyến mãi được chỉnh nội dung/bố cục trực tiếp. Nhà cung cấp, phiếu nhập, cảnh báo, nhân viên, vai trò và hồ sơ dùng bộ style chung. Không đổi API, route, quyền hay dữ liệu. Cần kiểm tra trực quan các viewport và thao tác thực tế trên máy dev.

## Lô hàng và POS
Hai route mới `/admin/inventory/lots` và `/admin/pos`. Phiếu nhập mới bắt buộc mã lô, NSX và HSD, tự sinh LoHang. POS ghi DonHang/ChiTietDonHang/LichSuThanhToan, PhanBoLoBan và TonKho_LichSu trong một transaction, FEFO, khóa tồn và requestId chống trùng. Cảnh báo 30 ngày; ngày HSD không còn được bán theo múi giờ Việt Nam. Chỉ hủy lô hết hạn còn tồn, không hủy phiếu đã phát sinh bán/hủy. Khách lẻ kỹ thuật không đăng nhập. Giữ đơn POS đã hoàn thành, không dùng luồng trả hàng online. Các phần chưa hoàn thiện: trả hàng POS, tự động áp mã khuyến mãi, barcode, báo cáo giá vốn/hàng hủy, chuyển đổi tồn cũ có lô, form sản phẩm sữa.

## Chuẩn hóa nghiệp vụ quản lý sữa
Form và danh sách sản phẩm dùng thương hiệu, dung tích, khối lượng, hương vị, mã vạch, đơn vị; không hiển thị size/màu/SEO. Thuộc tính là giá trị gợi ý theo 5 nhóm. Kho phân biệt tồn vật lý/tồn lô/hết hạn/có thể bán/chênh lệch; cảnh báo hiển thị lô thực tế. Đơn hàng mặc định POS, có bộ lọc đơn online cũ. Báo cáo POS tính giá vốn từ PhanBoLoBan, lợi nhuận gộp và giá trị hàng hết hạn/đã hủy. Cài đặt chỉ giữ thông tin cửa hàng và liên kết vận hành. Migration catalog_reports cần chạy sau lots_pos; giữ dữ liệu cũ. Giá trị hủy trước migration chưa biết số lượng không tính vào thiệt hại đã ghi nhận.
