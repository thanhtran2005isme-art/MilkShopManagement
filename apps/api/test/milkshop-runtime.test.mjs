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
  assert.equal(health.json.database.actualTables, 55);
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
