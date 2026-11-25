import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = (process.env.NODE_BASE_URL ?? "http://127.0.0.1:5300").replace(/\/+$/, "");

async function request(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.status, 200, `${path} returned HTTP ${response.status}`);
  return response;
}

test("live Node health dùng đúng MariaDB 55 tables", async () => {
  const response = await request("/health");
  const json = await response.json();
  assert.equal(json.status, "ok");
  assert.equal(json.database?.expectedTables, 55);
  assert.equal(json.database?.actualTables, 55);
  assert.deepEqual(json.database?.missingTables, []);
});

test("live catalog public trả dữ liệu qua Node", async () => {
  const response = await request("/api/products?page=1&pageSize=1");
  const json = await response.json();
  assert.ok(json !== null && json !== undefined);
});

test("API tìm kiếm ảnh đã bị gỡ khỏi runtime", async () => {
  const response = await fetch(`${baseUrl}/api/search/by-image/status`, { signal: AbortSignal.timeout(10_000) });
  assert.equal(response.status, 404);
});

test("shared apps/web/public media được serve qua Node", async () => {
  const response = await request("/images/logokaitokid.png");
  assert.match(response.headers.get("content-type") ?? "", /image\/png/i);
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert.ok(bytes.byteLength > 1000);
});

test("legacy product media fallback trả SVG thay vì 404", async () => {
  const response = await request("/products/phase11-missing-product.jpg");
  assert.match(response.headers.get("content-type") ?? "", /image\/svg\+xml/i);
  assert.match(await response.text(), /KaitoKid/);
});

test("legacy lookbook media fallback trả SVG thay vì 404", async () => {
  const response = await request("/lookbook/phase11-missing-lookbook.jpg");
  assert.match(response.headers.get("content-type") ?? "", /image\/svg\+xml/i);
  assert.match(await response.text(), /SHOP THE LOOK/);
});
