# Brand Guide — trạng thái kế thừa

## Định vị kế thừa (chưa chuyển sang ngành sữa)

**KaitoKid Shop Fashion là cửa hàng thời trang và phụ kiện cho nhiều lứa tuổi và giới tính.**

Phạm vi kinh doanh gồm nam, nữ, bé trai, bé gái, unisex, người lớn và trẻ em. Web hiện có các khu vực **NỮ / NAM / TRẺ EM** là chủ đích nghiệp vụ và không được tự động xóa hoặc đổi thành kids-only.

## Quy ước dữ liệu

Hai chiều dữ liệu phải được phân biệt:

- `GioiTinh = Nam | Nu | Unisex`: giới tính/phân nhóm mặc.
- `NhomTuoi = NguoiLon | TreEm`: nhóm tuổi.

Ví dụ `GioiTinh=Nam + NhomTuoi=TreEm` là bé trai; `GioiTinh=Nu + NhomTuoi=NguoiLon` là nữ người lớn. Không dùng `Tre em` như một giá trị `GioiTinh`.

## Size

- Trẻ em: `90, 100, 110, 120, 130, 140, 150`.
- Người lớn: `S, M, L, XL, XXL` khi sản phẩm hỗ trợ.
- Phụ kiện: có thể dùng `Freesize`.

UI phải đọc size thật từ dữ liệu sản phẩm/biến thể, không giả định toàn catalog dùng một hệ size.

## Nội dung và merchandising

Copy, banner, collection, lookbook và recommendation phải theo đúng audience của sản phẩm đang hiển thị. Không áp copy dành cho trẻ em lên sản phẩm người lớn và ngược lại.

## Quy tắc cho AI/GPT

- Web Nam/Nữ/Trẻ em là nghiệp vụ hợp lệ.
- Không suy từ tên “KaitoKid” rằng toàn bộ shop chỉ bán đồ trẻ em.
- Khi filter trẻ em, ưu tiên `NhomTuoi=TreEm`, không giả `GioiTinh=Tre em`.
- Giữ Git + docs + source hiện tại làm source of truth.

## PHASE 10 — sample đa audience và media

Migration `database/migrations/20260929_phase10_multiaudience_media.sql` đưa sample catalog về đúng D020:

- giữ các sản phẩm trẻ em hiện có;
- bổ sung sample Nữ/Nam người lớn;
- chuẩn hóa tên category dùng chung;
- lưu URL ảnh HTTPS ngay trong `SanPham.HinhAnh` cho seed chuẩn;
- bổ sung merchandising/Lookbook đa audience.

Các URL ảnh này phục vụ demo/dev. Production vẫn cần media do shop sở hữu hoặc pipeline upload/storage chính thức.
