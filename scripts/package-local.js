#!/usr/bin/env node
/**
 * Package Converty for local/offline usage
 *
 * Creates a distributable folder with:
 * - All static files from the build
 * - Start scripts for each OS
 * - README with instructions
 *
 * Usage: node scripts/package-local.js
 */

import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const outDir = join(rootDir, "out");
const packageDir = join(rootDir, "converty-local");

console.log("📦 Packaging Converty for local usage...\n");

// Step 1: Build the project
console.log("1. Building project...");
try {
  execSync("npm run build", { cwd: rootDir, stdio: "inherit" });
} catch {
  console.error("❌ Build failed");
  process.exit(1);
}

// Step 2: Create package directory
console.log("\n2. Creating package directory...");
if (existsSync(packageDir)) {
  rmSync(packageDir, { recursive: true });
}
mkdirSync(packageDir);

// Step 3: Copy build output
console.log("3. Copying build files...");
cpSync(outDir, packageDir, { recursive: true });

// Step 4: Create start scripts
console.log("4. Creating start scripts...");

// start.sh (Mac/Linux)
const startSh = `#!/bin/bash
# Converty Local Server
# Starts a local web server to run Converty offline

PORT=\${1:-3000}
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🧮 Starting Converty on http://localhost:$PORT"
echo "   Press Ctrl+C to stop"
echo ""

# Try Python 3 first, then Python 2, then npx serve
if command -v python3 &> /dev/null; then
    cd "$DIR" && python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    cd "$DIR" && python -m SimpleHTTPServer $PORT
elif command -v npx &> /dev/null; then
    cd "$DIR" && npx serve -l $PORT
else
    echo "❌ No server found. Please install Python or Node.js"
    echo "   - Python: https://www.python.org/downloads/"
    echo "   - Node.js: https://nodejs.org/"
    exit 1
fi
`;

// start.bat (Windows CMD)
const startBat = `@echo off
:: Converty Local Server
:: Starts a local web server to run Converty offline

set PORT=%1
if "%PORT%"=="" set PORT=3000

echo Starting Converty on http://localhost:%PORT%
echo Press Ctrl+C to stop
echo.

:: Try Python first, then npx serve
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python -m http.server %PORT%
    goto :eof
)

where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    npx serve -l %PORT%
    goto :eof
)

echo ERROR: No server found. Please install Python or Node.js
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
pause
`;

// start.ps1 (Windows PowerShell)
const startPs1 = `# Converty Local Server
# Starts a local web server to run Converty offline

param([int]$Port = 3000)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Converty on http://localhost:$Port" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop"
Write-Host ""

# Try Python first
if (Get-Command python -ErrorAction SilentlyContinue) {
    Set-Location $scriptDir
    python -m http.server $Port
    exit
}

# Try npx serve
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Set-Location $scriptDir
    npx serve -l $Port
    exit
}

Write-Host "ERROR: No server found. Please install Python or Node.js" -ForegroundColor Red
Write-Host "  - Python: https://www.python.org/downloads/"
Write-Host "  - Node.js: https://nodejs.org/"
Read-Host "Press Enter to exit"
`;

// README
const readme = `# Converty Local

Run Converty offline on your computer.

## Quick Start

### Mac / Linux
\`\`\`bash
./start.sh
\`\`\`

### Windows (Command Prompt)
\`\`\`cmd
start.bat
\`\`\`

### Windows (PowerShell)
\`\`\`powershell
./start.ps1
\`\`\`

Then open http://localhost:3000 in your browser.

## Custom Port

\`\`\`bash
./start.sh 8080        # Mac/Linux
start.bat 8080         # Windows CMD
./start.ps1 -Port 8080 # PowerShell
\`\`\`

## Requirements

One of:
- Python 3.x (recommended, pre-installed on Mac/Linux)
- Node.js 18+

## What's Included

- 167+ calculators across 15 categories
- Works completely offline
- Supports English, French, German, Italian
- Dark/light mode

## More Info

- Website: https://fjacquet.github.io/converty/
- Source: https://github.com/fjacquet/converty
`;

writeFileSync(join(packageDir, "start.sh"), startSh, { mode: 0o755 });
writeFileSync(join(packageDir, "start.bat"), startBat);
writeFileSync(join(packageDir, "start.ps1"), startPs1);
writeFileSync(join(packageDir, "README.md"), readme);

// Step 5: Create ZIP (optional, if zip command available)
console.log("5. Creating ZIP archive...");
const zipPath = join(rootDir, "converty-local.zip");
try {
  if (existsSync(zipPath)) {
    rmSync(zipPath);
  }
  execSync(`cd "${rootDir}" && zip -r converty-local.zip converty-local`, {
    stdio: "pipe",
  });
  console.log(`   ✓ Created converty-local.zip`);
} catch {
  console.log("   ⚠ zip command not available, skipping archive");
}

// Done
console.log("\n✅ Package created successfully!\n");
console.log("📁 Folder: converty-local/");
if (existsSync(zipPath)) {
  console.log("📦 Archive: converty-local.zip");
}
console.log("\nTo run locally:");
console.log("  cd converty-local && ./start.sh   # Mac/Linux");
console.log("  cd converty-local && start.bat    # Windows");
