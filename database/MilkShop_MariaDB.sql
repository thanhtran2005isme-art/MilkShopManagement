-- MilkShopManagement: schema MariaDB 10.4+ độc lập, không DROP database.
-- Các bảng tương thích API cũ được giữ cho đến khi chuyển đổi toàn bộ luồng bán hàng.
SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS milkshop
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE milkshop;


CREATE TABLE IF NOT EXISTS NguoiDung (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    HoTen           VARCHAR(100)       NOT NULL,              
    Email           VARCHAR(200)       NOT NULL,              
    MatKhauHash     VARCHAR(500)       NOT NULL,              
    SoDienThoai     VARCHAR(20)        NULL,                  
    AnhDaiDien      VARCHAR(500)       NULL,                  
    VaiTro          VARCHAR(20)        NOT NULL DEFAULT 'user',
    RefreshToken    VARCHAR(500)       NULL,                  
    HanRefreshToken DATETIME(6)           NULL,                  
    TrangThai       TINYINT(1)                 NOT NULL DEFAULT 1,    
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    NgayCapNhat     DATETIME(6)           NULL,

    CONSTRAINT UQ_NguoiDung_Email UNIQUE (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DanhMuc (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    TenDanhMuc      VARCHAR(100)       NOT NULL,              
    Slug            VARCHAR(150)       NULL,                  
    MoTa            VARCHAR(500)       NULL,                  
    HinhAnh         VARCHAR(500)       NULL,                  
    DanhMucChaId    INT                 NULL,                  
    ThuTu           INT                 NOT NULL DEFAULT 0,    
    TrangThai       TINYINT(1)                 NOT NULL DEFAULT 1,    
    GioiTinh        VARCHAR(20)        NOT NULL DEFAULT 'all',
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_DanhMuc_Cha FOREIGN KEY (DanhMucChaId) REFERENCES DanhMuc(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS SanPham (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    TenSanPham      VARCHAR(200)       NOT NULL,              
    DanhMucId       INT                 NULL,                  
    DanhMuc         VARCHAR(100)       NOT NULL,              
    DanhMucPhu      VARCHAR(100)       NULL,                  
    PhongCach       VARCHAR(100)       NULL,                  
    NhomTuoi        VARCHAR(50)        NULL,                  
    GioiTinh        VARCHAR(20)        NOT NULL,              
    Gia             DECIMAL(18,0)       NOT NULL,              
    GiaCu           DECIMAL(18,0)       NULL,                  
    TonKho          INT                 NOT NULL DEFAULT 0,    
    TrangThai       VARCHAR(20)        NOT NULL DEFAULT 'active',
       
       
       
    HinhAnh         VARCHAR(500)       NOT NULL,              
    DanhSachAnh     LONGTEXT       NULL,                  
    MoTaNgan        VARCHAR(500)       NULL,                  
    MoTaChiTiet     LONGTEXT       NOT NULL,              
    MaSanPham       VARCHAR(50)        NOT NULL,              
    Slug            VARCHAR(200)       NULL,                  
    Menu            VARCHAR(100)       NULL,                  
    BoSuuTapId      INT                 NULL,                  
    MetaTitle       VARCHAR(200)       NULL,                  
    MetaDescription VARCHAR(500)       NULL,                  
    LaSanPhamMoi    TINYINT(1)                 NOT NULL DEFAULT 0,    
    DangGiamGia     TINYINT(1)                 NOT NULL DEFAULT 0,    
    BanChayNhat     TINYINT(1)                 NOT NULL DEFAULT 0,    
    DiemDanhGia     FLOAT               NOT NULL DEFAULT 0,    
    SoLuongDaBan    INT                 NOT NULL DEFAULT 0,    
    DanhSachMau     LONGTEXT       NULL,                  
    DanhSachSize    LONGTEXT       NULL,                  
    BienThe         LONGTEXT       NULL,                  
    ThongSoKyThuat  LONGTEXT       NULL,                  
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    NgayCapNhat     DATETIME(6)           NULL,

    CONSTRAINT UQ_SanPham_MaSP UNIQUE (MaSanPham),
    CONSTRAINT FK_SanPham_DanhMuc FOREIGN KEY (DanhMucId) REFERENCES DanhMuc(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ThuocTinhSanPham (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    TenThuocTinh    VARCHAR(100)       NOT NULL,              
    GiaTri          VARCHAR(200)       NOT NULL,              
    NhomThuocTinh   VARCHAR(100)       NULL,                  
    ThuTu           INT                 NOT NULL DEFAULT 0,
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS BoSuuTap (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    TenBoSuuTap     VARCHAR(200)       NOT NULL,              
    Slug            VARCHAR(200)       NULL,                  
    MoTa            VARCHAR(1000)      NULL,                  
    HinhAnh         VARCHAR(500)       NULL,                  
    TrangThai       TINYINT(1)                 NOT NULL DEFAULT 1,    
    ThuTu           INT                 NOT NULL DEFAULT 0,
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS GioHang (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    NguoiDungId     INT                 NOT NULL,              
    SanPhamId       INT                 NOT NULL,              
    KichCo          VARCHAR(20)        NOT NULL,              
    MauSac          VARCHAR(50)        NOT NULL,              
    SoLuong         INT                 NOT NULL DEFAULT 1,
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_GioHang_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(Id),
    CONSTRAINT FK_GioHang_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DonHang (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    MaDonHang       VARCHAR(30)        NOT NULL,              
    NguoiDungId     INT                 NOT NULL,              
    TenNguoiNhan    VARCHAR(100)       NOT NULL,              
    SoDienThoai     VARCHAR(20)        NOT NULL,              
    Email           VARCHAR(200)       NOT NULL,              
    DiaChiGiao      VARCHAR(500)       NOT NULL,              
    TinhThanh       VARCHAR(100)       NULL,                  
    QuanHuyen       VARCHAR(100)       NULL,                  
    PhuongXa        VARCHAR(100)       NULL,                  
    TamTinh         DECIMAL(18,0)       NOT NULL,              
    PhiVanChuyen    DECIMAL(18,0)       NOT NULL DEFAULT 0,    
    PhiThanhToan    DECIMAL(18,0)       NOT NULL DEFAULT 0,    
    GiamGia         DECIMAL(18,0)       NOT NULL DEFAULT 0,    
    TongTien        DECIMAL(18,0)       NOT NULL,              
    MaGiamGia       VARCHAR(50)        NULL,                  
    PhuongThucThanhToan VARCHAR(30)    NOT NULL DEFAULT 'COD',
       
       
       
       
       
    TrangThai       VARCHAR(20)        NOT NULL DEFAULT 'pending',
       
       
       
       
       
       
    GhiChu          VARCHAR(500)       NULL,                  
    GhiChuAdmin     VARCHAR(500)       NULL,                  
    NgayXacNhan     DATETIME(6)           NULL,                  
    NgayGiaoHang    DATETIME(6)           NULL,                  
    NgayHoanThanh   DATETIME(6)           NULL,                  
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    NgayCapNhat     DATETIME(6)           NULL,

    CONSTRAINT UQ_DonHang_MaDH UNIQUE (MaDonHang),
    CONSTRAINT FK_DonHang_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ChiTietDonHang (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    DonHangId       INT                 NOT NULL,
    SanPhamId       INT                 NOT NULL,
    TenSanPham      VARCHAR(200)       NOT NULL,              
    HinhAnhSP       VARCHAR(500)       NOT NULL,              
    DonGia          DECIMAL(18,0)       NOT NULL,              
    KichCo          VARCHAR(20)        NOT NULL,
    MauSac          VARCHAR(50)        NOT NULL,
    SoLuong         INT                 NOT NULL,

    CONSTRAINT FK_CTDH_DonHang FOREIGN KEY (DonHangId) REFERENCES DonHang(Id) ON DELETE CASCADE,
    CONSTRAINT FK_CTDH_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DanhSachYeuThich (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    NguoiDungId     INT                 NOT NULL,
    SanPhamId       INT                 NOT NULL,
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_YeuThich_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(Id),
    CONSTRAINT FK_YeuThich_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(Id),
    CONSTRAINT UQ_YeuThich UNIQUE (NguoiDungId, SanPhamId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DanhGia (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    SanPhamId       INT                 NOT NULL,              
    NguoiDungId     INT                 NOT NULL,              
    TenKhachHang    VARCHAR(100)       NOT NULL,              
    DonHangId       INT                 NOT NULL,              
    SoSao           INT                 NOT NULL,              
    NoiDung         VARCHAR(1000)      NOT NULL,              
    TrangThai       VARCHAR(20)        NOT NULL DEFAULT 'pending',
       
       
       
    PhanHoiAdmin    VARCHAR(500)       NULL,                  
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_DanhGia_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(Id),
    CONSTRAINT FK_DanhGia_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(Id),
    CONSTRAINT FK_DanhGia_DonHang FOREIGN KEY (DonHangId) REFERENCES DonHang(Id),
    CONSTRAINT CK_DanhGia_SoSao CHECK (SoSao >= 1 AND SoSao <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DiaChi (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    NguoiDungId     INT                 NOT NULL,
    HoTen           VARCHAR(100)       NOT NULL,              
    SoDienThoai     VARCHAR(20)        NOT NULL,              
    TinhThanh       VARCHAR(100)       NOT NULL,              
    QuanHuyen       VARCHAR(100)       NOT NULL,              
    PhuongXa        VARCHAR(100)       NOT NULL,              
    DiaChiCuThe     VARCHAR(300)       NOT NULL,              
    LaMacDinh       TINYINT(1)                 NOT NULL DEFAULT 0,    
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_DiaChi_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MaGiamGia (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    MaCoupon        VARCHAR(50)        NOT NULL,              
    LoaiGiamGia     VARCHAR(20)        NOT NULL DEFAULT 'percent',
       
       
    GiaTri          DECIMAL(18,0)       NOT NULL,              
    DonToiThieu     DECIMAL(18,0)       NULL,                  
    GiamToiDa       DECIMAL(18,0)       NULL,                  
    SoLuotDung      INT                 NOT NULL DEFAULT 0,    
    DaSuDung        INT                 NOT NULL DEFAULT 0,    
    NgayBatDau      DATETIME(6)           NOT NULL,              
    NgayKetThuc     DATETIME(6)           NOT NULL,              
    TrangThai       TINYINT(1)                 NOT NULL DEFAULT 1,    
    MoTa            VARCHAR(300)       NULL,                  
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT UQ_MaGiamGia_Ma UNIQUE (MaCoupon)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS KhuyenMai (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    TenKhuyenMai    VARCHAR(200)       NOT NULL,              
    LoaiGiamGia     VARCHAR(20)        NOT NULL DEFAULT 'percent',
    GiaTri          DECIMAL(18,0)       NOT NULL,
    ApDungCho       VARCHAR(50)        NOT NULL DEFAULT 'all',
       
       
       
    DanhMucApDung   VARCHAR(200)       NULL,                  
    SanPhamApDung   LONGTEXT       NULL,                  
    NgayBatDau      DATETIME(6)           NOT NULL,
    NgayKetThuc     DATETIME(6)           NOT NULL,
    TrangThai       TINYINT(1)                 NOT NULL DEFAULT 1,
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS FlashSale (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    TenFlashSale    VARCHAR(200)       NOT NULL,              
    NgayBatDau      DATETIME(6)           NOT NULL,
    NgayKetThuc     DATETIME(6)           NOT NULL,
    TrangThai       TINYINT(1)                 NOT NULL DEFAULT 1,
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ChiTietFlashSale (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    FlashSaleId     INT                 NOT NULL,
    SanPhamId       INT                 NOT NULL,
    GiaFlashSale    DECIMAL(18,0)       NOT NULL,              
    SoLuongGioiHan  INT                 NOT NULL DEFAULT 0,    
    DaBan           INT                 NOT NULL DEFAULT 0,    

    CONSTRAINT FK_CTFS_FlashSale FOREIGN KEY (FlashSaleId) REFERENCES FlashSale(Id) ON DELETE CASCADE,
    CONSTRAINT FK_CTFS_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Banner (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    TieuDe          VARCHAR(200)       NOT NULL,              
    TieuDePhu       VARCHAR(200)       NULL,                  
    MoTa            VARCHAR(500)       NULL,
    HinhAnh         VARCHAR(500)       NOT NULL,              
    LienKet         VARCHAR(500)       NULL,                  
    LoaiBanner      VARCHAR(30)        NOT NULL DEFAULT 'slider',
       
       
       
       
    ViTri           VARCHAR(50)        NOT NULL DEFAULT 'homepage',
       
       
       
    ThuTu           INT                 NOT NULL DEFAULT 0,
    TrangThai       VARCHAR(20)        NOT NULL DEFAULT 'active',
    NgayBatDau      DATETIME(6)           NULL,
    NgayKetThuc     DATETIME(6)           NULL,
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Lookbook (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    TieuDe          VARCHAR(200)       NOT NULL,              
    TieuDePhu       VARCHAR(200)       NULL,
    MoTa            VARCHAR(1000)      NULL,
    HinhAnh         VARCHAR(500)       NOT NULL,              
    LienKet         VARCHAR(500)       NULL,                  
    TrangThai       VARCHAR(20)        NOT NULL DEFAULT 'active',
    ThuTu           INT                 NOT NULL DEFAULT 0,
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS TonKho_LichSu (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    SanPhamId       INT                 NOT NULL,
    LoaiThayDoi     VARCHAR(20)        NOT NULL,
       
       
       
       
    SoLuong         INT                 NOT NULL,              
    TonKhoTruoc     INT                 NOT NULL,              
    TonKhoSau       INT                 NOT NULL,              
    GhiChu          VARCHAR(300)       NULL,                  
    NguoiThucHien   VARCHAR(100)       NULL,                  
    DonHangId       INT                 NULL,                  
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_TonKho_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(Id),
    CONSTRAINT FK_TonKho_DonHang FOREIGN KEY (DonHangId) REFERENCES DonHang(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CanhBaoTonKho (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    SanPhamId       INT                 NOT NULL,
    NguongCanhBao   INT                 NOT NULL DEFAULT 5,    
    TonKhoHienTai   INT                 NOT NULL,
    TrangThai       VARCHAR(20)        NOT NULL DEFAULT 'active',
       
       
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    NgayXuLy        DATETIME(6)           NULL,

    CONSTRAINT FK_CanhBao_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS TrangTinh (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    TieuDe          VARCHAR(200)       NOT NULL,              
    Slug            VARCHAR(200)       NOT NULL,              
    NoiDung         LONGTEXT       NOT NULL,              
    TrangThai       VARCHAR(20)        NOT NULL DEFAULT 'published',
       
       
    MetaTitle       VARCHAR(200)       NULL,
    MetaDescription VARCHAR(500)       NULL,
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    NgayCapNhat     DATETIME(6)           NULL,

    CONSTRAINT UQ_TrangTinh_Slug UNIQUE (Slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MenuDieuHuong (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    TenMenu         VARCHAR(100)       NOT NULL,              
    LienKet         VARCHAR(300)       NOT NULL,              
    ViTri           VARCHAR(30)        NOT NULL DEFAULT 'header',
       
       
       
    MenuChaId       INT                 NULL,                  
    ThuTu           INT                 NOT NULL DEFAULT 0,
    TrangThai       TINYINT(1)                 NOT NULL DEFAULT 1,
    BieuTuong       VARCHAR(100)       NULL,                  
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_Menu_Cha FOREIGN KEY (MenuChaId) REFERENCES MenuDieuHuong(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CauHinhCuaHang (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    MaCauHinh       VARCHAR(100)       NOT NULL,              
    GiaTri          LONGTEXT       NOT NULL,              
    NhomCauHinh     VARCHAR(50)        NOT NULL DEFAULT 'general',
       
       
       
       
       
       
    MoTa            VARCHAR(300)       NULL,
    NgayCapNhat     DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT UQ_CauHinh_Ma UNIQUE (MaCauHinh)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CauHinhTrangChu (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    TenSection      VARCHAR(100)       NOT NULL,              
    DanhSachSPId    LONGTEXT       NULL,                  
    ThuTu           INT                 NOT NULL DEFAULT 0,
    TrangThai       TINYINT(1)                 NOT NULL DEFAULT 1,
    NgayCapNhat     DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS LichSuThanhToan (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    DonHangId       INT                 NOT NULL,
    PhuongThuc      VARCHAR(30)        NOT NULL,              
    SoTien          DECIMAL(18,0)       NOT NULL,
    TrangThai       VARCHAR(20)        NOT NULL DEFAULT 'pending',
       
       
       
       
    MaGiaoDich      VARCHAR(100)       NULL,                  
    GhiChu          VARCHAR(300)       NULL,
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_ThanhToan_DonHang FOREIGN KEY (DonHangId) REFERENCES DonHang(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ThongBao (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    NguoiDungId     INT                 NOT NULL,              
    TieuDe          VARCHAR(200)       NOT NULL,              
    NoiDung         VARCHAR(500)       NOT NULL,
    LoaiThongBao    VARCHAR(30)        NOT NULL DEFAULT 'order',
       
       
       
    DaDoc           TINYINT(1)                 NOT NULL DEFAULT 0,    
    LienKet         VARCHAR(300)       NULL,                  
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_ThongBao_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS NhatKyHoatDong (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    NguoiDungId     INT                 NOT NULL,              
    HanhDong        VARCHAR(50)        NOT NULL,              
    DoiTuong        VARCHAR(50)        NOT NULL,              
    DoiTuongId      INT                 NULL,                  
    ChiTiet         VARCHAR(500)       NULL,                  
    DiaChiIP        VARCHAR(50)        NULL,                  
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_NhatKy_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS NhaCungCap (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        TenNhaCungCap VARCHAR(255) NOT NULL DEFAULT '',
        MaNhaCungCap VARCHAR(50) NULL,
        NguoiLienHe VARCHAR(100) NULL,
        SoDienThoai VARCHAR(20) NULL,
        Email VARCHAR(100) NULL,
        DiaChi VARCHAR(500) NULL,
        MaSoThue VARCHAR(50) NULL,
        GhiChu VARCHAR(500) NULL,
        TrangThai TINYINT(1) NOT NULL DEFAULT 1,
        NgayTao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        NgayCapNhat DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PhieuNhap (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        MaPhieu VARCHAR(50) NOT NULL DEFAULT '',
        NhaCungCapId INT NULL,
        TenNhaCungCap VARCHAR(255) NULL,
        NgayNhap DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        NguoiNhap VARCHAR(100) NULL,
        TongGiaTri DECIMAL(18,0) NOT NULL DEFAULT 0,
        GhiChu VARCHAR(1000) NULL,
        TrangThai VARCHAR(20) NOT NULL DEFAULT 'done',
        NgayTao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        NgayCapNhat DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ChiTietPhieuNhap (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        PhieuNhapId INT NOT NULL,
        SanPhamId INT NOT NULL,
        TenSanPham VARCHAR(255) NOT NULL DEFAULT '',
        KichCo VARCHAR(20) NULL,
        MauSac VARCHAR(50) NULL,
        SoLuong INT NOT NULL DEFAULT 0,
        DonGiaNhap DECIMAL(18,0) NOT NULL DEFAULT 0,
        ThanhTien DECIMAL(18,0) NOT NULL DEFAULT 0,
        GhiChu VARCHAR(500) NULL,
        CONSTRAINT FK_ChiTietPhieuNhap_PhieuNhap FOREIGN KEY (PhieuNhapId)
            REFERENCES PhieuNhap(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS TonKhoBienThe (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        SanPhamId INT NOT NULL,
        KichCo VARCHAR(20) NOT NULL DEFAULT '',
        MauSac VARCHAR(50) NOT NULL DEFAULT '',
        SoLuong INT NOT NULL DEFAULT 0,
        SoLuongDaBan INT NOT NULL DEFAULT 0,
        GiaVonTrungBinh DECIMAL(18,0) NULL,
        NgayTao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        NgayCapNhat DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CuocHoiThoai (
    Id                  INT AUTO_INCREMENT   PRIMARY KEY,
    NguoiDungId         INT                 NULL,                  
    MaKhachVangLai      VARCHAR(64)        NULL,                  
    TenHienThi          VARCHAR(100)       NULL,                  
    TrangThai           VARCHAR(20)        NOT NULL DEFAULT 'bot',
       
       
       
       
    NhanVienId          INT                 NULL,                  
    SanPhamNguCanhId    INT                 NULL,                  
    TinNhanCuoi         VARCHAR(500)       NULL,                  
    ThoiGianTinCuoi     DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    SoTinChuaDocKhach   INT                 NOT NULL DEFAULT 0,    
    SoTinChuaDocNV      INT                 NOT NULL DEFAULT 0,    
    NgayTao             DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    NgayCapNhat         DATETIME(6)           NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS TinNhan (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    CuocHoiThoaiId  INT                 NOT NULL,              
    LoaiNguoiGui    VARCHAR(20)        NOT NULL,
       
       
       
    NguoiGuiId      INT                 NULL,                  
    NoiDung         LONGTEXT       NOT NULL,              
    LoaiDinhKem     VARCHAR(20)        NULL,                  
    DinhKemId       VARCHAR(50)        NULL,                  
    DinhKemJson     LONGTEXT       NULL,                  
    DaDoc           TINYINT(1)                 NOT NULL DEFAULT 0,    
    NgayTao         DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_TinNhan_CuocHoiThoai FOREIGN KEY (CuocHoiThoaiId)
        REFERENCES CuocHoiThoai(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS SanPhamEmbedding (
    Id              INT AUTO_INCREMENT   PRIMARY KEY,
    SanPhamId       INT                 NOT NULL,              
    SoChieu         INT                 NOT NULL,              
    Vector          LONGTEXT       NOT NULL,              
    Model           VARCHAR(200)       NOT NULL,              
    NguonHash       VARCHAR(100)       NOT NULL,              
    NgayCapNhat     DATETIME(6)           NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT FK_SanPhamEmbedding_SanPham FOREIGN KEY (SanPhamId)
        REFERENCES SanPham(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS LoginActivity (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        UserId INT NULL,
        Email VARCHAR(255) NOT NULL,
        Provider VARCHAR(20) NOT NULL DEFAULT 'local', 
        Ip VARCHAR(50) NULL,
        UserAgent VARCHAR(500) NULL,
        DeviceType VARCHAR(30) NULL,
        Browser VARCHAR(50) NULL,
        Os VARCHAR(50) NULL,
        Country VARCHAR(50) NULL,
        Success TINYINT(1) NOT NULL,
        FailReason VARCHAR(200) NULL,
        CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS EmailVerificationToken (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        UserId INT NOT NULL,
        Email VARCHAR(255) NOT NULL,
        Token VARCHAR(200) NOT NULL,
        ExpiresAt DATETIME(6) NOT NULL,
        VerifiedAt DATETIME(6) NULL,
        CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PendingRegistration (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        HoTen VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL,
        SoDienThoai VARCHAR(50) NULL,
        MatKhauHash VARCHAR(255) NOT NULL,
        TokenHash CHAR(64) NOT NULL,
        ExpiresAt DATETIME(6) NOT NULL,
        CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UpdatedAt DATETIME(6) NULL,
        UNIQUE KEY UX_PendingRegistration_Email (Email),
        UNIQUE KEY UX_PendingRegistration_TokenHash (TokenHash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PasswordResetToken (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        UserId INT NOT NULL,
        Email VARCHAR(255) NOT NULL,
        Token VARCHAR(200) NOT NULL,
        ExpiresAt DATETIME(6) NOT NULL,
        UsedAt DATETIME(6) NULL,
        CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CONSTRAINT FK_PRT_NguoiDung FOREIGN KEY (UserId) REFERENCES NguoiDung(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS OtpCode (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        Identifier VARCHAR(255) NOT NULL,   
        Channel VARCHAR(20) NOT NULL,       
        Purpose VARCHAR(30) NOT NULL,       
        Code VARCHAR(10) NOT NULL,
        ExpiresAt DATETIME(6) NOT NULL,
        VerifiedAt DATETIME(6) NULL,
        AttemptCount INT NOT NULL DEFAULT 0,
        CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS HomepageBlock (
        Id          INT AUTO_INCREMENT PRIMARY KEY,
        BlockType   VARCHAR(40)  NOT NULL,   
        TieuDe      VARCHAR(200) NULL,
        TieuDePhu   VARCHAR(200) NULL,
        MoTa        VARCHAR(500) NULL,
        HinhAnh     VARCHAR(500) NULL,
        LienKet     VARCHAR(500) NULL,
        Icon        VARCHAR(80)  NULL,       
        ThuTu       INT NOT NULL DEFAULT 0,
        TrangThai   TINYINT(1) NOT NULL DEFAULT 1,
        NgayTao     DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
        NgayCapNhat DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS LookbookHotspot (
        Id          INT AUTO_INCREMENT PRIMARY KEY,
        LookbookId  INT NOT NULL,
        SanPhamId   INT NOT NULL,
        ToaDoX      DECIMAL(5,2) NOT NULL, 
        ToaDoY      DECIMAL(5,2) NOT NULL, 
        GhiChu      VARCHAR(255) NULL,
        ThuTu       INT NOT NULL DEFAULT 0,
        NgayTao     DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
        CONSTRAINT FK_LookbookHotspot_Lookbook FOREIGN KEY (LookbookId)
            REFERENCES Lookbook(Id) ON DELETE CASCADE,
        CONSTRAINT FK_LookbookHotspot_SanPham FOREIGN KEY (SanPhamId)
            REFERENCES SanPham(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS LichSuDiem (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        NguoiDungId INT NOT NULL,
        LoaiGiaoDich VARCHAR(20) NOT NULL, 
        SoDiem INT NOT NULL,                
        SoDuSauGiaoDich INT NOT NULL,
        DonHangId INT NULL,
        MoTa VARCHAR(500) NULL,
        NgayTao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CONSTRAINT FK_LichSuDiem_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DangKyNewsletter (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        Email VARCHAR(255) NOT NULL,
        Source VARCHAR(50) NULL,           
        VoucherCode VARCHAR(100) NULL,     
        Ip VARCHAR(50) NULL,
        UserAgent VARCHAR(500) NULL,
        SubscribedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UnsubscribedAt DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS BangSize (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        Loai VARCHAR(50) NOT NULL,        
        DanhMuc VARCHAR(100) NULL,        
        TenSize VARCHAR(20) NOT NULL,     
        Vai INT NULL,                      
        Nguc INT NULL,                     
        Eo INT NULL,                       
        Hong INT NULL,                     
        DaiAo INT NULL,                    
        DaiQuan INT NULL,                  
        ChieuCao VARCHAR(50) NULL,        
        CanNang VARCHAR(50) NULL,         
        ThuTu INT NOT NULL DEFAULT 0,
        TrangThai TINYINT(1) NOT NULL DEFAULT 1,
        NgayTao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CauHoiSanPham (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        SanPhamId INT NOT NULL,
        NguoiHoiId INT NULL,               
        TenNguoiHoi VARCHAR(100) NULL,
        CauHoi VARCHAR(1000) NOT NULL,
        TraLoi VARCHAR(2000) NULL,
        NguoiTraLoi VARCHAR(100) NULL,    
        TrangThai VARCHAR(20) NOT NULL DEFAULT 'pending', 
        LuotHuuIch INT NOT NULL DEFAULT 0,
        NgayHoi DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        NgayTraLoi DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PhienXemSanPham (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        SanPhamId INT NOT NULL,
        SessionId VARCHAR(100) NOT NULL,
        Ip VARCHAR(50) NULL,
        LastSeenAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS GioiThieu (
        Id            INT AUTO_INCREMENT PRIMARY KEY,
        NguoiMoiId    INT NOT NULL,
        NguoiGioiThieuId INT NOT NULL,
        MaCouponMoi   VARCHAR(50) NULL,
        MaCouponGT    VARCHAR(50) NULL,
        TrangThai     VARCHAR(20) NOT NULL DEFAULT 'pending',
        NgayTao       DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
        NgayThuong    DATETIME NULL,
        CONSTRAINT FK_GioiThieu_NguoiMoi FOREIGN KEY (NguoiMoiId) REFERENCES NguoiDung(Id),
        CONSTRAINT FK_GioiThieu_NguoiGT FOREIGN KEY (NguoiGioiThieuId) REFERENCES NguoiDung(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS LichSuTrangThaiVanChuyen (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        DonHangId INT NOT NULL,
        TrangThai VARCHAR(50) NOT NULL,
        MoTa VARCHAR(500) NULL,
        ViTri VARCHAR(200) NULL,
        ThoiGian DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CONSTRAINT FK_LSTTVC_DonHang FOREIGN KEY (DonHangId) REFERENCES DonHang(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS TwoFactorEnabled TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS TwoFactorSecret VARCHAR(100) NULL;
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS SoLanDangNhapSai INT NOT NULL DEFAULT 0;
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS BiKhoaDenLuc DATETIME(6) NULL;
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS EmailDaXacThuc TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS SDTDaXacThuc TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS NhaCungCap VARCHAR(20) NULL;
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS MaNhaCungCap VARCHAR(255) NULL;
ALTER TABLE TonKhoBienThe ADD COLUMN IF NOT EXISTS SoLuongDaGiu INT NOT NULL DEFAULT 0;
ALTER TABLE SanPham ADD COLUMN IF NOT EXISTS SoLuongDaGiu INT NOT NULL DEFAULT 0;
ALTER TABLE GioHang ADD COLUMN IF NOT EXISTS GiuDenLuc DATETIME(6) NULL;
ALTER TABLE Lookbook ADD COLUMN IF NOT EXISTS VideoUrl VARCHAR(500) NULL;
ALTER TABLE Lookbook ADD COLUMN IF NOT EXISTS Season VARCHAR(50) NULL;
ALTER TABLE Lookbook ADD COLUMN IF NOT EXISTS Style VARCHAR(80) NULL;
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS DiemThuong INT NOT NULL DEFAULT 0;
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS CapBac VARCHAR(20) NOT NULL DEFAULT 'Member';
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS TongChiTieu DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS NgaySinh DATE NULL;
ALTER TABLE Banner ADD COLUMN IF NOT EXISTS NutChinh VARCHAR(100) NULL;
ALTER TABLE Banner ADD COLUMN IF NOT EXISTS NutPhu VARCHAR(100) NULL;
ALTER TABLE Banner ADD COLUMN IF NOT EXISTS LinkPhu VARCHAR(500) NULL;
ALTER TABLE SanPham ADD COLUMN IF NOT EXISTS VideoUrl VARCHAR(500) NULL;
ALTER TABLE NguoiDung ADD COLUMN IF NOT EXISTS MaGioiThieu VARCHAR(20) NULL;
ALTER TABLE DanhGia ADD COLUMN IF NOT EXISTS DanhSachAnh LONGTEXT NULL;
ALTER TABLE DanhGia ADD COLUMN IF NOT EXISTS Video VARCHAR(500) NULL;
ALTER TABLE DanhGia ADD COLUMN IF NOT EXISTS KichCo VARCHAR(20) NULL;
ALTER TABLE DanhGia ADD COLUMN IF NOT EXISTS MauSac VARCHAR(50) NULL;
ALTER TABLE DanhGia ADD COLUMN IF NOT EXISTS NgayPhanHoi DATETIME(6) NULL;
ALTER TABLE DanhGia ADD COLUMN IF NOT EXISTS LuotHuuIch INT NOT NULL DEFAULT 0;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS MaVanDon VARCHAR(100) NULL;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS LinkTracking VARCHAR(500) NULL;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS TrangThaiVanChuyen VARCHAR(50) NULL;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS NhaVanChuyen VARCHAR(50) NULL;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS MaDichVuVanChuyen VARCHAR(50) NULL;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS ThoiGianGiaoDuKien INT NULL;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS NgayThanhToan DATETIME(6) NULL;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS HetHanThanhToan DATETIME(6) NULL;

SET @milkshop_fk_sql = IF(
  EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'SanPham' AND CONSTRAINT_NAME = 'FK_SanPham_BoSuuTap'),
  'SELECT 1',
  'ALTER TABLE SanPham ADD CONSTRAINT FK_SanPham_BoSuuTap FOREIGN KEY (BoSuuTapId) REFERENCES BoSuuTap(Id)'
);
PREPARE milkshop_fk_stmt FROM @milkshop_fk_sql;
EXECUTE milkshop_fk_stmt;
DEALLOCATE PREPARE milkshop_fk_stmt;


CREATE TABLE IF NOT EXISTS VaiTro (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TenVaiTro VARCHAR(100) NOT NULL,
    MaVaiTro VARCHAR(100) NOT NULL,
    MoTa VARCHAR(500) NULL,
    LaMacDinh TINYINT(1) NOT NULL DEFAULT 0,
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    NgayTao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    NgayCapNhat DATETIME(6) NULL,
    CONSTRAINT UQ_VaiTro_MaVaiTro UNIQUE (MaVaiTro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS QuyenHan (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MaQuyen VARCHAR(150) NOT NULL,
    TenQuyen VARCHAR(150) NOT NULL,
    Nhom VARCHAR(100) NOT NULL,
    MoTa VARCHAR(500) NULL,
    CONSTRAINT UQ_QuyenHan_MaQuyen UNIQUE (MaQuyen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS VaiTro_QuyenHan (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    VaiTroId INT NOT NULL,
    QuyenHanId INT NOT NULL,
    CONSTRAINT UQ_VaiTro_QuyenHan UNIQUE (VaiTroId, QuyenHanId),
    CONSTRAINT FK_VTQH_VaiTro FOREIGN KEY (VaiTroId) REFERENCES VaiTro(Id),
    CONSTRAINT FK_VTQH_QuyenHan FOREIGN KEY (QuyenHanId) REFERENCES QuyenHan(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS NhanVien (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL,
    MatKhauHash VARCHAR(500) NOT NULL,
    HoTen VARCHAR(150) NOT NULL,
    SoDienThoai VARCHAR(30) NULL,
    AnhDaiDien VARCHAR(500) NULL,
    VaiTroId INT NOT NULL,
    LaSuperAdmin TINYINT(1) NOT NULL DEFAULT 0,
    NgaySinh DATETIME(6) NULL,
    GioiTinh VARCHAR(30) NULL,
    DiaChi VARCHAR(500) NULL,
    NgayVaoLam DATETIME(6) NULL,
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    LanDangNhapCuoi DATETIME(6) NULL,
    SoLanDangNhapSai INT NOT NULL DEFAULT 0,
    BiKhoa TINYINT(1) NOT NULL DEFAULT 0,
    GhiChu VARCHAR(1000) NULL,
    NgayTao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    NgayCapNhat DATETIME(6) NULL,
    CONSTRAINT UQ_NhanVien_Email UNIQUE (Email),
    CONSTRAINT FK_NhanVien_VaiTro FOREIGN KEY (VaiTroId) REFERENCES VaiTro(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS LichSuDangNhapNV (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    NhanVienId INT NULL,
    Email VARCHAR(255) NOT NULL,
    DiaChiIP VARCHAR(64) NULL,
    UserAgent VARCHAR(1000) NULL,
    ThanhCong TINYINT(1) NOT NULL DEFAULT 0,
    LyDoThatBai VARCHAR(500) NULL,
    ThoiGian DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX IX_LichSuDangNhapNV_NhanVienId (NhanVienId),
    CONSTRAINT FK_LichSuDangNhapNV_NhanVien FOREIGN KEY (NhanVienId) REFERENCES NhanVien(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS IX_NguoiDung_Email ON NguoiDung (Email);
CREATE INDEX IF NOT EXISTS IX_NguoiDung_VaiTro ON NguoiDung (VaiTro);
CREATE UNIQUE INDEX IF NOT EXISTS IX_DanhMuc_Slug ON DanhMuc (Slug);
CREATE INDEX IF NOT EXISTS IX_SanPham_TrangThai ON SanPham (TrangThai);
CREATE INDEX IF NOT EXISTS IX_SanPham_DanhMuc ON SanPham (DanhMuc);
CREATE INDEX IF NOT EXISTS IX_SanPham_GioiTinh ON SanPham (GioiTinh);
CREATE INDEX IF NOT EXISTS IX_SanPham_Gia ON SanPham (Gia);
CREATE INDEX IF NOT EXISTS IX_SanPham_SoLuongDaBan ON SanPham (SoLuongDaBan);
CREATE UNIQUE INDEX IF NOT EXISTS IX_SanPham_Slug ON SanPham (Slug);
CREATE UNIQUE INDEX IF NOT EXISTS IX_BoSuuTap_Slug ON BoSuuTap (Slug);
CREATE INDEX IF NOT EXISTS IX_GioHang_NguoiDung ON GioHang (NguoiDungId);
CREATE INDEX IF NOT EXISTS IX_DonHang_NguoiDung ON DonHang (NguoiDungId);
CREATE INDEX IF NOT EXISTS IX_DonHang_TrangThai ON DonHang (TrangThai);
CREATE INDEX IF NOT EXISTS IX_DonHang_NgayTao ON DonHang (NgayTao);
CREATE INDEX IF NOT EXISTS IX_DonHang_MaDH ON DonHang (MaDonHang);
CREATE INDEX IF NOT EXISTS IX_CTDH_DonHang ON ChiTietDonHang (DonHangId);
CREATE INDEX IF NOT EXISTS IX_DanhGia_SanPham ON DanhGia (SanPhamId);
CREATE INDEX IF NOT EXISTS IX_DanhGia_TrangThai ON DanhGia (TrangThai);
CREATE INDEX IF NOT EXISTS IX_DiaChi_NguoiDung ON DiaChi (NguoiDungId);
CREATE INDEX IF NOT EXISTS IX_TonKho_SanPham ON TonKho_LichSu (SanPhamId);
CREATE INDEX IF NOT EXISTS IX_TonKho_NgayTao ON TonKho_LichSu (NgayTao);
CREATE INDEX IF NOT EXISTS IX_ThongBao_NguoiDung ON ThongBao (NguoiDungId, DaDoc);
CREATE INDEX IF NOT EXISTS IX_NhatKy_NgayTao ON NhatKyHoatDong (NgayTao);
CREATE INDEX IF NOT EXISTS IX_NhatKy_DoiTuong ON NhatKyHoatDong (DoiTuong, DoiTuongId);
CREATE INDEX IF NOT EXISTS IX_PhieuNhap_NgayNhap ON PhieuNhap (NgayNhap);
CREATE UNIQUE INDEX IF NOT EXISTS IX_PhieuNhap_MaPhieu ON PhieuNhap (MaPhieu);
CREATE INDEX IF NOT EXISTS IX_ChiTietPhieuNhap_PhieuNhapId ON ChiTietPhieuNhap (PhieuNhapId);
CREATE INDEX IF NOT EXISTS IX_ChiTietPhieuNhap_SanPhamId ON ChiTietPhieuNhap (SanPhamId);
CREATE INDEX IF NOT EXISTS IX_TonKhoBienThe_SanPhamId ON TonKhoBienThe (SanPhamId);
CREATE UNIQUE INDEX IF NOT EXISTS IX_TonKhoBienThe_Variant ON TonKhoBienThe (SanPhamId, KichCo, MauSac);
CREATE INDEX IF NOT EXISTS IX_CuocHoiThoai_TrangThai_ThoiGianTinCuoi ON CuocHoiThoai (TrangThai, ThoiGianTinCuoi);
CREATE INDEX IF NOT EXISTS IX_CuocHoiThoai_NguoiDungId ON CuocHoiThoai (NguoiDungId);
CREATE INDEX IF NOT EXISTS IX_CuocHoiThoai_MaKhachVangLai ON CuocHoiThoai (MaKhachVangLai);
CREATE INDEX IF NOT EXISTS IX_TinNhan_CuocHoiThoaiId ON TinNhan (CuocHoiThoaiId, Id);
CREATE UNIQUE INDEX IF NOT EXISTS IX_SanPhamEmbedding_SanPhamId ON SanPhamEmbedding (SanPhamId);
CREATE INDEX IF NOT EXISTS IX_LoginActivity_UserId ON LoginActivity (UserId);
CREATE INDEX IF NOT EXISTS IX_LoginActivity_Email ON LoginActivity (Email);
CREATE UNIQUE INDEX IF NOT EXISTS IX_EVT_Token ON EmailVerificationToken (Token);
CREATE UNIQUE INDEX IF NOT EXISTS IX_PRT_Token ON PasswordResetToken (Token);
CREATE INDEX IF NOT EXISTS IX_PRT_UserId ON PasswordResetToken (UserId);
CREATE INDEX IF NOT EXISTS IX_OtpCode_Identifier ON OtpCode (Identifier, Purpose);
CREATE INDEX IF NOT EXISTS IX_HomepageBlock_Type ON HomepageBlock (BlockType, TrangThai, ThuTu);
CREATE INDEX IF NOT EXISTS IX_LookbookHotspot_Lookbook ON LookbookHotspot (LookbookId);
CREATE INDEX IF NOT EXISTS IX_LichSuDiem_NguoiDungId ON LichSuDiem (NguoiDungId);
CREATE UNIQUE INDEX IF NOT EXISTS IX_Newsletter_Email ON DangKyNewsletter (Email);
CREATE INDEX IF NOT EXISTS IX_BangSize_Loai ON BangSize (Loai);
CREATE INDEX IF NOT EXISTS IX_QA_SanPhamId ON CauHoiSanPham (SanPhamId);
CREATE UNIQUE INDEX IF NOT EXISTS IX_PhienXem_SP_Session ON PhienXemSanPham (SanPhamId, SessionId);
CREATE INDEX IF NOT EXISTS IX_PhienXem_LastSeen ON PhienXemSanPham (LastSeenAt);
CREATE UNIQUE INDEX IF NOT EXISTS UX_NguoiDung_MaGioiThieu ON NguoiDung (MaGioiThieu);
CREATE INDEX IF NOT EXISTS IX_GioiThieu_NguoiGT ON GioiThieu (NguoiGioiThieuId, TrangThai);
CREATE INDEX IF NOT EXISTS IX_LSTTVC_DonHangId ON LichSuTrangThaiVanChuyen (DonHangId);

CREATE TABLE IF NOT EXISTS ViDienTu (
    Id              INT AUTO_INCREMENT PRIMARY KEY,
    NguoiDungId     INT NOT NULL,
    SoDuKhaDung     DECIMAL(18,0) NOT NULL DEFAULT 0,
    SoDuTamGiu      DECIMAL(18,0) NOT NULL DEFAULT 0,
    NgayTao         DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    NgayCapNhat     DATETIME(6) NULL,

    CONSTRAINT UQ_ViDienTu_NguoiDung UNIQUE (NguoiDungId),
    CONSTRAINT FK_ViDienTu_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS GiaoDichVi (
    Id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    ViId                INT NOT NULL,
    NguoiDungId         INT NOT NULL,
    Loai                VARCHAR(40) NOT NULL,
    Huong               VARCHAR(10) NOT NULL,
    SoTien              DECIMAL(18,0) NOT NULL,
    SoDuKhaDungSau      DECIMAL(18,0) NOT NULL,
    SoDuTamGiuSau       DECIMAL(18,0) NOT NULL,
    ThamChieuLoai       VARCHAR(40) NOT NULL,
    ThamChieuId         VARCHAR(100) NOT NULL,
    MoTa                VARCHAR(500) NULL,
    NgayTao             DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT UQ_GiaoDichVi_Idempotency
        UNIQUE (NguoiDungId, Loai, ThamChieuLoai, ThamChieuId),
    CONSTRAINT FK_GiaoDichVi_Vi FOREIGN KEY (ViId) REFERENCES ViDienTu(Id),
    CONSTRAINT FK_GiaoDichVi_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(Id),
    INDEX IX_GiaoDichVi_NguoiDung_NgayTao (NguoiDungId, NgayTao),
    INDEX IX_GiaoDichVi_ThamChieu (ThamChieuLoai, ThamChieuId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS YeuCauRutTien (
    Id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    NguoiDungId             INT NOT NULL,
    ViId                    INT NOT NULL,
    SoTien                  DECIMAL(18,0) NOT NULL,
    TenNganHang             VARCHAR(100) NOT NULL,
    SoTaiKhoan              VARCHAR(64) NOT NULL,
    ChuTaiKhoan             VARCHAR(150) NOT NULL,
    TrangThai               VARCHAR(20) NOT NULL DEFAULT 'pending',
    GhiChuKhach             VARCHAR(300) NULL,
    GhiChuAdmin             VARCHAR(500) NULL,
    MaThamChieuNganHang     VARCHAR(100) NULL,
    NguoiDuyet              VARCHAR(200) NULL,
    ThoiGianDuyet           DATETIME(6) NULL,
    ThoiGianHoanTat         DATETIME(6) NULL,
    NgayTao                 DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    NgayCapNhat             DATETIME(6) NULL,

    CONSTRAINT FK_YeuCauRutTien_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(Id),
    CONSTRAINT FK_YeuCauRutTien_Vi FOREIGN KEY (ViId) REFERENCES ViDienTu(Id),
    INDEX IX_YeuCauRutTien_NguoiDung_TrangThai (NguoiDungId, TrangThai),
    INDEX IX_YeuCauRutTien_TrangThai_NgayTao (TrangThai, NgayTao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE TonKho_LichSu ADD COLUMN IF NOT EXISTS TenSanPham VARCHAR(200) NOT NULL DEFAULT '' AFTER SanPhamId;
ALTER TABLE SanPham ADD COLUMN IF NOT EXISTS ThuongHieu VARCHAR(150) NULL;
ALTER TABLE SanPham ADD COLUMN IF NOT EXISTS DungTichMl INT NULL;
ALTER TABLE SanPham ADD COLUMN IF NOT EXISTS HuongVi VARCHAR(100) NULL;
ALTER TABLE SanPham ADD COLUMN IF NOT EXISTS DonViTinh VARCHAR(30) NOT NULL DEFAULT 'Hộp';
SET FOREIGN_KEY_CHECKS = 1;

-- Dữ liệu mẫu hư cấu, không chứa tài khoản/mật khẩu thật.
INSERT IGNORE INTO VaiTro (MaVaiTro, TenVaiTro, MoTa, LaMacDinh, TrangThai) VALUES
 ('admin','Quản trị viên','Quản trị hệ thống',1,1),
 ('warehouse_manager','Nhân viên kho','Nhập hàng và tồn kho',0,1),
 ('sales_staff','Nhân viên bán hàng','Đơn hàng và khách hàng',0,1);
INSERT IGNORE INTO DanhMuc (TenDanhMuc, Slug, MoTa, ThuTu, GioiTinh) VALUES
 ('Sữa tươi','sua-tuoi','Sữa tươi tiệt trùng',1,'all'),
 ('Sữa bột','sua-bot','Sữa bột dinh dưỡng',2,'all'),
 ('Sữa chua','sua-chua','Sữa chua và sản phẩm lên men',3,'all');
INSERT IGNORE INTO SanPham (TenSanPham,DanhMucId,DanhMuc,GioiTinh,Gia,TonKho,TrangThai,HinhAnh,MoTaChiTiet,MaSanPham,Slug,ThuongHieu,DungTichMl,HuongVi,DonViTinh)
 SELECT 'Sữa tươi mẫu 180ml',Id,TenDanhMuc,'Unisex',8500,0,'out-of-stock','/products/milk-demo.svg','Sản phẩm mẫu kiểm thử','MILK-001','sua-tuoi-mau-180ml','MilkShop Demo',180,'Có đường','Hộp' FROM DanhMuc WHERE Slug='sua-tuoi';
INSERT IGNORE INTO SanPham (TenSanPham,DanhMucId,DanhMuc,GioiTinh,Gia,TonKho,TrangThai,HinhAnh,MoTaChiTiet,MaSanPham,Slug,ThuongHieu,DungTichMl,HuongVi,DonViTinh)
 SELECT 'Sữa bột mẫu 400g',Id,TenDanhMuc,'Unisex',135000,0,'out-of-stock','/products/milk-demo.svg','Sản phẩm mẫu kiểm thử','MILK-002','sua-bot-mau-400g','MilkShop Demo',NULL,'Nguyên bản','Lon' FROM DanhMuc WHERE Slug='sua-bot';
INSERT IGNORE INTO CauHinhCuaHang (MaCauHinh,GiaTri,NhomCauHinh,MoTa) VALUES
 ('storeName','MilkShop','general','Tên cửa hàng'),
 ('enableCOD','true','payment','Thanh toán tiền mặt'),
 ('payosEnabled','false','payment','Tắt cổng thanh toán trực tuyến');

-- MariaDB 10.4+; chỉ chạy trên database MilkShop. Chạy lại an toàn.
USE milkshop;
ALTER TABLE ChiTietPhieuNhap ADD COLUMN IF NOT EXISTS MaLo VARCHAR(80) NULL;
ALTER TABLE ChiTietPhieuNhap ADD COLUMN IF NOT EXISTS NgaySanXuat DATE NULL;
ALTER TABLE ChiTietPhieuNhap ADD COLUMN IF NOT EXISTS HanSuDung DATE NULL;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS KenhBan VARCHAR(20) NOT NULL DEFAULT 'online';
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS MaYeuCauPOS VARCHAR(64) NULL;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS HashYeuCauPOS VARCHAR(64) NULL;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS NhanVienPOSId INT NULL;
ALTER TABLE DonHang ADD COLUMN IF NOT EXISTS TienKhachDua DECIMAL(18,0) NULL;
CREATE UNIQUE INDEX IF NOT EXISTS UQ_DonHang_MaYeuCauPOS ON DonHang(MaYeuCauPOS);
CREATE TABLE IF NOT EXISTS LoHang (
 Id INT AUTO_INCREMENT PRIMARY KEY, SanPhamId INT NOT NULL, ChiTietPhieuNhapId INT NOT NULL UNIQUE,
 MaLo VARCHAR(80) NOT NULL, NgaySanXuat DATE NOT NULL, HanSuDung DATE NOT NULL,
 SoLuongNhap INT NOT NULL, SoLuongCon INT NOT NULL, GiaNhap DECIMAL(18,0) NOT NULL,
 TrangThai VARCHAR(20) NOT NULL DEFAULT 'active', LyDoHuy VARCHAR(300) NULL, NguoiHuy VARCHAR(100) NULL, NgayHuy DATETIME(6) NULL,
 CONSTRAINT FK_LoHang_SP FOREIGN KEY (SanPhamId) REFERENCES SanPham(Id),
 CONSTRAINT FK_LoHang_ChiTiet FOREIGN KEY (ChiTietPhieuNhapId) REFERENCES ChiTietPhieuNhap(Id),
 CONSTRAINT CK_LoHang_SL CHECK (SoLuongNhap>0 AND SoLuongCon>=0 AND SoLuongCon<=SoLuongNhap),
 CONSTRAINT CK_LoHang_Ngay CHECK (NgaySanXuat<HanSuDung),
 INDEX IX_LoHang_FEFO (SanPhamId,TrangThai,HanSuDung,Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS PhanBoLoBan (
 Id INT AUTO_INCREMENT PRIMARY KEY, ChiTietDonHangId INT NOT NULL, LoHangId INT NOT NULL,
 SoLuong INT NOT NULL, GiaNhap DECIMAL(18,0) NOT NULL,
 CONSTRAINT FK_PhanBoLoBan_CTDH FOREIGN KEY (ChiTietDonHangId) REFERENCES ChiTietDonHang(Id),
 CONSTRAINT FK_PhanBoLoBan_Lo FOREIGN KEY (LoHangId) REFERENCES LoHang(Id),
 CONSTRAINT CK_PhanBoLoBan_SL CHECK (SoLuong>0),
 UNIQUE KEY UQ_PhanBoLoBan (ChiTietDonHangId,LoHangId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO NguoiDung (HoTen,Email,MatKhauHash,VaiTro,TrangThai)
VALUES ('Khách lẻ','pos-guest@milkshop.invalid','DISABLED','pos_guest',0);
