$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$env:NODE_OPTIONS = ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "[*] converty-site : Build + Deploy to Cloudflare" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
if (Test-Path out) { Remove-Item out -Recurse -Force }
if (Test-Path .next) { Remove-Item .next -Recurse -Force }
Write-Host "[*] Step 1/2 : Building Next.js static export..." -ForegroundColor Cyan
node node_modules/next/dist/bin/next build
if ($LASTEXITCODE -ne 0) { Write-Host "[!] Build failed." -ForegroundColor Red; exit 1 }
Write-Host "[*] Step 2/2 : Uploading to Cloudflare Pages (baikecalc)..." -ForegroundColor Cyan
node (Join-Path $root "..\deploy_force3.mjs") baikecalc (Join-Path $root "out")
if ($LASTEXITCODE -eq 0) {
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "[SUCCESS] Deploy completed successfully!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
} else {
    Write-Host "[!] Deploy failed. Check network/proxy." -ForegroundColor Red
}
