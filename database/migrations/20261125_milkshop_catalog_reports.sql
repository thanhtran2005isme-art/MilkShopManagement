-- Chạy sau migration lô hàng POS. Không xóa dữ liệu.
USE milkshop;
ALTER TABLE SanPham ADD COLUMN IF NOT EXISTS KhoiLuongG INT NULL;
ALTER TABLE SanPham ADD COLUMN IF NOT EXISTS MaVach VARCHAR(50) NULL;
CREATE UNIQUE INDEX IF NOT EXISTS UQ_SanPham_MaVach ON SanPham(MaVach);
ALTER TABLE LoHang ADD COLUMN IF NOT EXISTS SoLuongHuy INT NULL;
INSERT INTO ThuocTinhSanPham (TenThuocTinh,GiaTri,NhomThuocTinh,ThuTu)
SELECT x.ten,x.gia,x.nhom,x.tt FROM (
 SELECT 'Thương hiệu' AS ten,'Vinamilk' AS gia,'brand' AS nhom,1 AS tt
 UNION ALL SELECT 'Thương hiệu','TH true MILK','brand',2
 UNION ALL SELECT 'Thương hiệu','Dutch Lady','brand',3
 UNION ALL SELECT 'Dung tích (ml)','180','volume',1
 UNION ALL SELECT 'Dung tích (ml)','1000','volume',2
 UNION ALL SELECT 'Khối lượng (g)','400','weight',1
 UNION ALL SELECT 'Khối lượng (g)','900','weight',2
 UNION ALL SELECT 'Hương vị','Không đường','flavor',1
 UNION ALL SELECT 'Hương vị','Có đường','flavor',2
 UNION ALL SELECT 'Hương vị','Dâu','flavor',3
 UNION ALL SELECT 'Đơn vị tính','Hộp','unit',1
 UNION ALL SELECT 'Đơn vị tính','Chai','unit',2
 UNION ALL SELECT 'Đơn vị tính','Lon','unit',3
) x WHERE NOT EXISTS (SELECT 1 FROM ThuocTinhSanPham t WHERE t.NhomThuocTinh=x.nhom AND t.GiaTri=x.gia);
