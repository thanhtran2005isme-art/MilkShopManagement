-- Chỉ cấp quyền database MilkShop. Thay CHANGE_ME trước khi chạy bằng user quản trị MariaDB.
CREATE DATABASE IF NOT EXISTS milkshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'milkshop'@'localhost' IDENTIFIED BY 'CHANGE_ME';
GRANT ALL PRIVILEGES ON milkshop.* TO 'milkshop'@'localhost';
FLUSH PRIVILEGES;
