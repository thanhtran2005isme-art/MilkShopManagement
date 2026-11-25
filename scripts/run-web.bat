@echo off
setlocal EnableExtensions
chcp 65001 >nul
title MilkShop - Web Admin

for %%I in ("%~dp0..") do set "ROOT=%%~fI"
set "WEB=%ROOT%\apps\web"

if not exist "%WEB%\package.json" (
  echo [LOI] Khong tim thay apps\web\package.json
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo [LOI] Khong tim thay npm trong PATH.
  pause
  exit /b 1
)

pushd "%WEB%"
if not exist "node_modules\.bin\vite.cmd" (
  echo [SETUP] Dang cai dependencies Web Admin...
  call npm install
  if errorlevel 1 goto :error
)

echo [WEB] http://localhost:5173/admin/login
call npm run dev -- --host localhost --port 5173 --strictPort --open /admin/login
if errorlevel 1 goto :error
popd
endlocal
exit /b 0

:error
echo [LOI] Khong the khoi dong Web Admin. Kiem tra log ben tren va port 5173.
popd
pause
endlocal
exit /b 1
