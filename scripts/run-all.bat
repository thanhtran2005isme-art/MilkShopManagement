@echo off
setlocal EnableExtensions
chcp 65001 >nul
title MilkShopManagement - Web Admin + API

set "SCRIPTS=%~dp0"
set "KAITOKID_BACKEND_MODE=node"
set "NODE_BASE_URL=http://127.0.0.1:5300"
set "VITE_NODE_API_URL=http://127.0.0.1:5300"

echo [START] Backend: http://localhost:5300
start "MilkShop - Node API" cmd /k call "%SCRIPTS%run-node-api.bat"

echo [START] Web Admin: http://localhost:5173/admin/login
start "MilkShop - Web Admin" cmd /k call "%SCRIPTS%run-web.bat"

echo [INFO] Hai tien trinh duoc khoi dong doc lap. Web khong bi chan boi health API.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPTS%wait-node-health.ps1" -BaseUrl "%NODE_BASE_URL%" -TimeoutSeconds 60
if errorlevel 1 (
  echo [WARN] Backend hoac database chua san sang. Web Admin van duoc khoi dong.
  echo [CHECK] Xem cua so Backend va Web Admin de biet loi.
  echo [CHECK] http://localhost:5300/health
  echo [CHECK] Neu thieu quyen RBAC, chay npm run backend:db:seed-admin.
  pause
  endlocal
  exit /b 1
)

echo [READY] Backend da san sang. Kiem tra cua so Web Admin de xac nhan Vite.
echo [WEB] http://localhost:5173/admin/login
endlocal
exit /b 0
