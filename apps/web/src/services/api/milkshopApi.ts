import {adminApiClient} from '../apiClient';
export interface Lot {id:number;sanPhamId:number;maLo:string;ngaySanXuat:string;hanSuDung:string;soLuongNhap:number;soLuongCon:number;giaNhap:number;tenSanPham:string;maSanPham:string;maPhieu:string;status:string;lyDoHuy?:string}
export interface Page<T>{items:T[];total:number;page:number;pageSize:number}
export interface LotPage extends Page<Lot>{summary:{total:number;expired:number;expiring:number};today:string}
export interface PosProduct {id:number;tenSanPham:string;maSanPham:string;maVach?:string;gia:number;donViTinh:string;hinhAnh:string;coTheBan:number}
export interface Invoice {id:number;maDonHang:string;tenNguoiNhan:string;tamTinh:number;giamGia:number;tongTien:number;phuongThucThanhToan:string;tienKhachDua:number;tienThua:number;ngayTao:string;items:{id:number;sanPhamId:number;tenSanPham:string;donGia:number;soLuong:number}[]}
export interface SaleInput {requestId:string;tenKhach:string;phuongThucThanhToan:'cash'|'bank';giamGia:number;tienKhachDua:number;items:{sanPhamId:number;soLuong:number}[]}
export const milkshopApi={
 lots:(search:string,status:string,page:number)=>adminApiClient.get<LotPage>('/api/admin/lots',{params:{search,status,page,pageSize:20}}).then(r=>r.data),
 discard:(id:number,lyDo:string)=>adminApiClient.post('/api/admin/lots/'+id+'/discard',{lyDo}).then(r=>r.data),
 products:(search:string,page:number)=>adminApiClient.get<Page<PosProduct>>('/api/admin/pos/products',{params:{search,page}}).then(r=>r.data),
 sell:(body:SaleInput)=>adminApiClient.post<Invoice>('/api/admin/pos/sales',body).then(r=>r.data),
 invoice:(id:number)=>adminApiClient.get<Invoice>('/api/admin/pos/sales/'+id).then(r=>r.data)
};
