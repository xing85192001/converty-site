@echo off
cd /d "%~dp0"
echo ==============================================
echo [*] converty-site : Build + Deploy to Cloudflare
echo ==============================================
set NODE_OPTIONS=
if exist out rmdir /s /q out
if exist .next rmdir /s /q .next
echo [*] Step 1/2 : Building Next.js static export...
node node_modules/next/dist/bin/next build
if %ERRORLEVEL% neq 0 (
    echo [!] Build failed. Aborting.
    pause
    exit /b 1
)
echo [*] Step 2/2 : Uploading to Cloudflare Pages (baikecalc)...
node "%~dp0..\deploy_force3.mjs" baikecalc "%~dp0out"
if %ERRORLEVEL% equ 0 (
    echo ==============================================
    echo [SUCCESS] Deploy completed successfully!
    echo ==============================================
) else (
    echo [!] Deploy failed. Check network/proxy settings.
)
pause
