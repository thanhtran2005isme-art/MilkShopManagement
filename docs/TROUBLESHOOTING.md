# Troubleshooting — Web/API

Chỉ áp dụng cho database thử nghiệm độc lập. Các hướng dẫn cũ liên quan ứng dụng đã loại bỏ không còn hiệu lực.

## Node API không khởi động vì thiếu `.env`

Tạo local config:

```bat
cd apps\api
copy .env.example .env
```

Điền `DATABASE_URL` và `JWT_KEY`. Không commit `.env`.

## Prisma `P1000` / MariaDB access denied

`DATABASE_URL` trong `apps/api/.env` phải khớp user/password MariaDB local.

Kiểm tra MariaDB bằng XAMPP client nếu có:

```bat
"C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT VERSION(); SHOW DATABASES;"
```

Kiểm tra table count:

```bat
"C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema='kaitokid' AND table_type='BASE TABLE';"
```

Contract hiện tại kỳ vọng 52 bảng sau registration-email-verification migration.

## Fresh database / migration path

Fresh schema:

```text
database/KaitoKid_MariaDB.sql
```

Existing DB migrations:

```text
database/migrations/
```

Ví dụ registration verification:

```bat
"C:\xampp\mysql\bin\mysql.exe" -u root kaitokid < database\migrations\20260930_registration_email_verification.sql
```

Không chạy `prisma migrate reset`, `prisma migrate dev` hoặc `prisma db push` trên database đang có dữ liệu.

## `/health` không báo 52/52

Chạy:

```bat
npm --prefix apps\api run db:audit
```

Nếu tên bảng bị lệch casing trên Windows, audit phải tôn trọng `@@lower_case_table_names`; không tự rename bảng chỉ để làm audit xanh.

## Trang Admin Khách hàng không hiển thị thống kê

- `/admin/customers` gọi Node API `:5300`: `GET /api/admin/customers`, `GET /api/admin/customers/summary` và `GET /api/admin/customers/:id/analytics`. Các request dùng staff JWT.
- 401: đăng nhập lại Staff/Admin. 403: kiểm tra quyền `customers.view`. 500: đọc log NestJS và kiểm tra MariaDB `kaitokid`.
- Không coi lỗi API là tệp khách rỗng; màn hình hiển thị lỗi và có nút Thử tải lại.
- Số lượng khách/đơn và doanh thu tổng quan truy vấn tại MariaDB theo `NguoiDung.Id` và `DonHang.NguoiDungId`, không tính từ một trang danh sách phân trang.
- Doanh thu, AOV, nhóm sản phẩm/danh mục mua nhiều chỉ tính đơn có `TrangThai='completed'`. Khách có đơn `pending/confirmed/shipping` sẽ có số đơn nhưng chi tiêu hoàn thành có thể bằng 0.
- Với đơn đã hoàn thành mà vẫn không thấy ở khách, kiểm tra `NguoiDungId` và `TrangThai` bằng SQL chỉ đọc; không ghép theo Email hay sửa trạng thái order để tăng số liệu.

## Product/Lookbook media lỗi

Node mount shared `apps/web/public` và giữ branded fallback cho `/products/*` và `/lookbook/*`. Nếu media mới vẫn 404:

1. restart Node API;
2. kiểm tra `SHARED_WEB_PUBLIC_ROOT`/`PUBLIC_ROOT` nếu override;
3. kiểm tra path lưu trong DB;
4. chạy `scripts\node-final-runtime-smoke.bat`.

## Cart báo thiếu cột reservation

Chạy migration:

```bat
"C:\xampp\mysql\bin\mysql.exe" -u root kaitokid < database\migrations\20260922_phase4_cart_reservation.sql
```

Sau đó restart Node API.

## Lookbook/discovery sample thiếu metadata

```bat
"C:\xampp\mysql\bin\mysql.exe" -u root kaitokid < database\migrations\20260924_phase9_discovery_seed.sql
```

## PHASE 10 sample/media chưa đúng

```bat
"C:\xampp\mysql\bin\mysql.exe" -u root kaitokid < database\migrations\20260929_phase10_multiaudience_media.sql
```

Migration này là trạng thái sample đa audience hiện hành; không chạy lại kids-only migration cũ sau đó.

## Email verification không gửi mail thật

Nếu `EMAIL_BREVO_API_KEY` trống, Node dùng local mock/console behavior theo cấu hình hiện tại. Muốn gửi thật, cấu hình Brevo trong `apps/api/.env`/deployment secrets:

```text
EMAIL_BREVO_API_KEY=...
EMAIL_BREVO_SENDER_EMAIL=...
EMAIL_BREVO_SENDER_NAME=KaitoKid Shop
```

`AUTH_EMAIL_VERIFY_URL` phải là URL người nhận mở được.

## Google Sign-In

- Android native dùng `@react-native-google-signin/google-signin` và cần development/native build.
- Expo Go không hỗ trợ native Google module.
- Backend Node xác minh Google credential trước khi phát JWT KaitoKid.
- `GOOGLE_CLIENT_ID` cấu hình ở `apps/api/.env`/deploy secret.
- Android OAuth client phải đúng package `com.kaitokid.shopmobile` + SHA-1.

## Race/realtime gate lỗi

Chạy các gate riêng:

```bat
scripts\node-protected-runtime-parity.bat
scripts\node-concurrency-race-gate.bat
scripts\node-realtime-runtime-gate.bat
```

Concurrency/realtime scripts có thể tạo backup trong `.runtime-backups/`. Khi gate FAIL, không merge thay đổi liên quan đến inventory/payment/order/realtime cho tới khi hiểu và sửa nguyên nhân.

## `dist/modules` không tồn tại

Chạy:

```bat
npm --prefix apps\api run build
```

Build hợp lệ tạo `apps/api/dist/main.js`, `dist/modules/*`, `dist/scripts/*`.

## payOS không xuất hiện ở Checkout

Online payment mới chỉ bật khi Node có đủ ba biến:

```text
PAYOS_CLIENT_ID
PAYOS_API_KEY
PAYOS_CHECKSUM_KEY
```

Kiểm tra `GET /api/payment/config`:

- `payOsConfigured=true` và `paymentProvider=payos` khi provider active;
- `supportedMethods` phải có `ATM` khi payOS active;
- nếu `payosEnabled=false` trong payment settings thì ATM bị tắt dù credentials đúng.

Các key `bankEnabled`, `enableBankTransfer`, `bankAccounts` hoặc VietQR legacy **không còn được phép bật ATM cho đơn mới**. Không sửa bằng cách bật lại manual VietQR fallback.

## Ví KaitoKid không xuất hiện / API báo thiếu bảng

Kiểm tra `/health` trước. Nếu chưa 55/55, chạy wallet migration:

```bat
"C:\xampp\mysql\bin\mysql.exe" -u root kaitokid < database\migrations\20261006_wallet_refund_withdrawal.sql
```

Sau đó restart Node API và kiểm tra:

- `GET /api/wallet`
- `GET /api/wallet/transactions`
- Customer Web `/wallet`
- Mobile `account/wallet`

Không tạo balance giả ở localStorage/client để “sửa” màn hình trống.

## Checkout dùng ví nhưng payOS vẫn yêu cầu nguyên `TongTien`

Backend phải là authority của hai số:

```text
walletUsed = net order_payment - order_payment_reversal
amountDue  = TongTien - walletUsed
```

Kiểm tra:

1. order DTO có `walletUsed` và `amountDue` đúng;
2. payment instructions trả `total=amountDue`;
3. payOS payment amount cũng bằng `amountDue`;
4. Web/Mobile chỉ gửi `useWallet`, không gửi số tiền ví tự tính làm authority;
5. nếu order đã cancel/expire, projection phải tính reversal để `walletUsed` trở về 0.

Không sửa bằng cách đổi `DonHang.TongTien`; trường đó luôn là full order total.

## Hủy/hết hạn đơn nhưng số dư ví không trở lại

Kiểm tra ledger `GiaoDichVi` theo order reference:

- phải có `order_payment` nếu ví từng bị debit;
- cancel/expiry hợp lệ phải có đúng một `order_payment_reversal`;
- unique idempotency cấm reversal trùng cùng order/type.

Với ATM/payOS, cancel/expiry phải provider-first. Nếu provider đã paid hoặc chưa xác nhận cancel, backend **không** được local-restore inventory/coupon/wallet.

## Refund return chưa vào Ví KaitoKid

Flow mới chỉ credit tiền khi:

1. customer đã xác nhận nhận hàng;
2. return request trong 15 ngày;
3. Admin approve;
4. hàng vật lý đã quay về;
5. Admin chọn `restock` hoặc `quarantine` và xác nhận kiểm hàng.

Trong transaction bước 5 phải có marker `refund_wallet_credited` và ledger `refund_credit`. Dữ liệu `refund_pending/refund_completed_manual` chỉ dành cho case legacy.

## Withdrawal bị treo / số dư nằm ở “tạm giữ”

State machine:

```text
pending -> approved -> completed
pending/approved -> rejected
```

- tạo request: available giảm, held tăng;
- approve: chưa đổi balance;
- reject: held trả về available;
- complete: held giảm sau khi Admin đã chuyển khoản thực tế và nhập bank reference.

Admin cần `wallet.view` để xem và `wallet.manage` để duyệt/từ chối/hoàn tất. Không chỉnh trực tiếp `ViDienTu` bằng UI/admin form.

## Không hủy được tài khoản vì Ví KaitoKid

Đây là guard chủ ý. Account deletion bị chặn nếu:

- `SoDuKhaDung > 0`;
- `SoDuTamGiu > 0`;
- hoặc còn withdrawal `pending/approved`.

Khách phải xử lý/rút hết tiền và hoàn tất các yêu cầu đang chạy trước khi anonymize account.

## payOS QR có nhưng đơn không tự thành công

1. xác nhận public HTTPS webhook trỏ đúng `POST /api/payment/payos/webhook`;
2. kiểm tra payment channel payOS đã confirm webhook URL;
3. không dùng return/cancel URL trình duyệt để đánh dấu paid;
4. webhook phải pass checksum, `currency=VND`, amount đúng **`amountDue` sau ví** và provider order code map reversible về `MaDonHang`;
5. Web/Mobile poll `/api/payment/status/:orderCode`; nếu DB chưa có `NgayThanhToan`, kiểm tra webhook/provider trước chứ không sửa UI thành tự xác nhận.

Runbook đầy đủ: `docs/runbooks/PAYOS_PAYMENT_E2E.md`.

