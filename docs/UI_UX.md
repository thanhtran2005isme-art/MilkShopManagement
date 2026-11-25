# UI/UX Guide — Web Admin

Giữ giao diện hiện tại trong bước tách nền tảng; chưa đổi nhận diện hay layout.

- Trước khi sửa UI, đọc `skill/.codex/skills/ui-ux-pro-max/SKILL.md` và guideline React Web phù hợp, sử dụng design system hiện hữu trong `design-system/`.
- Giữ cấu trúc sidebar, dashboard, bảng, form, bộ lọc, phân trang và quyền Admin; không thay đổi nghiệp vụ khi chỉnh giao diện thuần túy.
- Kiểm tra accessibility, keyboard navigation, label/validation, responsive, trạng thái loading/error/empty và focus. Không dùng dữ liệu giả thay API.
- Backend là nguồn xác thực cho tồn kho, giá, đơn hàng, tiền và quyền.
- Lịch sử guideline dự án nguồn được lưu tại `docs/history/inherited-ui-ux.md` và không phải hướng dẫn runtime hiện hành.
