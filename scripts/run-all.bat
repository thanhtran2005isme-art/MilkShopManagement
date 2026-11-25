@echo off
setlocal EnableExtensions
chcp 65001 >nul
title MilkShopManagement - Web + API

set "SCRIPTS=%~dp0"
set "KAITOKID_BACKEND_MODE=node"
set "NODE_BASE_URL=http://127.0.0.1:5300"
set "VITE_NODE_API_URL=http://127.0.0.1:5300"
set "VITE_CHAT_HUB_URL=http://127.0.0.1:5300"
set "VITE_CHAT_HUB_PATH=/chatHub"

start "KaitoKid - Node API" cmd /k call "%SCRIPTS%run-node-api.bat"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPTS%wait-node-health.ps1" -BaseUrl "%NODE_BASE_URL%" -TimeoutSeconds 60
if errorlevel 1 (
  echo [FAIL] Node API khong san sang. Khong khoi dong Web de tranh false-ready.
  endlocal
  exit /b 1
)

start "KaitoKid - Web" cmd /k call "%SCRIPTS%run-web.bat"

echo [READY] MilkShop Node API + Web dang chay.
endlocal
exit /b 0
