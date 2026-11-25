import {
  BadRequestException,
  Body,
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
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { CurrentUser } from "../../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/authenticated-user.js";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard.js";
import { PrismaService } from "../../database/prisma.service.js";
import { assertStaffPermission } from "../identity/staff-permissions.js";
import {
  bool,
  date,
  deleteRow,
  insertRow,
  intPath,
  jsonRows,
  nullableNum,
  nullableText,
  num,
  pageValues,
  selectById,
  text,
  updateRow,
  type JsonRecord,
} from "./admin-utils.js";

function permission(user: AuthenticatedUser, name: string): void {
  assertStaffPermission(user, name);
}

@Controller("api/admin/promotions")
@UseGuards(JwtAuthGuard)
export class AdminPromotionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async all(@CurrentUser() user: AuthenticatedUser) {
    permission(user, "promotions.manage");
    return jsonRows(await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT * FROM KhuyenMai ORDER BY NgayTao DESC"));
  }

  private values(body: JsonRecord, creating = false) {
    return {
      TenKhuyenMai: text(body, "TenKhuyenMai"),
      LoaiGiamGia: text(body, "LoaiGiamGia", "percent"),
      GiaTri: num(body, "GiaTri"),
      ApDungCho: text(body, "ApDungCho", "all"),
      DanhMucApDung: nullableText(body, "DanhMucApDung"),
      SanPhamApDung: nullableText(body, "SanPhamApDung"),
      NgayBatDau: date(body, "NgayBatDau"),
      NgayKetThuc: date(body, "NgayKetThuc"),
      TrangThai: bool(body, "TrangThai", true),
      ...(creating ? { NgayTao: date(body, "NgayTao", new Date()) } : {}),
    };
  }

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: JsonRecord) {
    permission(user, "promotions.manage");
    return this.prisma.$transaction(async (tx) => {
      const id = await insertRow(tx, "KhuyenMai", this.values(body, true));
      return selectById(tx, "KhuyenMai", id);
    });
  }

  @Put(":id")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string, @Body() body: JsonRecord) {
    permission(user, "promotions.manage");
    return updateRow(this.prisma, "KhuyenMai", intPath(rawId), this.values(body));
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string) {
    permission(user, "promotions.manage");
    await deleteRow(this.prisma, "KhuyenMai", intPath(rawId));
  }
}

@Controller("api/admin/settings")
@UseGuards(JwtAuthGuard)
export class AdminSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async all(@CurrentUser() user: AuthenticatedUser, @Query("group") group?: string) {
    permission(user, "settings.view");
    const rows = group?.trim()
      ? await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT * FROM CauHinhCuaHang WHERE NhomCauHinh=? ORDER BY NhomCauHinh, MaCauHinh", group.trim())
      : await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT * FROM CauHinhCuaHang ORDER BY NhomCauHinh, MaCauHinh");
    return jsonRows(rows);
  }

  @Get(":key")
  async one(@CurrentUser() user: AuthenticatedUser, @Param("key") key: string) {
    permission(user, "settings.view");
    const rows = await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT * FROM CauHinhCuaHang WHERE MaCauHinh=? LIMIT 1", key);
    if (!rows[0]) throw new NotFoundException();
    return jsonRows(rows)[0];
  }

  @Put()
  async upsert(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    permission(user, "settings.manage");
    if (!Array.isArray(body)) throw new BadRequestException({ error: "Danh sách cấu hình không hợp lệ." });
    await this.prisma.$transaction(async (tx) => {
      for (const item of body as JsonRecord[]) {
        const key = text(item, "MaCauHinh").trim();
        if (!key) throw new BadRequestException({ error: "MaCauHinh không được để trống." });
        const rows = await tx.$queryRawUnsafe<Array<{ Id: unknown }>>("SELECT Id FROM CauHinhCuaHang WHERE MaCauHinh=? LIMIT 1 FOR UPDATE", key);
        if (rows[0]) {
          await tx.$executeRawUnsafe("UPDATE CauHinhCuaHang SET GiaTri=?, NgayCapNhat=? WHERE Id=?", text(item, "GiaTri"), new Date(), Number(rows[0].Id));
        } else {
          await insertRow(tx, "CauHinhCuaHang", {
            MaCauHinh: key,
            GiaTri: text(item, "GiaTri"),
            NhomCauHinh: text(item, "NhomCauHinh", "general") || "general",
            MoTa: nullableText(item, "MoTa"),
            NgayCapNhat: new Date(),
          });
        }
      }
    });
    return { message: "Đã lưu cấu hình" };
  }
}

@Controller("api/admin/suppliers")
@UseGuards(JwtAuthGuard)
export class AdminSuppliersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async all(
    @CurrentUser() user: AuthenticatedUser,
    @Query("search") search?: string,
    @Query("active") rawActive?: string,
  ) {
    permission(user, "suppliers.view");
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (search?.trim()) {
      clauses.push("(TenNhaCungCap LIKE ? OR MaNhaCungCap LIKE ?)");
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }
    if (rawActive !== undefined) {
      const normalized = rawActive.toLowerCase();
      if (normalized === "true" || normalized === "false") {
        clauses.push("TrangThai=?");
        params.push(normalized === "true" ? 1 : 0);
      }
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    return jsonRows(await this.prisma.$queryRawUnsafe<JsonRecord[]>(`SELECT * FROM NhaCungCap ${where} ORDER BY TenNhaCungCap`, ...params));
  }

  @Get(":id")
  one(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string) {
    permission(user, "suppliers.view");
    return selectById(this.prisma, "NhaCungCap", intPath(rawId));
  }

  private values(body: JsonRecord, creating = false) {
    const name = text(body, "TenNhaCungCap").trim();
    if (!name) throw new BadRequestException({ error: "Tên nhà cung cấp không được để trống." });
    return {
      TenNhaCungCap: name,
      MaNhaCungCap: nullableText(body, "MaNhaCungCap")?.trim() || null,
      NguoiLienHe: nullableText(body, "NguoiLienHe")?.trim() || null,
      SoDienThoai: nullableText(body, "SoDienThoai")?.trim() || null,
      Email: nullableText(body, "Email")?.trim() || null,
      DiaChi: nullableText(body, "DiaChi")?.trim() || null,
      MaSoThue: nullableText(body, "MaSoThue")?.trim() || null,
      GhiChu: nullableText(body, "GhiChu")?.trim() || null,
      TrangThai: bool(body, "TrangThai", true),
      ...(creating ? { NgayTao: new Date() } : { NgayCapNhat: new Date() }),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: JsonRecord) {
    permission(user, "suppliers.manage");
    return this.prisma.$transaction(async (tx) => {
      const id = await insertRow(tx, "NhaCungCap", this.values(body, true));
      return selectById(tx, "NhaCungCap", id);
    });
  }

  @Put(":id")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string, @Body() body: JsonRecord) {
    permission(user, "suppliers.manage");
    return updateRow(this.prisma, "NhaCungCap", intPath(rawId), this.values(body));
  }

  @Delete(":id")
  async remove(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string, @Res() res: Response) {
    permission(user, "suppliers.manage");
    const id = intPath(rawId);
    await selectById(this.prisma, "NhaCungCap", id);
    const used = await this.prisma.$queryRawUnsafe<Array<{ used: unknown }>>("SELECT EXISTS(SELECT 1 FROM PhieuNhap WHERE NhaCungCapId=? LIMIT 1) AS used", id);
    if (Number(used[0]?.used ?? 0)) {
      await this.prisma.$executeRawUnsafe("UPDATE NhaCungCap SET TrangThai=0, NgayCapNhat=? WHERE Id=?", new Date(), id);
      return res.status(HttpStatus.OK).json({ message: "Nhà cung cấp đã được dùng — đã chuyển sang trạng thái ngừng hoạt động.", disabled: true });
    }
    await this.prisma.$executeRawUnsafe("DELETE FROM NhaCungCap WHERE Id=?", id);
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
