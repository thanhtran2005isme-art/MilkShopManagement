import assert from "node:assert/strict";
import test from "node:test";
import { parseMariaDbUrl } from "../dist/database/database-url.js";

const base = process.env.NODE_BASE_URL ?? "http://127.0.0.1:5300";
const email = process.env.MILKSHOP_ADMIN_EMAIL;
const password = process.env.MILKSHOP_ADMIN_PASSWORD;
async function request(path, method = "GET", data, token) {
  const headers = { ...(data === undefined ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: "Bearer " + token } : {}) };
  const response = await fetch(base + path, { method, headers, ...(data === undefined ? {} : { body: JSON.stringify(data) }), signal: AbortSignal.timeout(15000) });
  const raw = await response.text();
  return { status: response.status, json: raw ? JSON.parse(raw) : null };
}
test("database URL từ chối database nguồn và chỉ chấp nhận milkshop", () => {
  assert.throws(() => parseMariaDbUrl("mysql://user:pw@localhost:3306/kaitokid"), /milkshop/);
  assert.equal(parseMariaDbUrl("mysql://user:pw@localhost:3306/milkshop").database, "milkshop");
});
test("MariaDB thật: health, đăng nhập, quyền truy cập và CRUD sản phẩm sữa", async () => {
  assert.ok(email && password, "Cần cấu hình tài khoản QA");
  const health = await request("/health");
  assert.equal(health.status, 200);
  assert.equal(health.json.service, "MilkShopManagement API");
  assert.equal(health.json.status, "ok", JSON.stringify(health.json));
  assert.equal(health.json.database.actualTables, 57);
  assert.deepEqual(health.json.database.missingPermissions, []);
  assert.equal((await request("/api/admin/products")).status, 401);
  const login = await request("/api/auth/staff/login", "POST", { email, password });
  assert.equal(login.status, 200, JSON.stringify(login.json));
  const token = login.json.accessToken;
  assert.ok(token);
  assert.equal((await request("/api/auth/staff/me", "GET", undefined, token)).status, 200);
  assert.equal((await request("/api/admin/categories", "GET", undefined, token)).status, 200);
  assert.equal((await request("/api/admin/reports/dashboard", "GET", undefined, token)).status, 200);
  const list = await request("/api/admin/products", "GET", undefined, token);
  assert.equal(list.status, 200);
  assert.ok(list.json.items.some(x => x.maSanPham === "MILK-001"));
  const product = { tenSanPham: "Sữa kiểm thử CI", maSanPham: "QA-" + Date.now(), danhMuc: "Sữa tươi", gia: 12000, tonKho: 0, thuongHieu: "QA", dungTichMl: 180, huongVi: "Không đường", donViTinh: "Hộp" };
  assert.equal((await request("/api/admin/products", "POST", { ...product, gia: -1 }, token)).status, 400);
  assert.equal((await request("/api/admin/products", "POST", { ...product, dungTichMl: -1 }, token)).status, 400);
  const created = await request("/api/admin/products", "POST", product, token);
  assert.equal(created.status, 201, JSON.stringify(created.json));
  const id = created.json.id;
  try {
    assert.ok(id);
    assert.equal(created.json.dungTichMl, 180);
    const updated = await request("/api/admin/products/" + id, "PUT", { ...product, dungTichMl: 200 }, token);
    assert.equal(updated.status, 200, JSON.stringify(updated.json));
    assert.equal(updated.json.dungTichMl, 200);
    assert.equal((await request("/api/admin/products/" + id, "GET", undefined, token)).status, 200);
  } finally {
    if (id) assert.equal((await request("/api/admin/products/" + id, "DELETE", undefined, token)).status, 204);
  }
});

test("MariaDB: nhập hai lô, POS FEFO, lỗi vượt tồn, chống trùng, khóa hủy phiếu", async () => {
 const login=await request("/api/auth/staff/login","POST",{email,password});
 assert.equal(login.status,200);const token=login.json.accessToken;
 assert.equal((await request("/api/admin/lots")).status,401);
 const stamp=Date.now(), sku="LOT-QA-"+stamp;
 const p=await request("/api/admin/products","POST",{tenSanPham:"Sữa QA theo lô",maSanPham:sku,danhMuc:"Sữa tươi",gia:10000,tonKho:0,donViTinh:"Hộp"},token);
 assert.equal(p.status,201,JSON.stringify(p.json));const id=p.json.id;
 const today=new Date(Date.now()+7*3600000).toISOString().slice(0,10);
 const day=n=>new Date(Date.parse(today+"T00:00:00Z")+n*86400000).toISOString().slice(0,10);
 const item={sanPhamId:id,soLuong:5,donGiaNhap:6000,maLo:"QA-EARLY-"+stamp,ngaySanXuat:day(-2),hanSuDung:day(10)};
 const receipt=(items)=>request("/api/admin/stock-receipts","POST",{items},token);
 assert.equal((await receipt([{...item,hanSuDung:today}])).status,400);
 assert.equal((await receipt([{...item,maLo:""}])).status,400);
 const first=await receipt([item]);assert.equal(first.status,201,JSON.stringify(first.json));
 const second=await receipt([{...item,maLo:"QA-LATE-"+stamp,hanSuDung:day(40)}]);assert.equal(second.status,201,JSON.stringify(second.json));
 const products=await request("/api/admin/pos/products?search="+sku,"GET",undefined,token);
 assert.equal(products.json.items[0].coTheBan,10);
 const sales={requestId:"qa-sale-"+stamp,tenKhach:"Khách QA",phuongThucThanhToan:"cash",giamGia:0,tienKhachDua:60000,items:[{sanPhamId:id,soLuong:6}]};
 assert.equal((await request("/api/admin/pos/sales","POST",{...sales,requestId:"qa-over-"+stamp,items:[{sanPhamId:id,soLuong:11}]},token)).status,400);
 assert.equal((await request("/api/admin/pos/sales","POST",{...sales,requestId:"qa-short-"+stamp,tienKhachDua:1},token)).status,400);
 const sale=await request("/api/admin/pos/sales","POST",sales,token);
 assert.equal(sale.status,201,JSON.stringify(sale.json));assert.equal(sale.json.tongTien,60000);
 const duplicate=await request("/api/admin/pos/sales","POST",sales,token);assert.equal(duplicate.status,201);assert.equal(duplicate.json.id,sale.json.id);
 const lots=await request("/api/admin/lots?search="+sku,"GET",undefined,token);
 assert.equal(lots.status,200);assert.equal(lots.json.items.length,2);assert.equal(lots.json.items[0].soLuongCon,0);assert.equal(lots.json.items[1].soLuongCon,4);
 assert.equal((await request("/api/admin/lots/"+lots.json.items[1].id+"/discard","POST",{lyDo:"QA"},token)).status,400);
 assert.equal((await request("/api/admin/stock-receipts/"+first.json.id+"/cancel","POST",{},token)).status,400);
 const inv=await request("/api/admin/products/"+id,"GET",undefined,token);assert.equal(inv.json.tonKho,4);
 const invoice=await request("/api/admin/pos/sales/"+sale.json.id,"GET",undefined,token);assert.equal(invoice.status,200);assert.equal(invoice.json.items[0].soLuong,6);
 assert.equal((await request("/api/admin/orders/"+sale.json.id+"/status","PUT",{trangThai:"cancelled"},token)).status,400);
 // CI dùng DB dùng một lần; giữ hóa đơn và truy vết kho thay vì xóa dữ liệu đã bán.
});

test("MariaDB: thông tin sữa, mã vạch, thuộc tính và báo cáo giá vốn", async () => {
 const login=await request("/api/auth/staff/login","POST",{email,password});
 assert.equal(login.status,200);const token=login.json.accessToken,stamp=Date.now();
 const barcode=String(stamp).slice(-13);
 const body={tenSanPham:"Sữa bột kiểm thử",maSanPham:"QA-MILK-"+stamp,danhMuc:"Sữa bột",gia:100000,tonKho:0,thuongHieu:"QA",khoiLuongG:400,huongVi:"Vani",donViTinh:"Lon",maVach:barcode};
 assert.equal((await request("/api/admin/products","POST",{...body,khoiLuongG:-1},token)).status,400);
 assert.equal((await request("/api/admin/products","POST",{...body,maVach:"abc"},token)).status,400);
 const created=await request("/api/admin/products","POST",body,token);assert.equal(created.status,201,JSON.stringify(created.json));
 assert.equal(created.json.khoiLuongG,400);assert.equal(created.json.maVach,barcode);
 assert.equal((await request("/api/admin/products","POST",{...body,maSanPham:body.maSanPham+"-2"},token)).status,400);
 const found=await request("/api/admin/products?search="+barcode,"GET",undefined,token);assert.equal(found.status,200);assert.ok(found.json.items.some(p=>p.id===created.json.id));
 assert.equal((await request("/api/admin/attributes","POST",{tenThuocTinh:"Size",giaTri:"XL",nhomThuocTinh:"size"},token)).status,400);
 const finance=await request("/api/admin/reports/milkshop-finance?days=30","GET",undefined,token);assert.equal(finance.status,200,JSON.stringify(finance.json));
 assert.equal(finance.json.grossProfit,finance.json.revenue-finance.json.costOfGoods);
 const inv=await request("/api/admin/inventory?search="+body.maSanPham,"GET",undefined,token);assert.equal(inv.status,200);assert.equal(inv.json[0].coTheBan,0);
 assert.equal((await request("/api/admin/orders?channel=invalid","GET",undefined,token)).status,400);
 await request("/api/admin/products/"+created.json.id,"DELETE",undefined,token);
});
