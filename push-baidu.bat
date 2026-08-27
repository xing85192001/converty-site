@echo off
chcp 65001 >nul 2>&1
title baikecalc - Baidu Push
setlocal

REM Switch to script directory
cd /d "%~dp0"

REM Prefer managed node, fallback to PATH node
set "NODE="
if exist "C:\Users\admin\.workbuddy\binaries\node\versions\22.22.2\node.exe" (
  set "NODE=C:\Users\admin\.workbuddy\binaries\node\versions\22.22.2\node.exe"
) else (
  set "NODE=node"
)

echo ============================================
echo  baikecalc.com - Baidu active push
echo  Push all sitemap URLs to Baidu (data.zz.baidu.com)
echo ============================================
echo.

"%NODE%" push-baidu.mjs

echo.
echo ============================================
echo  Done. Press any key to close.
echo ============================================
pause >nul
endlocal
