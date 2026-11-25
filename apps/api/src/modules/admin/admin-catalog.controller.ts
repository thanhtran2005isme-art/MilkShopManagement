import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/authenticated-user.js";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard.js";
import { PrismaService } from "../../database/prisma.service.js";
import { assertStaffPermission } from "../identity/staff-permissions.js";
import { assertUntrackedInventory, vietnamDate, addDays } from "./milkshop-lot-utils.js";
import { AdminStaffGuard } from "./admin-staff.guard.js";
import {
  bool,
  bodyValue,
  date,
  deleteRow,
  insertRow,
  intPath,
  jsonRows,
  jsonValue,
  nullableNum,
  nullableText,
  num,
  pageValues,
  selectById,
  text,
  updateRow,
  type JsonRecord,
} from "./admin-utils.js";

@Controller("api/admin/customers")
@UseGuards(JwtAuthGuard)
export class AdminCustomersController {
  constructor(private readonly prisma: PrismaService) {}

  // Tổng quan lấy từ MariaDB, không phụ thuộc phân trang danh sách trên Web.
  @Get("summary")
  async summary(@CurrentUser() user: AuthenticatedUser) {
    assertStaffPermission(user, "customers.view");
    const rows = await this.prisma.$queryRawUnsafe<JsonRecord[]>(
      `SELECT COUNT(*) AS TotalCustomers,
              COALESCE(SUM(CASE WHEN COALESCE(o.OrderCount, 0) > 0 THEN 1 ELSE 0 END), 0) AS CustomersWithOrders,
              COALESCE(SUM(CASE WHEN COALESCE(o.OrderCount, 0) = 0 THEN 1 ELSE 0 END), 0) AS CustomersWithoutOrders,
              COALESCE(SUM(CASE WHEN COALESCE(o.CompletedOrders, 0) >= 2 THEN 1 ELSE 0 END), 0) AS RepeatCustomers,
              COALESCE(SUM(COALESCE(o.OrderCount, 0)), 0) AS TotalOrders,
              COALESCE(SUM(COALESCE(o.CompletedOrders, 0)), 0) AS CompletedOrders,
              COALESCE(SUM(COALESCE(o.CancelledOrders, 0)), 0) AS CancelledOrders,
              COALESCE(SUM(COALESCE(o.TotalSpent, 0)), 0) AS TotalRevenue
       FROM NguoiDung n
       LEFT JOIN (
         SELECT d.NguoiDungId AS UserId,
                COUNT(*) AS OrderCount,
                SUM(CASE WHEN d.TrangThai='completed' THEN 1 ELSE 0 END) AS CompletedOrders,
                SUM(CASE WHEN d.TrangThai='cancelled' THEN 1 ELSE 0 END) AS CancelledOrders,
                SUM(CASE WHEN d.TrangThai='completed' THEN d.TongTien ELSE 0 END) AS TotalSpent
         FROM DonHang d
         GROUP BY d.NguoiDungId
       ) o ON o.UserId=n.Id
       WHERE n.VaiTro='user'`,
    );
    return jsonValue(rows[0] ?? {});
  }

  @Get()
  async all(
    @CurrentUser() user: AuthenticatedUser,
    @Query("search") search?: string,
    @Query("page") rawPage?: string,
    @Query("pageSize") rawPageSize?: string,
  ) {
    assertStaffPermission(user, "customers.view");
    const { page, pageSize, offset } = pageValues(rawPage, rawPageSize);
    const filter = search?.trim();
    const where = filter
      ? "VaiTro='user' AND (HoTen LIKE ? OR Email LIKE ? OR SoDienThoai LIKE ?)"
      : "VaiTro='user'";
    const params = filter ? [`%${filter}%`, `%${filter}%`, `%${filter}%`] : [];
    const totals = await this.prisma.$queryRawUnsafe<Array<{ total: unknown }>>(
      `SELECT COUNT(*) AS total FROM NguoiDung WHERE ${where}`,
      ...params,
    );
    const rows = await this.prisma.$queryRawUnsafe<JsonRecord[]>(
      `SELECT n.Id, n.HoTen, n.Email, n.SoDienThoai, n.VaiTro, n.TrangThai, n.NgayTao,
              (SELECT COUNT(*) FROM DonHang d WHERE d.NguoiDungId=n.Id) AS OrderCount,
              (SELECT COUNT(*) FROM DonHang d WHERE d.NguoiDungId=n.Id AND d.TrangThai='completed') AS CompletedOrders,
              (SELECT COUNT(*) FROM DonHang d WHERE d.NguoiDungId=n.Id AND d.TrangThai='cancelled') AS CancelledOrders,
              COALESCE((SELECT SUM(d.TongTien) FROM DonHang d WHERE d.NguoiDungId=n.Id AND d.TrangThai='completed'),0) AS TotalSpent,
              COALESCE((SELECT AVG(d.TongTien) FROM DonHang d WHERE d.NguoiDungId=n.Id AND d.TrangThai='completed'),0) AS AverageOrderValue,
              (SELECT MIN(d.NgayTao) FROM DonHang d WHERE d.NguoiDungId=n.Id) AS FirstOrderAt,
              (SELECT MAX(d.NgayTao) FROM DonHang d WHERE d.NguoiDungId=n.Id) AS LastOrderAt,
              (SELECT d.TrangThai FROM DonHang d WHERE d.NguoiDungId=n.Id ORDER BY d.NgayTao DESC, d.Id DESC LIMIT 1) AS LastOrderStatus,
              (SELECT MAX(d.NgayTao) FROM DonHang d WHERE d.NguoiDungId=n.Id AND d.TrangThai='completed') AS LastCompletedOrderAt
       FROM NguoiDung n WHERE ${where}
       ORDER BY n.NgayTao DESC LIMIT ? OFFSET ?`,
      ...params,
      pageSize,
      offset,
    );
    const total = Number(totals[0]?.total ?? 0);
    return { items: jsonRows(rows), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  @Get(":id/analytics")
  async analytics(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string) {
    assertStaffPermission(user, "customers.view");
    const id = intPath(rawId);
    const customerRows = await this.prisma.$queryRawUnsafe<Array<{ Id: unknown }>>(
      "SELECT Id FROM NguoiDung WHERE Id=? AND VaiTro='user' LIMIT 1",
      id,
    );
    if (!customerRows[0]) throw new NotFoundException();

    const [orderRows, productRows, categoryRows] = await Promise.all([
      this.prisma.$queryRawUnsafe<JsonRecord[]>(
        `SELECT d.Id, d.MaDonHang AS OrderCode, d.TongTien AS Total, d.TrangThai AS Status,
                d.NgayTao AS CreatedAt, COUNT(ct.Id) AS ItemCount
         FROM DonHang d
         LEFT JOIN ChiTietDonHang ct ON ct.DonHangId=d.Id
         WHERE d.NguoiDungId=?
         GROUP BY d.Id, d.MaDonHang, d.TongTien, d.TrangThai, d.NgayTao
         ORDER BY d.NgayTao DESC, d.Id DESC`,
        id,
      ),
      this.prisma.$queryRawUnsafe<JsonRecord[]>(
        `SELECT ct.TenSanPham AS Product, SUM(ct.SoLuong) AS Quantity
         FROM DonHang d
         JOIN ChiTietDonHang ct ON ct.DonHangId=d.Id
         WHERE d.NguoiDungId=? AND d.TrangThai='completed'
         GROUP BY ct.SanPhamId, ct.TenSanPham
         ORDER BY Quantity DESC, Product ASC
         LIMIT 4`,
        id,
      ),
      this.prisma.$queryRawUnsafe<JsonRecord[]>(
        `SELECT COALESCE(NULLIF(TRIM(p.DanhMuc), ''), 'Khác') AS Category, SUM(ct.SoLuong) AS Quantity
         FROM DonHang d
         JOIN ChiTietDonHang ct ON ct.DonHangId=d.Id
         LEFT JOIN SanPham p ON p.Id=ct.SanPhamId
         WHERE d.NguoiDungId=? AND d.TrangThai='completed'
         GROUP BY Category
         ORDER BY Quantity DESC, Category ASC
         LIMIT 3`,
        id,
      ),
    ]);

    const products = jsonRows(productRows);
    const categories = jsonRows(categoryRows);
    return {
      topCategories: categories.map((row) => String(row.category ?? "")).filter(Boolean),
      purchasedProducts: products.map((row) => String(row.product ?? "")).filter(Boolean),
      orders: jsonRows(orderRows),
    };
  }

  @Get(":id")
  async one(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string) {
    assertStaffPermission(user, "customers.view");
    const id = intPath(rawId);
    const rows = await this.prisma.$queryRawUnsafe<JsonRecord[]>(
      `SELECT n.Id, n.HoTen, n.Email, n.SoDienThoai, n.VaiTro, n.TrangThai, n.NgayTao,
              (SELECT COUNT(*) FROM DonHang d WHERE d.NguoiDungId=n.Id) AS orderCount,
              (SELECT COUNT(*) FROM DonHang d WHERE d.NguoiDungId=n.Id AND d.TrangThai='completed') AS completedOrders,
              (SELECT COUNT(*) FROM DonHang d WHERE d.NguoiDungId=n.Id AND d.TrangThai='cancelled') AS cancelledOrders,
              COALESCE((SELECT SUM(d.TongTien) FROM DonHang d WHERE d.NguoiDungId=n.Id AND d.TrangThai='completed'),0) AS totalSpent,
              COALESCE((SELECT AVG(d.TongTien) FROM DonHang d WHERE d.NguoiDungId=n.Id AND d.TrangThai='completed'),0) AS averageOrderValue,
              (SELECT MIN(d.NgayTao) FROM DonHang d WHERE d.NguoiDungId=n.Id) AS firstOrderAt,
              (SELECT MAX(d.NgayTao) FROM DonHang d WHERE d.NguoiDungId=n.Id) AS lastOrderAt,
              (SELECT d.TrangThai FROM DonHang d WHERE d.NguoiDungId=n.Id ORDER BY d.NgayTao DESC, d.Id DESC LIMIT 1) AS lastOrderStatus,
              (SELECT MAX(d.NgayTao) FROM DonHang d WHERE d.NguoiDungId=n.Id AND d.TrangThai='completed') AS lastCompletedOrderAt
       FROM NguoiDung n WHERE n.Id=? AND n.VaiTro='user' LIMIT 1`,
      id,
    );
    if (!rows[0]) throw new NotFoundException();
    return jsonValue(rows[0]);
  }

  @Put(":id/toggle-status")
  async toggle(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string) {
    assertStaffPermission(user, "customers.manage");
    const id = intPath(rawId);
    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ TrangThai: unknown }>>(
        "SELECT TrangThai FROM NguoiDung WHERE Id=? AND VaiTro='user' LIMIT 1 FOR UPDATE",
        id,
      );
      if (!rows[0]) throw new NotFoundException();
      const next = Number(rows[0].TrangThai) ? 0 : 1;
      await tx.$executeRawUnsafe("UPDATE NguoiDung SET TrangThai=?, NgayCapNhat=? WHERE Id=? AND VaiTro='user'", next, new Date(), id);
      return { id, trangThai: Boolean(next) };
    });
  }
}

@Controller("api/admin/products")
@UseGuards(JwtAuthGuard, AdminStaffGuard)
export class AdminProductsController {
  constructor(private readonly prisma: PrismaService) {}

  private values(body: JsonRecord, creating = false): Record<string, unknown> {
    const name = text(body, "TenSanPham").trim();
    const sku = text(body, "MaSanPham").trim();
    const price = bodyValue(body, "Gia");
    const stock = bodyValue(body, "TonKho");
    if (!name || !sku || price === undefined || price === null || price === "" || !Number.isFinite(Number(price)) || Number(price) < 0 ||
        (stock !== undefined && (stock === null || !Number.isSafeInteger(Number(stock)) || Number(stock) < 0))) {
      throw new BadRequestException("Tên, mã sản phẩm, giá và tồn kho không hợp lệ.");
    }
    const milkFields: Record<string, unknown> = {};
    if(name.length>200||sku.length>50||!Number.isSafeInteger(Number(price))||Number(price)>1000000000) throw new BadRequestException("Tên, mã hoặc giá bán vượt giới hạn.");
    if(bodyValue(body,"MaVach")!==undefined){const barcode=nullableText(body,"MaVach")?.trim()||null;if(barcode&&!/^[0-9]{8,14}$/.test(barcode)) throw new BadRequestException("Mã vạch phải gồm 8–14 chữ số.");milkFields.MaVach=barcode;}
    const weight=bodyValue(body,"KhoiLuongG");if(weight!==undefined){if(weight!==null&&(!Number.isSafeInteger(Number(weight))||Number(weight)<=0||Number(weight)>1000000))throw new BadRequestException("Khối lượng phải là số nguyên dương.");milkFields.KhoiLuongG=weight===null?null:Number(weight);}
    if(creating&&Number(stock??0)!==0)throw new BadRequestException("Sản phẩm mới phải có tồn 0; nhập qua phiếu nhập.");
    for (const key of ["ThuongHieu", "HuongVi", "DonViTinh"]) {
      if (bodyValue(body, key) !== undefined) {
        const value = nullableText(body, key)?.trim() || null;
        if (value && value.length>(key==="DonViTinh"?30:key==="HuongVi"?100:150)) throw new BadRequestException("Thông tin sản phẩm quá dài.");
        if (key === "DonViTinh" && !value) throw new BadRequestException("Đơn vị tính không được bỏ trống.");
        milkFields[key] = value;
      }
    }
    const volume = bodyValue(body, "DungTichMl");
    if (volume !== undefined) {
      if (volume !== null && (!Number.isSafeInteger(Number(volume)) || Number(volume) <= 0 || Number(volume)>1000000)) throw new BadRequestException("Dung tích phải là số nguyên dương.");
      milkFields.DungTichMl = volume === null ? null : Number(volume);
    }
    return {
      ...milkFields,
      TenSanPham: name,
      DanhMucId: nullableNum(body, "DanhMucId"),
      DanhMuc: text(body, "DanhMuc"),
      DanhMucPhu: nullableText(body, "DanhMucPhu"),
      PhongCach: nullableText(body, "PhongCach"),
      ...(creating ? { NhomTuoi: nullableText(body, "NhomTuoi") } : {}),
      GioiTinh: text(body, "GioiTinh", "Unisex"),
      Gia: num(body, "Gia"),
      GiaCu: nullableNum(body, "GiaCu"),
      TonKho: num(body, "TonKho"),
      TrangThai: text(body, "TrangThai", "active"),
      HinhAnh: text(body, "HinhAnh"),
      DanhSachAnh: nullableText(body, "DanhSachAnh"),
      MoTaNgan: nullableText(body, "MoTaNgan"),
      MoTaChiTiet: text(body, "MoTaChiTiet"),
      MaSanPham: sku,
      Slug: nullableText(body, "Slug"),
      ...(creating ? { Menu: nullableText(body, "Menu") } : {}),
      BoSuuTapId: nullableNum(body, "BoSuuTapId"),
      MetaTitle: nullableText(body, "MetaTitle"),
      MetaDescription: nullableText(body, "MetaDescription"),
      LaSanPhamMoi: bool(body, "LaSanPhamMoi"),
      DangGiamGia: bool(body, "DangGiamGia"),
      BanChayNhat: bool(body, "BanChayNhat"),
      ...(creating ? { DiemDanhGia: num(body, "DiemDanhGia"), SoLuongDaBan: num(body, "SoLuongDaBan") } : {}),
      DanhSachMau: nullableText(body, "DanhSachMau"),
      DanhSachSize: nullableText(body, "DanhSachSize"),
      BienThe: nullableText(body, "BienThe"),
      ThongSoKyThuat: nullableText(body, "ThongSoKyThuat"),
      ...(creating ? { NgayTao: new Date() } : { NgayCapNhat: new Date() }),
    };
  }

  @Get()
  async all(
    @CurrentUser() user: AuthenticatedUser,
    @Query("search") search?: string,
    @Query("category") category?: string,
    @Query("status") status?: string,
    @Query("page") rawPage?: string,
    @Query("pageSize") rawPageSize?: string,
  ) {
    assertStaffPermission(user, "products.view");
    const { page, pageSize, offset } = pageValues(rawPage, rawPageSize);
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (search?.trim()) { clauses.push("(TenSanPham LIKE ? OR MaSanPham LIKE ? OR MaVach LIKE ? OR ThuongHieu LIKE ?)"); params.push(...Array(4).fill(`%${search.trim()}%`)); }
    if (category?.trim()) { clauses.push("DanhMuc=?"); params.push(category.trim()); }
    if (status?.trim()) { clauses.push("TrangThai=?"); params.push(status.trim()); }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const totals = await this.prisma.$queryRawUnsafe<Array<{ total: unknown }>>(`SELECT COUNT(*) AS total FROM SanPham ${where}`, ...params);
    const rows = await this.prisma.$queryRawUnsafe<JsonRecord[]>(`SELECT * FROM SanPham ${where} ORDER BY NgayTao DESC LIMIT ? OFFSET ?`, ...params, pageSize, offset);
    return { items: jsonRows(rows), total: Number(totals[0]?.total ?? 0), page, pageSize };
  }

  @Get("attribute-options")
  async attributeOptions(@CurrentUser() user: AuthenticatedUser) {
    assertStaffPermission(user,"products.view");
    return jsonRows(await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT Id,TenThuocTinh,GiaTri,NhomThuocTinh,ThuTu,NgayTao FROM ThuocTinhSanPham WHERE NhomThuocTinh IN ('brand','volume','weight','flavor','unit') ORDER BY ThuTu,Id"));
  }

  @Get(":id")
  one(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string) { assertStaffPermission(user, "products.view"); return selectById(this.prisma, "SanPham", intPath(rawId)); }

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: JsonRecord) {
    assertStaffPermission(user, "products.create");
    return this.prisma.$transaction(async (tx) => {
      const values=this.values(body,true);
      await this.checkUnique(tx,values);
      const id = await insertRow(tx, "SanPham", values);
      return selectById(tx, "SanPham", id);
    });
  }

  @Put(":id")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string, @Body() body: JsonRecord) {
    assertStaffPermission(user, "products.update");
    return this.prisma.$transaction(async tx => {
      const id=intPath(rawId);
      const row=(await tx.$queryRawUnsafe<JsonRecord[]>("SELECT * FROM SanPham WHERE Id=? FOR UPDATE",id))[0];
      if(!row) throw new NotFoundException();
      const values=this.values(body);
      if(bodyValue(body,"TonKho")===undefined) delete values.TonKho;
      else if(Number(values.TonKho)!==Number(row.TonKho)) await assertUntrackedInventory(tx,id);
      await this.checkUnique(tx,values,id);
      return updateRow(tx,"SanPham",id,values);
    });
  }

  private async checkUnique(tx: import("../../common/sql-client.js").SqlClient,values:Record<string,unknown>,id=0){
    const rows=await tx.$queryRawUnsafe<JsonRecord[]>("SELECT Id FROM SanPham WHERE Id<>? AND (MaSanPham=? OR (MaVach IS NOT NULL AND MaVach=?)) LIMIT 1",id,values.MaSanPham,values.MaVach??null);
    if(rows.length)throw new BadRequestException("Mã sản phẩm hoặc mã vạch đã tồn tại.");
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string) { assertStaffPermission(user, "products.delete"); await this.prisma.$transaction(async tx=>{const id=intPath(rawId);await tx.$queryRawUnsafe("SELECT Id FROM SanPham WHERE Id=? FOR UPDATE",id);await assertUntrackedInventory(tx,id);await deleteRow(tx,"SanPham",id);}); }
}

@Controller("api/admin/reports")
@UseGuards(JwtAuthGuard)
export class AdminReportsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("dashboard")
  async dashboard(@CurrentUser() user: AuthenticatedUser) {
    assertStaffPermission(user, "dashboard.view");
    const today=vietnamDate(), soon=addDays(today,30);
    const rows = await this.prisma.$queryRawUnsafe<JsonRecord[]>(
      `SELECT
        (SELECT COUNT(*) FROM SanPham) AS totalProducts,
        (SELECT COUNT(*) FROM DonHang) AS totalOrders,
        (SELECT COUNT(*) FROM NguoiDung WHERE VaiTro='user') AS totalCustomers,
        COALESCE((SELECT SUM(TongTien) FROM DonHang WHERE TrangThai='completed'),0) AS totalRevenue,
        (SELECT COUNT(*) FROM DonHang WHERE TrangThai='pending') AS pendingOrders,
        (SELECT COUNT(*) FROM SanPham WHERE TonKho<=5 AND TrangThai='active') AS lowStockProducts,
        0 AS pendingReviews,
        (SELECT COUNT(*) FROM LoHang WHERE TrangThai='active' AND SoLuongCon>0 AND HanSuDung<=?) AS expiredLots,
        (SELECT COUNT(*) FROM LoHang WHERE TrangThai='active' AND SoLuongCon>0 AND HanSuDung>? AND HanSuDung<=?) AS expiringLots`,today,today,soon,
    );
    return jsonValue(rows[0] ?? {});
  }

  @Get("milkshop-finance")
  async finance(@CurrentUser() user:AuthenticatedUser,@Query("days") rawDays="30"){
    assertStaffPermission(user,"reports.view");
    const days=Math.max(1,Math.min(3650,Math.floor(Number(rawDays)||30)));
    const today=vietnamDate(),from=new Date(Date.parse(addDays(today,1-days)+"T00:00:00+07:00")),until=new Date(Date.parse(addDays(today,1)+"T00:00:00+07:00"));
    const [sales,cost,expired,discarded,top]=await Promise.all([
      this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT COALESCE(SUM(TongTien),0) AS revenue,COUNT(*) AS orders FROM DonHang WHERE KenhBan='pos' AND TrangThai='completed' AND NgayTao>=? AND NgayTao<?",from,until),
      this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT COALESCE(SUM(b.SoLuong*b.GiaNhap),0) AS cost FROM PhanBoLoBan b JOIN ChiTietDonHang c ON c.Id=b.ChiTietDonHangId JOIN DonHang d ON d.Id=c.DonHangId WHERE d.KenhBan='pos' AND d.TrangThai='completed' AND d.NgayTao>=? AND d.NgayTao<?",from,until),
      this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT COALESCE(SUM(SoLuongCon*GiaNhap),0) AS value,COALESCE(SUM(SoLuongCon),0) AS quantity,COUNT(*) AS lots FROM LoHang WHERE TrangThai='active' AND SoLuongCon>0 AND HanSuDung<=?",today),
      this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT COALESCE(SUM(SoLuongHuy*GiaNhap),0) AS value,COALESCE(SUM(SoLuongHuy IS NULL),0) AS unknownLots FROM LoHang WHERE TrangThai='discarded' AND NgayHuy>=? AND NgayHuy<?",from,until),
      this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT c.SanPhamId,MAX(c.TenSanPham) AS TenSanPham,SUM(c.SoLuong) AS quantity,SUM(c.SoLuong*c.DonGia) AS revenue FROM ChiTietDonHang c JOIN DonHang d ON d.Id=c.DonHangId WHERE d.KenhBan='pos' AND d.TrangThai='completed' AND d.NgayTao>=? AND d.NgayTao<? GROUP BY c.SanPhamId ORDER BY revenue DESC LIMIT 10",from,until)
    ]);
    const revenue=Number(sales[0]?.revenue??0),costOfGoods=Number(cost[0]?.cost??0);
    return {revenue,costOfGoods,grossProfit:revenue-costOfGoods,orders:Number(sales[0]?.orders??0),expiredValue:Number(expired[0]?.value??0),expiredQuantity:Number(expired[0]?.quantity??0),expiredLots:Number(expired[0]?.lots??0),discardedValue:Number(discarded[0]?.value??0),unknownDiscardedLots:Number(discarded[0]?.unknownLots??0),topProducts:jsonRows(top),days,today};
  }

  @Get("revenue")
  async revenue(@CurrentUser() user: AuthenticatedUser, @Query("days") rawDays = "30") {
    assertStaffPermission(user, "reports.view");
    const days = Math.max(1, Math.min(3650, Number(rawDays) || 30));
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60_000);
    return jsonRows(await this.prisma.$queryRawUnsafe<JsonRecord[]>(
      `SELECT DATE(NgayTao) AS date, SUM(TongTien) AS revenue, COUNT(*) AS orders
       FROM DonHang WHERE TrangThai='completed' AND NgayTao>=?
       GROUP BY DATE(NgayTao) ORDER BY date`, fromDate,
    ));
  }

  @Get("top-products")
  async topProducts(@CurrentUser() user: AuthenticatedUser, @Query("count") rawCount = "10", @Query("days") rawDays = "30") {
    assertStaffPermission(user, "reports.view");
    const count = Math.max(1, Math.min(100, Number(rawCount) || 10));
    const days = Math.max(1, Math.min(3650, Number(rawDays) || 30));
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60_000);
    return jsonRows(await this.prisma.$queryRawUnsafe<JsonRecord[]>(
      `SELECT p.Id, p.TenSanPham, p.MaSanPham, p.HinhAnh, p.Gia,
              SUM(ct.SoLuong) AS SoLuongDaBan, SUM(ct.SoLuong*ct.DonGia) AS Revenue, p.TonKho
       FROM ChiTietDonHang ct
       JOIN DonHang d ON d.Id=ct.DonHangId
       LEFT JOIN SanPham p ON p.Id=ct.SanPhamId
       WHERE d.TrangThai='completed' AND d.NgayTao>=?
       GROUP BY p.Id, p.TenSanPham, p.MaSanPham, p.HinhAnh, p.Gia, p.TonKho
       ORDER BY SoLuongDaBan DESC LIMIT ?`, fromDate, count,
    ));
  }

  @Get("order-stats")
  async orderStats(@CurrentUser() user: AuthenticatedUser, @Query("days") rawDays = "30") {
    assertStaffPermission(user, "reports.view");
    const days = Math.max(1, Math.min(3650, Number(rawDays) || 30));
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60_000);
    return jsonRows(await this.prisma.$queryRawUnsafe<JsonRecord[]>(
      `SELECT TrangThai AS status, COUNT(*) AS count, SUM(TongTien) AS total
       FROM DonHang WHERE NgayTao>=?
       GROUP BY TrangThai`, fromDate,
    ));
  }
}
