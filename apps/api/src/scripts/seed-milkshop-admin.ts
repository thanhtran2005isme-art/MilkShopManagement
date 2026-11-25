import "dotenv/config";
import { PrismaService } from "../database/prisma.service.js";
import { hashPassword } from "../modules/identity/password.js";
import { RBAC_PERMISSIONS, RBAC_ROLE_PERMISSIONS } from "../migration/rbac-permission-manifest.js";

async function main(): Promise<void> {
  const email = (process.env.MILKSHOP_ADMIN_EMAIL ?? "admin@milkshop.local").trim().toLowerCase();
  const password = process.env.MILKSHOP_ADMIN_PASSWORD ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Đặt MILKSHOP_ADMIN_EMAIL hợp lệ và MILKSHOP_ADMIN_PASSWORD từ 12 ký tự, tối đa 72 byte.");
  }
  const hash = await hashPassword(password);
  const prisma = new PrismaService();
  await prisma.$connect();
  try {
    await prisma.$transaction(async (tx) => {
      for (const p of RBAC_PERMISSIONS) {
        await tx.$executeRawUnsafe("INSERT INTO QuyenHan (MaQuyen,TenQuyen,Nhom,MoTa) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE TenQuyen=VALUES(TenQuyen),Nhom=VALUES(Nhom),MoTa=VALUES(MoTa)", p.code,p.name,p.group,p.description);
      }
      await tx.$executeRawUnsafe("INSERT IGNORE INTO VaiTro (MaVaiTro,TenVaiTro,LaMacDinh,TrangThai) VALUES ('admin','Quản trị viên',1,1)");
      for (const [code, permissions] of Object.entries(RBAC_ROLE_PERMISSIONS)) {
        for (const permission of permissions) {
          await tx.$executeRawUnsafe("INSERT IGNORE INTO VaiTro_QuyenHan (VaiTroId,QuyenHanId) SELECT r.Id,q.Id FROM VaiTro r JOIN QuyenHan q ON q.MaQuyen=? WHERE r.MaVaiTro=?",permission,code);
        }
      }
      const existing = await tx.$queryRawUnsafe<Array<{ id: unknown }>>("SELECT Id AS id FROM NhanVien WHERE Email=? LIMIT 1 FOR UPDATE",email);
      if (!existing.length) {
        await tx.$executeRawUnsafe("INSERT INTO NhanVien (Email,MatKhauHash,HoTen,VaiTroId,LaSuperAdmin,TrangThai) SELECT ?,?,'Quản trị MilkShop',Id,1,1 FROM VaiTro WHERE MaVaiTro='admin'",email,hash);
        console.log("Đã tạo tài khoản Admin MilkShop.");
      } else console.log("Tài khoản đã tồn tại; không ghi đè mật khẩu hoặc quyền.");
    }, { timeout: 30000 });
  } finally { await prisma.$disconnect(); }
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Seed Admin thất bại."); process.exitCode = 1; });
