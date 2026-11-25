@echo off
setlocal EnableExtensions
chcp 65001 >nul
call "%~dp0scripts\run-all.bat"
set "EXIT_CODE=%ERRORLEVEL%"
endlocal & exit /b %EXIT_CODE%
