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

@Controller("api/admin/coupons")
@UseGuards(JwtAuthGuard)
export class AdminCouponsController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  async all(@CurrentUser() user: AuthenticatedUser) {
    permission(user, "coupons.manage");
    return jsonRows(await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT * FROM MaGiamGia ORDER BY NgayTao DESC"));
  }
  private values(body: JsonRecord, creating = false) {
    return {
      MaCoupon: text(body, "MaCoupon"), LoaiGiamGia: text(body, "LoaiGiamGia", "percent"),
      GiaTri: num(body, "GiaTri"), DonToiThieu: nullableNum(body, "DonToiThieu"), GiamToiDa: nullableNum(body, "GiamToiDa"),
      SoLuotDung: num(body, "SoLuotDung"), ...(creating ? { DaSuDung: num(body, "DaSuDung") } : {}),
      NgayBatDau: date(body, "NgayBatDau"), NgayKetThuc: date(body, "NgayKetThuc"),
      TrangThai: bool(body, "TrangThai", true), MoTa: nullableText(body, "MoTa"),
      ...(creating ? { NgayTao: date(body, "NgayTao", new Date()) } : {}),
    };
  }
  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: JsonRecord) {
    permission(user, "coupons.manage");
    return this.prisma.$transaction(async (tx) => {
      const id = await insertRow(tx, "MaGiamGia", this.values(body, true)); return selectById(tx, "MaGiamGia", id);
    });
  }
  @Put(":id")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string, @Body() body: JsonRecord) {
    permission(user, "coupons.manage"); return updateRow(this.prisma, "MaGiamGia", intPath(rawId), this.values(body));
  }
  @Delete(":id") @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param("id") rawId: string) {
    permission(user, "coupons.manage"); await deleteRow(this.prisma, "MaGiamGia", intPath(rawId));
  }
}

