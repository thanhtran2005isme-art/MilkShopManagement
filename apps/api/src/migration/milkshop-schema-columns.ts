import type { SqlClient } from "../common/sql-client.js";

const requiredColumns = {
  SanPham: ["ThuongHieu","DungTichMl","KhoiLuongG","HuongVi","MaVach","DonViTinh","SoLuongDaGiu"],
  ChiTietPhieuNhap: ["MaLo","NgaySanXuat","HanSuDung"],
  LoHang: ["SanPhamId","ChiTietPhieuNhapId","MaLo","NgaySanXuat","HanSuDung","SoLuongNhap","SoLuongCon","GiaNhap","TrangThai","SoLuongHuy","NgayHuy"],
  PhanBoLoBan: ["ChiTietDonHangId","LoHangId","SoLuong","GiaNhap"],
  DonHang: ["KenhBan","MaYeuCauPOS","HashYeuCauPOS","NhanVienPOSId","TienKhachDua"],
} as const;

/** Windows MariaDB and Linux use different table casing. Column names are case-insensitive. */
export async function missingMilkshopColumns(client: SqlClient): Promise<string[]> {
  const rows = await client.$queryRawUnsafe<Array<{tableName:string;columnName:string}>>(
    "SELECT TABLE_NAME AS tableName,COLUMN_NAME AS columnName FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND LOWER(TABLE_NAME) IN ('sanpham','chitietphieunhap','lohang','phanboloban','donhang')",
  );
  const found=new Set(rows.map(r=>String(r.tableName).toLowerCase()+"."+String(r.columnName).toLowerCase()));
  return Object.entries(requiredColumns).flatMap(([table,columns])=>columns.filter(column=>!found.has((table+"."+column).toLowerCase())).map(column=>table+"."+column));
}
