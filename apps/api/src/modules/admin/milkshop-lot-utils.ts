import { BadRequestException, ConflictException } from "@nestjs/common";
import type { SqlClient } from "../../common/sql-client.js";
import { text, type JsonRecord } from "./admin-utils.js";

export function vietnamDate(now = new Date()): string {
 return new Date(now.getTime()+7*3600000).toISOString().slice(0,10);
}
export function addDays(date:string,days:number):string {
 return new Date(Date.parse(date+"T00:00:00Z")+days*86400000).toISOString().slice(0,10);
}
export function validDate(value:string):boolean {
 return /^\d{4}-\d{2}-\d{2}$/.test(value)&&value>="1900-01-01"&&value<="9999-12-31"&&Number.isFinite(Date.parse(value))&&new Date(value+"T00:00:00Z").toISOString().slice(0,10)===value;
}
export function receiptLot(item:JsonRecord,today=vietnamDate()) {
 const maLo=text(item,"MaLo").trim(),ngaySanXuat=text(item,"NgaySanXuat"),hanSuDung=text(item,"HanSuDung");
 if(!maLo||maLo.length>80||!validDate(ngaySanXuat)||!validDate(hanSuDung)||ngaySanXuat>today||ngaySanXuat>=hanSuDung||hanSuDung<=today)
  throw new BadRequestException("Mã lô bắt buộc; NSX không ở tương lai; HSD phải sau NSX và sau hôm nay.");
 return {maLo,ngaySanXuat,hanSuDung};
}
export async function assertUntrackedInventory(tx:SqlClient,productId:number) {
 const rows=await tx.$queryRawUnsafe<JsonRecord[]>("SELECT Id FROM LoHang WHERE SanPhamId=? LIMIT 1",productId);
 if(rows.length)throw new ConflictException("Sản phẩm quản lý theo lô. Dùng phiếu nhập, POS hoặc xử lý lô hàng.");
}
