import { BadRequestException, Body, ConflictException, Controller, Get, NotFoundException, ServiceUnavailableException, Param, Post, Query, UseGuards } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { CurrentUser } from "../../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/authenticated-user.js";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard.js";
import type { SqlClient } from "../../common/sql-client.js";
import { PrismaService } from "../../database/prisma.service.js";
import { assertStaffPermission } from "../identity/staff-permissions.js";
import { AdminStaffGuard } from "./admin-staff.guard.js";
import { bodyValue, intPath, insertRow, jsonRows, jsonValue, num, pageValues, text, type JsonRecord } from "./admin-utils.js";
import { missingMilkshopColumns } from "../../migration/milkshop-schema-columns.js";
import { addDays, vietnamDate } from "./milkshop-lot-utils.js";

const lotState = "CASE WHEN l.TrangThai<>'active' THEN l.TrangThai WHEN l.SoLuongCon=0 THEN 'empty' WHEN l.HanSuDung<=? THEN 'expired' WHEN l.HanSuDung<=? THEN 'expiring' ELSE 'available' END";

@Controller("api/admin/lots")
@UseGuards(JwtAuthGuard, AdminStaffGuard)
export class AdminLotsController {
 constructor(private readonly prisma:PrismaService) {}
 @Get()
 async list(@CurrentUser() user:AuthenticatedUser,@Query("search") search?:string,@Query("status") status?:string,@Query("page") rawPage?:string,@Query("pageSize") rawSize?:string) {
  assertStaffPermission(user,"inventory.view");
  const today=vietnamDate(),soon=addDays(today,30),{page,pageSize,offset}=pageValues(rawPage,rawSize);
  const from="FROM LoHang l JOIN SanPham p ON p.Id=l.SanPhamId JOIN ChiTietPhieuNhap c ON c.Id=l.ChiTietPhieuNhapId JOIN PhieuNhap n ON n.Id=c.PhieuNhapId";
  const clauses:string[]=[],params:unknown[]=[];
  if(search?.trim()){clauses.push("(l.MaLo LIKE ? OR p.TenSanPham LIKE ? OR p.MaSanPham LIKE ?)");params.push(...Array(3).fill("%"+search.trim()+"%"));}
  if(status==="attention"){clauses.push("l.TrangThai='active' AND l.SoLuongCon>0 AND l.HanSuDung<=?");params.push(soon);}
  else if(status&&status!=="all"){
   if(!["available","expiring","expired","empty","discarded","cancelled"].includes(status))throw new BadRequestException("Trạng thái lô không hợp lệ.");
   clauses.push("("+lotState+")=?");params.push(today,soon,status);
  }
  const where=clauses.length?" WHERE "+clauses.join(" AND "):"";
  const counts=await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT COUNT(*) AS total "+from+where,...params);
  const rows=await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT l.Id,l.SanPhamId,l.MaLo,DATE_FORMAT(l.NgaySanXuat,'%Y-%m-%d') AS NgaySanXuat,DATE_FORMAT(l.HanSuDung,'%Y-%m-%d') AS HanSuDung,l.SoLuongNhap,l.SoLuongCon,l.GiaNhap,l.LyDoHuy,p.TenSanPham,p.MaSanPham,n.MaPhieu,("+lotState+") AS Status "+from+where+" ORDER BY l.HanSuDung,l.Id LIMIT ? OFFSET ?",today,soon,...params,pageSize,offset);
  const summary=await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT COUNT(*) AS total,COALESCE(SUM(CASE WHEN TrangThai='active' AND SoLuongCon>0 AND HanSuDung<=? THEN 1 ELSE 0 END),0) AS expired,COALESCE(SUM(CASE WHEN TrangThai='active' AND SoLuongCon>0 AND HanSuDung>? AND HanSuDung<=? THEN 1 ELSE 0 END),0) AS expiring FROM LoHang",today,today,soon);
  return {items:jsonRows(rows),total:Number(counts[0]?.total??0),page,pageSize,summary:jsonValue(summary[0]),today};
 }
 @Post(":id/discard")
 async discard(@CurrentUser() user:AuthenticatedUser,@Param("id") rawId:string,@Body() body:JsonRecord) {
  assertStaffPermission(user,"inventory.manage");
  const id=intPath(rawId),reason=text(body,"LyDo").trim();
  if(!reason||reason.length>300)throw new BadRequestException("Nhập lý do hủy (1–300 ký tự).");
  return this.prisma.$transaction(async tx=>{
   const hint=(await tx.$queryRawUnsafe<JsonRecord[]>("SELECT SanPhamId FROM LoHang WHERE Id=?",id))[0];
   if(!hint)throw new NotFoundException();
   const productId=Number(hint.SanPhamId);
   const p=(await tx.$queryRawUnsafe<JsonRecord[]>("SELECT * FROM SanPham WHERE Id=? FOR UPDATE",productId))[0];
   const l=(await tx.$queryRawUnsafe<JsonRecord[]>("SELECT *,DATE_FORMAT(HanSuDung,'%Y-%m-%d') AS Hsd FROM LoHang WHERE Id=? FOR UPDATE",id))[0];
   if(!p||!l)throw new NotFoundException();
   const quantity=Number(l.SoLuongCon),before=Number(p.TonKho),after=before-quantity;
   if(l.TrangThai!=="active"||quantity<=0||String(l.Hsd)>vietnamDate())throw new BadRequestException("Chỉ hủy lô hết hạn và còn tồn.");
   if(after<Number(p.SoLuongDaGiu??0))throw new ConflictException("Tồn kho không khớp. Kiểm tra trước khi hủy.");
   const now=new Date();
   await tx.$executeRawUnsafe("UPDATE LoHang SET SoLuongHuy=SoLuongCon,SoLuongCon=0,TrangThai='discarded',LyDoHuy=?,NguoiHuy=?,NgayHuy=? WHERE Id=?",reason,user.name,now,id);
   await tx.$executeRawUnsafe("UPDATE SanPham SET TonKho=?,TrangThai=CASE WHEN ?=0 AND TrangThai<>'draft' THEN 'out-of-stock' ELSE TrangThai END,NgayCapNhat=? WHERE Id=?",after,after,now,productId);
   await insertRow(tx,"TonKho_LichSu",{SanPhamId:productId,TenSanPham:String(p.TenSanPham),LoaiThayDoi:"export",SoLuong:quantity,TonKhoTruoc:before,TonKhoSau:after,GhiChu:("Hủy lô "+String(l.MaLo)+": "+reason).slice(0,300),NguoiThucHien:user.name,NgayTao:now});
   return {id,quantity,remaining:after};
  });
 }
}
async function invoice(tx:SqlClient,id:number){
 const row=(await tx.$queryRawUnsafe<JsonRecord[]>("SELECT Id,MaDonHang,TenNguoiNhan,TamTinh,GiamGia,TongTien,PhuongThucThanhToan,TienKhachDua,NgayTao,NhanVienPOSId FROM DonHang WHERE Id=? AND KenhBan='pos'",id))[0];
 if(!row)throw new NotFoundException("Không tìm thấy hóa đơn tại quầy.");
 const items=await tx.$queryRawUnsafe<JsonRecord[]>("SELECT Id,SanPhamId,TenSanPham,DonGia,SoLuong FROM ChiTietDonHang WHERE DonHangId=? ORDER BY Id",id);
 return {...(jsonValue(row) as JsonRecord),items:jsonRows(items),tienThua:Math.max(0,Number(row.TienKhachDua??row.TongTien)-Number(row.TongTien))};
}
@Controller("api/admin/pos")
@UseGuards(JwtAuthGuard, AdminStaffGuard)
export class AdminPosController {
 constructor(private readonly prisma:PrismaService) {}
 @Get("products")
 async products(@CurrentUser() user:AuthenticatedUser,@Query("search") search?:string,@Query("page") rawPage?:string) {
  assertStaffPermission(user,"orders.update_status");
  const {page,pageSize,offset}=pageValues(rawPage,"30"),q="%"+(search??"").trim()+"%",today=vietnamDate();
  try {
  const rows=await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT p.Id,p.TenSanPham,p.MaSanPham,p.MaVach,p.Gia,p.DonViTinh,p.HinhAnh,CASE WHEN p.TrangThai='active' THEN GREATEST(0,LEAST(p.TonKho-p.SoLuongDaGiu,COALESCE((SELECT SUM(l.SoLuongCon) FROM LoHang l WHERE l.SanPhamId=p.Id AND l.TrangThai='active' AND l.HanSuDung>?),0))) ELSE 0 END AS CoTheBan FROM SanPham p WHERE p.TrangThai IN ('active','out-of-stock') AND (p.TenSanPham LIKE ? OR p.MaSanPham LIKE ? OR p.MaVach LIKE ?) ORDER BY p.TenSanPham,p.Id LIMIT ? OFFSET ?",today,q,q,q,pageSize,offset);
  const count=await this.prisma.$queryRawUnsafe<JsonRecord[]>("SELECT COUNT(*) AS total FROM SanPham WHERE TrangThai IN ('active','out-of-stock') AND (TenSanPham LIKE ? OR MaSanPham LIKE ? OR MaVach LIKE ? )",q,q,q);
  return {items:jsonRows(rows),total:Number(count[0]?.total??0),page,pageSize};
  } catch (error) {
   const missing=await missingMilkshopColumns(this.prisma).catch(()=>[] as string[]);
   if(missing.length) throw new ServiceUnavailableException("CSDL MilkShop chưa cập nhật đầy đủ: "+missing.join(", ")+". Import migration lots_pos và catalog_reports theo README.");
   throw error;
  }
 }
 @Get("sales/:id")
 async getInvoice(@CurrentUser() user:AuthenticatedUser,@Param("id") rawId:string){
  assertStaffPermission(user,"orders.view");return invoice(this.prisma,intPath(rawId));
 }
 @Post("sales")
 async sell(@CurrentUser() user:AuthenticatedUser,@Body() body:JsonRecord) {
  assertStaffPermission(user,"orders.update_status");
  const requestId=text(body,"RequestId").trim(),method=text(body,"PhuongThucThanhToan"),name=text(body,"TenKhach","Khách lẻ").trim()||"Khách lẻ";
  const discount=num(body,"GiamGia",0),cash=num(body,"TienKhachDua",-1),raw=bodyValue(body,"Items");
  if(!/^[a-zA-Z0-9_-]{16,64}$/.test(requestId)||!["cash","bank"].includes(method)||name.length>100||!Number.isSafeInteger(discount)||discount<0||!Number.isSafeInteger(cash)||cash<0||!Array.isArray(raw)||raw.length===0||raw.length>100)throw new BadRequestException("Thông tin thanh toán hoặc giỏ hàng không hợp lệ.");
  const quantities=new Map<number,number>();
  for(const item of raw){
   if(!item||typeof item!=="object"||Array.isArray(item))throw new BadRequestException("Dòng hàng không hợp lệ.");
   const id=num(item,"SanPhamId",-1),qty=num(item,"SoLuong",-1);
   if(!Number.isSafeInteger(id)||id<=0||!Number.isSafeInteger(qty)||qty<=0||qty>100000)throw new BadRequestException("Số lượng hoặc mã sản phẩm không hợp lệ.");
   quantities.set(id,(quantities.get(id)??0)+qty);
  }
  const entries=[...quantities.entries()].sort((a,b)=>a[0]-b[0]);
  const hash=createHash("sha256").update(JSON.stringify({entries,method,name,discount,cash})).digest("hex");
  return this.prisma.$transaction(async tx=>{
   const existing=(await tx.$queryRawUnsafe<JsonRecord[]>("SELECT Id,NhanVienPOSId,HashYeuCauPOS FROM DonHang WHERE MaYeuCauPOS=?",requestId))[0];
   if(existing){if(Number(existing.NhanVienPOSId)!==user.id||existing.HashYeuCauPOS!==hash)throw new ConflictException("Mã yêu cầu đã được sử dụng.");return invoice(tx,Number(existing.Id));}
   const guest=(await tx.$queryRawUnsafe<JsonRecord[]>("SELECT Id FROM NguoiDung WHERE Email='pos-guest@milkshop.invalid' AND VaiTro='pos_guest' AND TrangThai=0"))[0];
   if(!guest)throw new ConflictException("Chưa khởi tạo khách lẻ kỹ thuật. Chạy migration.");
   const today=vietnamDate(),now=new Date();
   const lines:{product:JsonRecord;id:number;qty:number;price:number;alloc:{id:number;qty:number;cost:number}[]}[]=[];
   let subtotal=0;
   for(const [id,qty] of entries){
    const product=(await tx.$queryRawUnsafe<JsonRecord[]>("SELECT * FROM SanPham WHERE Id=? FOR UPDATE",id))[0];
    if(!product||product.TrangThai!=="active"||qty>Number(product.TonKho)-Number(product.SoLuongDaGiu??0))throw new BadRequestException("Sản phẩm không đủ tồn khả dụng: "+id);
    const lots=await tx.$queryRawUnsafe<JsonRecord[]>("SELECT Id,SoLuongCon,GiaNhap FROM LoHang WHERE SanPhamId=? AND TrangThai='active' AND SoLuongCon>0 AND HanSuDung>? ORDER BY HanSuDung,Id FOR UPDATE",id,today);
    const alloc:{id:number;qty:number;cost:number}[]=[];let left=qty;
    for(const lot of lots){const take=Math.min(left,Number(lot.SoLuongCon));if(take>0)alloc.push({id:Number(lot.Id),qty:take,cost:Number(lot.GiaNhap)});left-=take;if(left===0)break;}
    if(left>0)throw new BadRequestException("Không đủ lô còn hạn của "+String(product.TenSanPham));
    const price=Number(product.Gia);if(!Number.isSafeInteger(price)||price<0)throw new ConflictException("Giá bán không hợp lệ.");
    subtotal+=price*qty;lines.push({product,id,qty,price,alloc});
   }
   if(!Number.isSafeInteger(subtotal)||discount>subtotal)throw new BadRequestException("Giảm giá vượt tổng tiền hoặc tổng tiền không hợp lệ.");
   const total=subtotal-discount;
   if(cash<total||(method==="bank"&&cash!==total))throw new BadRequestException("Số tiền thanh toán không đủ hoặc không khớp.");
   const code="POS-"+randomUUID().replaceAll("-","").slice(0,24);
   const orderId=await insertRow(tx,"DonHang",{MaDonHang:code,NguoiDungId:Number(guest.Id),TenNguoiNhan:name,SoDienThoai:"",Email:"",DiaChiGiao:"Tại cửa hàng",TamTinh:subtotal,GiamGia:discount,TongTien:total,PhuongThucThanhToan:method,TrangThai:"completed",NgayHoanThanh:now,NgayThanhToan:now,NgayTao:now,KenhBan:"pos",MaYeuCauPOS:requestId,HashYeuCauPOS:hash,NhanVienPOSId:user.id,TienKhachDua:cash});
   for(const line of lines){
    const detail=await insertRow(tx,"ChiTietDonHang",{DonHangId:orderId,SanPhamId:line.id,TenSanPham:String(line.product.TenSanPham),HinhAnhSP:String(line.product.HinhAnh??""),DonGia:line.price,KichCo:"",MauSac:"",SoLuong:line.qty});
    for(const lot of line.alloc){await tx.$executeRawUnsafe("UPDATE LoHang SET SoLuongCon=SoLuongCon-? WHERE Id=?",lot.qty,lot.id);await insertRow(tx,"PhanBoLoBan",{ChiTietDonHangId:detail,LoHangId:lot.id,SoLuong:lot.qty,GiaNhap:lot.cost});}
    const before=Number(line.product.TonKho),after=before-line.qty;
    await tx.$executeRawUnsafe("UPDATE SanPham SET TonKho=?,SoLuongDaBan=SoLuongDaBan+?,TrangThai=CASE WHEN ?=0 THEN 'out-of-stock' ELSE TrangThai END,NgayCapNhat=? WHERE Id=?",after,line.qty,after,now,line.id);
    await insertRow(tx,"TonKho_LichSu",{SanPhamId:line.id,TenSanPham:String(line.product.TenSanPham),LoaiThayDoi:"export",SoLuong:line.qty,TonKhoTruoc:before,TonKhoSau:after,GhiChu:"Bán tại quầy "+code,NguoiThucHien:user.name,DonHangId:orderId,NgayTao:now});
   }
   await insertRow(tx,"LichSuThanhToan",{DonHangId:orderId,PhuongThuc:method,SoTien:total,TrangThai:"paid",GhiChu:"Thanh toán xác nhận tại quầy",NgayTao:now});
   return invoice(tx,orderId);
  },{timeout:30000});
 }
}
