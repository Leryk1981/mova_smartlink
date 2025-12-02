# Script to rebuild core-smartlink with full output
# Run this in PowerShell: .\REBUILD.ps1

Write-Host "=== Rebuilding @mova/core-smartlink ===" -ForegroundColor Cyan
Write-Host ""

# Clean dist and cache
Write-Host "1. Cleaning dist/ and cache..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "tsconfig.tsbuildinfo") { Remove-Item -Force "tsconfig.tsbuildinfo" }
Write-Host "   Done!" -ForegroundColor Green
Write-Host ""

# Build
Write-Host "2. Running TypeScript compiler..." -ForegroundColor Yellow
npx tsc
Write-Host ""

# Check results
Write-Host "3. Checking output..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Write-Host "   dist/ folder exists" -ForegroundColor Green
    $jsFiles = Get-ChildItem "dist\*.js" | Select-Object -ExpandProperty Name
    Write-Host "   JS files created:" -ForegroundColor Cyan
    foreach ($file in $jsFiles) {
        Write-Host "     - $file" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "   Content of dist/index.js:" -ForegroundColor Cyan
    Get-Content "dist\index.js"
} else {
    Write-Host "   ERROR: dist/ folder not created!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
