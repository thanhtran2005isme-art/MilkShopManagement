# Roadmap — MilkShopManagement

1. Tách nền tảng Web Admin/API, bỏ Mobile, giao diện khách hàng, CMS thời trang và tooling dư thừa.
2. Xác minh build, cấu hình MariaDB thử nghiệm riêng và chạy Admin.
3. Chuyển đổi nhận diện, sản phẩm sữa, kho theo lô, hạn sử dụng; thống nhất phạm vi quản lý nội bộ.
4. Lập Test Design và Test Case; thực thi Katalon Studio, JMeter, AI hỗ trợ kiểm thử; ghi nhận lỗi và PASS/FAIL.

Bước 1 hoàn thành; bước 2 đã có CI MariaDB thật và người dùng chạy Admin local. Bước 3 đã chuyển nhận diện và đồng bộ style toàn Admin; đã triển khai POS cơ bản, phiếu nhập theo lô, FEFO, cảnh báo/hủy hàng hết hạn và hóa đơn; cần xác minh runtime và UI, hoàn thiện form sản phẩm, báo cáo giá vốn, hàng hủy, barcode và trả hàng POS. Lịch sử roadmap dự án nguồn lưu tại `docs/history/inherited-mobile-roadmap.md`.
