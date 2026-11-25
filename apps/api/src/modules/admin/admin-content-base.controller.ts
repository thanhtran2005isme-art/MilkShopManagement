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
import { AdminStaffGuard } from "./admin-staff.guard.js";
import {
  bodyValue,
  bool,
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

function permission(user: AuthenticatedUser, name: string): void {
  assertStaffPermission(user, name);
}

@Controller("api/admin/attributes")
@UseGuards(JwtAuthGuard)
export class AdminAttributesController {
  constructor(private readonly prisma: PrismaService) {}

  private milkValues(body:JsonRecord){
    const group=text(body,"NhomThuocTinh").trim(),value=text(body,"GiaTri").trim();
    const names:Record<string,string>={brand:"Thương hiệu",volume:"Dung tích (ml)",weight:"Khối lượng (g)",flavor:"Hương vị",unit:"Đơn vị tính"};
    const lengths:Record<string,number>={brand:150,volume:7,weight:7,flavor:100,unit:30};
    if(!Object.prototype.hasOwnProperty.call(names,group)||!value||value.length>lengths[group])throw new BadRequestException("Nhóm hoặc giá trị thuộc tính không hợp lệ.");
    if(["volume","weight"].includes(group)&&(!/^[1-9][0-9]*$/.test(value)||Number(value)>1000000))throw new BadRequestException("Giá trị phải là số nguyên dương.");
    return {TenThuocTinh:names[group],GiaTri:value,NhomThuocTinh:group,ThuTu:num(body,"ThuTu")};
  }
  @Get()
  async all(@CurrentUser() user: AuthenticatedUser, @Query("group") group?: string) {
    permission(user, "attributes.manage");
    if(group&&!["brand","volume","weight","flavor","unit"].includes(group))return [];
    const rows = group?.trim()
      ? await this.prisma.$queryRawUnsafe<JsonRecord[]>(
          "SELECT * FROM ThuocTinhSanPham WHERE NhomThuocTinh=? ORDER BY ThuTu",
          group.trim(),
        )
      : await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT * FROM ThuocTinhSanPham WHERE NhomThuocTinh IN ('brand','volume','weight','flavor','unit') ORDER BY ThuTu");
    return jsonRows(rows);
  }

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: JsonRecord) {
    permission(user, "attributes.manage");
    return this.prisma.$transaction(async (tx) => {
      const id = await insertRow(tx, "ThuocTinhSanPham", {
        ...this.milkValues(body),
        NgayTao: date(body, "NgayTao", new Date()),
      });
      return selectById(tx, "ThuocTinhSanPham", id);
    });
  }

  @Put(":id")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string, @Body() body: JsonRecord) {
    permission(user, "attributes.manage");
    return updateRow(this.prisma, "ThuocTinhSanPham", intPath(rawId), {
      ...this.milkValues(body),
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string) {
    permission(user, "attributes.manage");
    await deleteRow(this.prisma, "ThuocTinhSanPham", intPath(rawId));
  }
}

@Controller("api/admin/categories")
@UseGuards(JwtAuthGuard, AdminStaffGuard)
export class AdminCategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async all() {
    return jsonRows(await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT * FROM DanhMuc ORDER BY ThuTu"));
  }

  private values(body: JsonRecord, creating = false) {
    return {
      TenDanhMuc: text(body, "TenDanhMuc"),
      Slug: nullableText(body, "Slug"),
      MoTa: nullableText(body, "MoTa"),
      HinhAnh: nullableText(body, "HinhAnh"),
      DanhMucChaId: nullableNum(body, "DanhMucChaId"),
      ThuTu: num(body, "ThuTu"),
      TrangThai: bool(body, "TrangThai", true),
      GioiTinh: text(body, "GioiTinh", "all") || "all",
      ...(creating ? { NgayTao: date(body, "NgayTao", new Date()) } : {}),
    };
  }

  @Post()
  async create(@Body() body: JsonRecord) {
    return this.prisma.$transaction(async (tx) => {
      const id = await insertRow(tx, "DanhMuc", this.values(body, true));
      return selectById(tx, "DanhMuc", id);
    });
  }

  @Put(":id")
  update(@Param("id") rawId: string, @Body() body: JsonRecord) {
    return updateRow(this.prisma, "DanhMuc", intPath(rawId), this.values(body));
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") rawId: string) {
    await deleteRow(this.prisma, "DanhMuc", intPath(rawId));
  }
}

